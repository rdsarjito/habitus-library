import loanRepository from '../repositories/loan.repository';
import bookRepository from '../repositories/book.repository';
import memberRepository from '../repositories/member.repository';
import { CreateLoanInput, ReturnLoanInput, LoanQueryInput } from '../validators/loan.validator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { today, calculateDueDate, calculateLateDays, calculateFine, getDisplayStatus } from '../utils/date';
import { NotFoundError, BusinessRuleError, BadRequestError } from '../errors/app-error';
import type { ErrorDetail } from '../errors/app-error';
import env from '../config/env';

export class LoanService {
  async findAll(query: LoanQueryInput) {
    const pagination = parsePagination(query.page, query.perPage);

    const { data, total } = await loanRepository.findAll({
      memberId: query.memberId,
      bookId: query.bookId,
      status: query.status,
      sort: query.sort,
      order: query.order,
      pagination,
    });

    // Add computed displayStatus to each loan
    const enrichedData = data.map((loan) => ({
      ...loan,
      displayStatus: getDisplayStatus(loan.status, loan.dueDate),
    }));

    return {
      data: enrichedData,
      meta: buildPaginationMeta(total, pagination),
    };
  }

  async findById(id: string) {
    const loan = await loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundError('Peminjaman', id);
    }

    return {
      ...loan,
      displayStatus: getDisplayStatus(loan.status, loan.dueDate),
    };
  }

  /**
   * Create a new loan.
   * Validates ALL business rules and returns ALL violations at once.
   */
  async create(input: CreateLoanInput) {
    const violations: ErrorDetail[] = [];

    // 1. Validate member exists
    const member = await memberRepository.findById(input.memberId);
    if (!member) {
      throw new NotFoundError('Anggota', input.memberId);
    }

    // 2. Validate book exists
    const book = await bookRepository.findById(input.bookId);
    if (!book) {
      throw new NotFoundError('Buku', input.bookId);
    }

    // 3. Check member is ACTIVE
    if (member.status === 'INACTIVE') {
      violations.push({
        code: 'MEMBER_INACTIVE',
        message: `Anggota "${member.name}" berstatus nonaktif dan tidak dapat meminjam buku`,
      });
    }

    // 4. Check max active loans
    const activeLoans = await loanRepository.countActiveLoansByMember(input.memberId);
    if (activeLoans >= env.MAX_ACTIVE_LOANS) {
      violations.push({
        code: 'MEMBER_MAX_LOANS_REACHED',
        message: `Anggota "${member.name}" sudah mencapai batas maksimal peminjaman (${env.MAX_ACTIVE_LOANS} buku)`,
      });
    }

    // 5. Check overdue loans
    const hasOverdue = await loanRepository.hasOverdueLoans(input.memberId);
    if (hasOverdue) {
      violations.push({
        code: 'MEMBER_HAS_OVERDUE',
        message: `Anggota "${member.name}" memiliki buku yang belum dikembalikan dan sudah melewati batas waktu`,
      });
    }

    // 6. Check book availability
    if (book.availableCopies <= 0) {
      violations.push({
        code: 'BOOK_OUT_OF_STOCK',
        message: `Buku "${book.title}" tidak tersedia (stok habis)`,
      });
    }

    // 7. Check if member already has this book
    const hasSameBook = await loanRepository.hasActiveLoanForBook(input.memberId, input.bookId);
    if (hasSameBook) {
      violations.push({
        code: 'BOOK_ALREADY_BORROWED',
        message: `Anggota "${member.name}" sudah meminjam buku "${book.title}" dan belum dikembalikan`,
      });
    }

    // Return ALL violations at once
    if (violations.length > 0) {
      throw new BusinessRuleError('Peminjaman tidak dapat dilakukan', violations);
    }

    // All checks passed — create loan with transaction
    const loanDate = today();
    const dueDate = calculateDueDate(loanDate);

    try {
      const loan = await loanRepository.createWithTransaction({
        memberId: input.memberId,
        bookId: input.bookId,
        loanDate,
        dueDate,
      });

      return {
        ...loan,
        displayStatus: 'BORROWED' as const,
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'BOOK_OUT_OF_STOCK') {
        throw new BusinessRuleError('Peminjaman tidak dapat dilakukan', [{
          code: 'BOOK_OUT_OF_STOCK',
          message: `Buku "${book.title}" tidak tersedia (race condition: stok sudah diambil)`,
        }]);
      }
      throw err;
    }
  }

  /**
   * Return a loan.
   * Calculates late days and fine amount.
   */
  async returnLoan(id: string, input: ReturnLoanInput) {
    const loan = await loanRepository.findById(id);
    if (!loan) {
      throw new NotFoundError('Peminjaman', id);
    }

    if (loan.status === 'RETURNED') {
      throw new BadRequestError(
        'LOAN_ALREADY_RETURNED',
        `Buku "${loan.book.title}" sudah dikembalikan pada ${loan.returnDate?.toISOString().split('T')[0]}`
      );
    }

    // Determine return date
    const returnDate = input.returnDate ? new Date(input.returnDate) : today();

    // Validate return date is not before loan date
    const loanDateOnly = new Date(loan.loanDate.getFullYear(), loan.loanDate.getMonth(), loan.loanDate.getDate());
    const returnDateOnly = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());

    if (returnDateOnly < loanDateOnly) {
      throw new BadRequestError(
        'INVALID_RETURN_DATE',
        'Tanggal pengembalian tidak boleh sebelum tanggal peminjaman'
      );
    }

    // Calculate late days and fine
    const lateDays = calculateLateDays(loan.dueDate, returnDate);
    const fineAmount = calculateFine(lateDays);

    try {
      const updatedLoan = await loanRepository.returnWithTransaction(id, {
        returnDate,
        lateDays,
        fineAmount,
      });

      return {
        ...updatedLoan,
        displayStatus: 'RETURNED' as const,
        lateDays,
        fineAmount,
        finePerDay: lateDays > 0 ? env.FINE_PER_DAY : null,
      };
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'LOAN_ALREADY_RETURNED') {
          throw new BadRequestError('LOAN_ALREADY_RETURNED', 'Peminjaman ini sudah dikembalikan');
        }
      }
      throw err;
    }
  }
}

export default new LoanService();
