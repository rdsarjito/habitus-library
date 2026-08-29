import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks (resolved before vi.mock factories) ──
const mockLoanRepo = vi.hoisted(() => ({
  findAll: vi.fn(),
  findById: vi.fn(),
  countActiveLoansByMember: vi.fn(),
  hasOverdueLoans: vi.fn(),
  hasActiveLoanForBook: vi.fn(),
  createWithTransaction: vi.fn(),
  returnWithTransaction: vi.fn(),
}));

const mockBookRepo = vi.hoisted(() => ({
  findById: vi.fn(),
}));

const mockMemberRepo = vi.hoisted(() => ({
  findById: vi.fn(),
}));

vi.mock('../../../src/config/env', () => ({
  default: {
    MAX_ACTIVE_LOANS: 3,
    LOAN_DURATION_DAYS: 14,
    FINE_PER_DAY: 1000,
  },
}));

vi.mock('../../../src/repositories/loan.repository', () => ({ default: mockLoanRepo }));
vi.mock('../../../src/repositories/book.repository', () => ({ default: mockBookRepo }));
vi.mock('../../../src/repositories/member.repository', () => ({ default: mockMemberRepo }));

import { LoanService } from '../../../src/services/loan.service';
import { NotFoundError, BusinessRuleError, BadRequestError } from '../../../src/errors/app-error';

