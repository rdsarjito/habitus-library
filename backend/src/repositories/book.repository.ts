import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { PaginationParams } from '../utils/pagination';

interface BookFilters {
  search?: string;
  category?: string;
  sort: string;
  order: 'asc' | 'desc';
  pagination: PaginationParams;
}

export class BookRepository {
  async findAll(filters: BookFilters) {
    const where: Prisma.BookWhereInput = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { author: { contains: filters.search, mode: 'insensitive' } },
        { isbn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    const orderBy: Prisma.BookOrderByWithRelationInput = {
      [filters.sort]: filters.order,
    };

    const [data, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip: filters.pagination.skip,
        take: filters.pagination.take,
      }),
      prisma.book.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.book.findUnique({ where: { id } });
  }

  async findByIsbn(isbn: string, excludeId?: string) {
    return prisma.book.findFirst({
      where: {
        isbn,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async create(data: Prisma.BookCreateInput) {
    return prisma.book.create({ data });
  }

  async update(id: string, data: Prisma.BookUpdateInput) {
    return prisma.book.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.book.delete({ where: { id } });
  }

  async countActiveLoans(bookId: string): Promise<number> {
    return prisma.loan.count({
      where: { bookId, status: 'BORROWED' },
    });
  }

  async getCategories(): Promise<string[]> {
    const result = await prisma.book.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return result.map((r) => r.category);
  }
}

export default new BookRepository();
