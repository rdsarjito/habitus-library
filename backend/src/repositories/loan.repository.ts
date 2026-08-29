import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { PaginationParams } from '../utils/pagination';

interface LoanFilters {
  memberId?: string;
  bookId?: string;
  status?: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  sort: string;
  order: 'asc' | 'desc';
  pagination: PaginationParams;
}

export class LoanRepository {
  async findAll(filters: LoanFilters) {
    const where: Prisma.LoanWhereInput = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters.bookId) {
      where.bookId = filters.bookId;
    }

    // Handle OVERDUE as computed filter
    if (filters.status === 'OVERDUE') {
      where.status = 'BORROWED';
      where.dueDate = { lt: today };
    } else if (filters.status === 'BORROWED') {
      where.status = 'BORROWED';
      where.dueDate = { gte: today };
    } else if (filters.status === 'RETURNED') {
      where.status = 'RETURNED';
    }

    const orderBy: Prisma.LoanOrderByWithRelationInput = {
      [filters.sort]: filters.order,
    };

    const [data, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        orderBy,
        skip: filters.pagination.skip,
        take: filters.pagination.take,
        include: {
          member: { select: { id: true, name: true, memberNumber: true } },
          book: { select: { id: true, title: true, author: true, isbn: true } },
        },
      }),
      prisma.loan.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.loan.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, name: true, memberNumber: true, email: true, phone: true } },
        book: { select: { id: true, title: true, author: true, isbn: true, category: true } },
      },
    });
  }

  /**
   * Create loan with transaction + pessimistic locking.
   * SELECT FOR UPDATE prevents race conditions on available_copies.
   */
  async createWithTransaction(data: {
    memberId: string;
    bookId: string;
    loanDate: Date;
    dueDate: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      // Lock the book row to prevent race condition
      const [book] = await tx.$queryRaw<Array<{ id: string; available_copies: number }>>`
        SELECT id, available_copies FROM books WHERE id = ${data.bookId}::uuid FOR UPDATE
      `;

      if (!book || book.available_copies <= 0) {
        throw new Error('BOOK_OUT_OF_STOCK');
      }

      // Decrement available copies
      await tx.book.update({
        where: { id: data.bookId },
        data: { availableCopies: { decrement: 1 } },
      });

      // Create loan
      const loan = await tx.loan.create({
        data: {
          memberId: data.memberId,
          bookId: data.bookId,
          loanDate: data.loanDate,
          dueDate: data.dueDate,
          status: 'BORROWED',
        },
        include: {
          member: { select: { id: true, name: true, memberNumber: true } },
          book: { select: { id: true, title: true, author: true, isbn: true } },
        },
      });

      return loan;
    });
  }

  /**
   * Return loan with transaction.
   */
  async returnWithTransaction(
    loanId: string,
    returnData: {
      returnDate: Date;
      lateDays: number;
      fineAmount: number | null;
    }
  ) {
    return prisma.$transaction(async (tx) => {
      // Get the loan
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new Error('LOAN_NOT_FOUND');
      if (loan.status === 'RETURNED') throw new Error('LOAN_ALREADY_RETURNED');

      // Update loan
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          returnDate: returnData.returnDate,
          status: 'RETURNED',
          lateDays: returnData.lateDays,
          fineAmount: returnData.fineAmount,
        },
        include: {
          member: { select: { id: true, name: true, memberNumber: true } },
          book: { select: { id: true, title: true, author: true, isbn: true } },
        },
      });

      // Increment available copies
      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableCopies: { increment: 1 } },
      });

      return updatedLoan;
    });
  }

  async countActiveLoansByMember(memberId: string): Promise<number> {
    return prisma.loan.count({
      where: { memberId, status: 'BORROWED' },
    });
  }

  async hasOverdueLoans(memberId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await prisma.loan.count({
      where: {
        memberId,
        status: 'BORROWED',
        dueDate: { lt: today },
      },
    });
    return count > 0;
  }

  async hasActiveLoanForBook(memberId: string, bookId: string): Promise<boolean> {
    const count = await prisma.loan.count({
      where: { memberId, bookId, status: 'BORROWED' },
    });
    return count > 0;
  }
}

export default new LoanRepository();