// ── Fixtures ──
const activeMember = {
  id: 'member-1',
  name: 'Budi Santoso',
  memberNumber: 'MBR-001',
  email: 'budi@test.com',
  phone: '081',
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const inactiveMember = {
  ...activeMember,
  id: 'member-2',
  name: 'Rudi Hermawan',
  status: 'INACTIVE' as const,
};

const availableBook = {
  id: 'book-1',
  title: 'Clean Code',
  author: 'Robert C. Martin',
  isbn: '9780132350884',
  publisher: 'Prentice Hall',
  yearPublished: 2008,
  category: 'Programming',
  totalCopies: 3,
  availableCopies: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const outOfStockBook = {
  ...availableBook,
  id: 'book-2',
  title: 'Thinking, Fast and Slow',
  availableCopies: 0,
};

const borrowedLoan = {
  id: 'loan-1',
  memberId: 'member-1',
  bookId: 'book-1',
  loanDate: new Date(2026, 7, 1),
  dueDate: new Date(2026, 7, 15),
  returnDate: null,
  status: 'BORROWED' as const,
  lateDays: 0,
  fineAmount: null,
  member: { id: 'member-1', name: 'Budi Santoso', memberNumber: 'MBR-001' },
  book: { id: 'book-1', title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const returnedLoan = {
  ...borrowedLoan,
  id: 'loan-2',
  status: 'RETURNED' as const,
  returnDate: new Date(2026, 7, 14),
};

// ── Tests ──
describe('LoanService', () => {
  let service: LoanService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LoanService();
  });

  // ══════════════════════════════════
  //  createLoan
  // ══════════════════════════════════
  describe('create', () => {
    it('should create loan successfully when all rules pass', async () => {
      mockMemberRepo.findById.mockResolvedValue(activeMember);
      mockBookRepo.findById.mockResolvedValue(availableBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(0);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(false);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(false);
      mockLoanRepo.createWithTransaction.mockResolvedValue({
        ...borrowedLoan,
        member: activeMember,
        book: availableBook,
      });

      const result = await service.create({ memberId: 'member-1', bookId: 'book-1' });

      expect(result.displayStatus).toBe('BORROWED');
      expect(mockLoanRepo.createWithTransaction).toHaveBeenCalledOnce();
    });

    it('should throw NotFoundError when member does not exist', async () => {
      mockMemberRepo.findById.mockResolvedValue(null);

      await expect(service.create({ memberId: 'xxx', bookId: 'book-1' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when book does not exist', async () => {
      mockMemberRepo.findById.mockResolvedValue(activeMember);
      mockBookRepo.findById.mockResolvedValue(null);

      await expect(service.create({ memberId: 'member-1', bookId: 'xxx' }))
        .rejects.toThrow(NotFoundError);
    });

    it('should reject with MEMBER_INACTIVE when member is inactive', async () => {
      mockMemberRepo.findById.mockResolvedValue(inactiveMember);
      mockBookRepo.findById.mockResolvedValue(availableBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(0);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(false);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(false);

      try {
        await service.create({ memberId: 'member-2', bookId: 'book-1' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BusinessRuleError);
        const errors = (err as BusinessRuleError).errors;
        expect(errors.some(e => e.code === 'MEMBER_INACTIVE')).toBe(true);
      }
    });

    it('should reject with MEMBER_MAX_LOANS_REACHED when at limit (3)', async () => {
      mockMemberRepo.findById.mockResolvedValue(activeMember);
      mockBookRepo.findById.mockResolvedValue(availableBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(3);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(false);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(false);

      try {
        await service.create({ memberId: 'member-1', bookId: 'book-1' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BusinessRuleError);
        const errors = (err as BusinessRuleError).errors;
        expect(errors.some(e => e.code === 'MEMBER_MAX_LOANS_REACHED')).toBe(true);
      }
    });

    it('should reject with MEMBER_HAS_OVERDUE when member has overdue books', async () => {
      mockMemberRepo.findById.mockResolvedValue(activeMember);
      mockBookRepo.findById.mockResolvedValue(availableBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(1);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(true);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(false);

      try {
        await service.create({ memberId: 'member-1', bookId: 'book-1' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BusinessRuleError);
        const errors = (err as BusinessRuleError).errors;
        expect(errors.some(e => e.code === 'MEMBER_HAS_OVERDUE')).toBe(true);
      }
    });

    it('should reject with BOOK_OUT_OF_STOCK when no copies available', async () => {
      mockMemberRepo.findById.mockResolvedValue(activeMember);
      mockBookRepo.findById.mockResolvedValue(outOfStockBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(0);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(false);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(false);

      try {
        await service.create({ memberId: 'member-1', bookId: 'book-2' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BusinessRuleError);
        const errors = (err as BusinessRuleError).errors;
        expect(errors.some(e => e.code === 'BOOK_OUT_OF_STOCK')).toBe(true);
      }
    });

    it('should reject with BOOK_ALREADY_BORROWED when duplicate active loan', async () => {
      mockMemberRepo.findById.mockResolvedValue(activeMember);
      mockBookRepo.findById.mockResolvedValue(availableBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(1);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(false);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(true);

      try {
        await service.create({ memberId: 'member-1', bookId: 'book-1' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BusinessRuleError);
        const errors = (err as BusinessRuleError).errors;
        expect(errors.some(e => e.code === 'BOOK_ALREADY_BORROWED')).toBe(true);
      }
    });

    it('should return ALL violations at once when multiple rules fail', async () => {
      mockMemberRepo.findById.mockResolvedValue(inactiveMember);
      mockBookRepo.findById.mockResolvedValue(outOfStockBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(3);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(true);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(true);

      try {
        await service.create({ memberId: 'member-2', bookId: 'book-2' });
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BusinessRuleError);
        const errors = (err as BusinessRuleError).errors;
        expect(errors.length).toBe(5);
        expect(errors.map(e => e.code).sort()).toEqual([
          'BOOK_ALREADY_BORROWED',
          'BOOK_OUT_OF_STOCK',
          'MEMBER_HAS_OVERDUE',
          'MEMBER_INACTIVE',
          'MEMBER_MAX_LOANS_REACHED',
        ]);
      }
    });

    it('should NOT call createWithTransaction when violations exist', async () => {
      mockMemberRepo.findById.mockResolvedValue(inactiveMember);
      mockBookRepo.findById.mockResolvedValue(outOfStockBook);
      mockLoanRepo.countActiveLoansByMember.mockResolvedValue(0);
      mockLoanRepo.hasOverdueLoans.mockResolvedValue(false);
      mockLoanRepo.hasActiveLoanForBook.mockResolvedValue(false);

      try { await service.create({ memberId: 'member-2', bookId: 'book-2' }); } catch {}

      expect(mockLoanRepo.createWithTransaction).not.toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════
  //  returnLoan
  // ══════════════════════════════════
  describe('returnLoan', () => {
    it('should return book on time (lateDays=0, fineAmount=null)', async () => {
      const onTimeLoan = { ...borrowedLoan, dueDate: new Date(2026, 8, 15) };
      mockLoanRepo.findById.mockResolvedValue(onTimeLoan);
      mockLoanRepo.returnWithTransaction.mockResolvedValue({
        ...onTimeLoan,
        status: 'RETURNED',
        returnDate: new Date(2026, 8, 10),
      });

      const result = await service.returnLoan('loan-1', { returnDate: '2026-09-10' });

      expect(result.displayStatus).toBe('RETURNED');
      expect(result.lateDays).toBe(0);
      expect(result.fineAmount).toBeNull();
    });

    it('should calculate fine when returned late (6 days = Rp 6000)', async () => {
      const lateLoan = { ...borrowedLoan, dueDate: new Date(2026, 7, 15) };
      mockLoanRepo.findById.mockResolvedValue(lateLoan);
      mockLoanRepo.returnWithTransaction.mockResolvedValue({
        ...lateLoan,
        status: 'RETURNED',
        returnDate: new Date(2026, 7, 21),
      });

      const result = await service.returnLoan('loan-1', { returnDate: '2026-08-21' });

      expect(result.lateDays).toBe(6);
      expect(result.fineAmount).toBe(6000);
      expect(result.finePerDay).toBe(1000);
    });

    it('should return lateDays=0 when returned exactly on due date', async () => {
      const exactLoan = { ...borrowedLoan, dueDate: new Date(2026, 7, 15) };
      mockLoanRepo.findById.mockResolvedValue(exactLoan);
      mockLoanRepo.returnWithTransaction.mockResolvedValue({
        ...exactLoan,
        status: 'RETURNED',
        returnDate: new Date(2026, 7, 15),
      });

      const result = await service.returnLoan('loan-1', { returnDate: '2026-08-15' });

      expect(result.lateDays).toBe(0);
      expect(result.fineAmount).toBeNull();
    });

    it('should throw NotFoundError when loan does not exist', async () => {
      mockLoanRepo.findById.mockResolvedValue(null);

      await expect(service.returnLoan('xxx', {})).rejects.toThrow(NotFoundError);
    });

    it('should reject double return with LOAN_ALREADY_RETURNED', async () => {
      mockLoanRepo.findById.mockResolvedValue(returnedLoan);

      try {
        await service.returnLoan('loan-2', {});
        expect.unreachable('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestError);
        expect((err as BadRequestError).errors[0].code).toBe('LOAN_ALREADY_RETURNED');
      }
    });

    it('should NOT call returnWithTransaction for already returned loans', async () => {
      mockLoanRepo.findById.mockResolvedValue(returnedLoan);

      try { await service.returnLoan('loan-2', {}); } catch {}

      expect(mockLoanRepo.returnWithTransaction).not.toHaveBeenCalled();
    });
  });
});
