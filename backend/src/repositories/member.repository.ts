import { Prisma, MemberStatus } from '@prisma/client';
import prisma from '../config/database';
import { PaginationParams } from '../utils/pagination';

interface MemberFilters {
  search?: string;
  status?: MemberStatus;
  sort: string;
  order: 'asc' | 'desc';
  pagination: PaginationParams;
}

export class MemberRepository {
  async findAll(filters: MemberFilters) {
    const where: Prisma.MemberWhereInput = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { memberNumber: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const orderBy: Prisma.MemberOrderByWithRelationInput = {
      [filters.sort]: filters.order,
    };

    const [data, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy,
        skip: filters.pagination.skip,
        take: filters.pagination.take,
      }),
      prisma.member.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    return prisma.member.findUnique({ where: { id } });
  }

  async findByIdWithLoanCounts(id: string) {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeLoansCount, overdueLoansCount] = await Promise.all([
      prisma.loan.count({
        where: { memberId: id, status: 'BORROWED' },
      }),
      prisma.loan.count({
        where: { memberId: id, status: 'BORROWED', dueDate: { lt: today } },
      }),
    ]);

    return { ...member, activeLoansCount, overdueLoansCount };
  }

  async findByMemberNumber(memberNumber: string, excludeId?: string) {
    return prisma.member.findFirst({
      where: {
        memberNumber,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async findByEmail(email: string, excludeId?: string) {
    return prisma.member.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
  }

  async create(data: Prisma.MemberCreateInput) {
    return prisma.member.create({ data });
  }

  async update(id: string, data: Prisma.MemberUpdateInput) {
    return prisma.member.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.member.delete({ where: { id } });
  }

  async countActiveLoans(memberId: string): Promise<number> {
    return prisma.loan.count({
      where: { memberId, status: 'BORROWED' },
    });
  }
}

export default new MemberRepository();
