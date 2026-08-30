import { z } from 'zod';

export const createLoanSchema = z.object({
  memberId: z.string().uuid('Member ID harus berformat UUID'),
  bookId: z.string().uuid('Book ID harus berformat UUID'),
});

export const returnLoanSchema = z.object({
  returnDate: z
    .string()
    .date('Format tanggal harus YYYY-MM-DD')
    .optional(),
});

export const loanQuerySchema = z.object({
  search: z.string().optional(),
  memberId: z.string().uuid().optional(),
  bookId: z.string().uuid().optional(),
  status: z.enum(['BORROWED', 'RETURNED', 'OVERDUE']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['loanDate', 'dueDate', 'returnDate', 'createdAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
export type ReturnLoanInput = z.infer<typeof returnLoanSchema>;
export type LoanQueryInput = z.infer<typeof loanQuerySchema>;
