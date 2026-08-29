import { z } from 'zod';

export const createMemberSchema = z.object({
  memberNumber: z.string().trim().min(1, 'Nomor anggota wajib diisi').max(50),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(255),
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .max(255)
    .email('Format email tidak valid')
    .transform((val) => val.toLowerCase()),
  phone: z.string().trim().min(1, 'Nomor telepon wajib diisi').max(20),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
});

export const updateMemberSchema = z.object({
  memberNumber: z.string().trim().min(1, 'Nomor anggota wajib diisi').max(50),
  name: z.string().trim().min(1, 'Nama wajib diisi').max(255),
  email: z
    .string()
    .trim()
    .min(1, 'Email wajib diisi')
    .max(255)
    .email('Format email tidak valid')
    .transform((val) => val.toLowerCase()),
  phone: z.string().trim().min(1, 'Nomor telepon wajib diisi').max(20),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const memberQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  perPage: z.coerce.number().int().min(1).max(100).optional().default(10),
  sort: z.enum(['name', 'memberNumber', 'email', 'status', 'createdAt']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type MemberQueryInput = z.infer<typeof memberQuerySchema>;
