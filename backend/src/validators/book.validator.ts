import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Judul buku wajib diisi').max(255),
  author: z.string().trim().min(1, 'Penulis wajib diisi').max(255),
  isbn: z
    .string()
    .trim()
    .transform((val) => val.replace(/[^0-9]/g, ''))
    .refine((val) => val.length === 10 || val.length === 13, {
      message: 'ISBN harus terdiri dari 10 atau 13 digit',
    }),
  publisher: z.string().trim().min(1, 'Penerbit wajib diisi').max(255),
  yearPublished: z
    .number()
    .int('Tahun terbit harus bilangan bulat')
    .min(1000, 'Tahun terbit tidak valid')
    .max(new Date().getFullYear(), 'Tahun terbit tidak boleh lebih dari tahun sekarang'),
  category: z.string().trim().min(1, 'Kategori wajib diisi').max(100),
  totalCopies: z
    .number()
    .int('Jumlah eksemplar harus bilangan bulat')
    .min(1, 'Jumlah eksemplar minimal 1'),
});

export const updateBookSchema = createBookSchema;

export const bookQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['title', 'author', 'yearPublished', 'availableCopies', 'createdAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID harus berformat UUID'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;
