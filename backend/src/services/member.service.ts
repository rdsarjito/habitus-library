import { MemberStatus } from '@prisma/client';
import memberRepository from '../repositories/member.repository';
import { CreateMemberInput, UpdateMemberInput, MemberQueryInput } from '../validators/member.validator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { NotFoundError, DuplicateEntryError, BadRequestError } from '../errors/app-error';

export class MemberService {
  async findAll(query: MemberQueryInput) {
    const pagination = parsePagination(query.page, query.perPage);

    const { data, total } = await memberRepository.findAll({
      search: query.search,
      status: query.status as MemberStatus | undefined,
      sort: query.sort,
      order: query.order,
      pagination,
    });

    return {
      data,
      meta: buildPaginationMeta(total, pagination),
    };
  }

  async findById(id: string) {
    const member = await memberRepository.findByIdWithLoanCounts(id);
    if (!member) {
      throw new NotFoundError('Anggota', id);
    }
    return member;
  }

  async create(input: CreateMemberInput) {
    // Check for duplicates
    const duplicates: { field: string; message: string }[] = [];

    const existingNumber = await memberRepository.findByMemberNumber(input.memberNumber);
    if (existingNumber) {
      duplicates.push({
        field: 'memberNumber',
        message: `Nomor anggota ${input.memberNumber} sudah terdaftar`,
      });
    }

    const existingEmail = await memberRepository.findByEmail(input.email);
    if (existingEmail) {
      duplicates.push({
        field: 'email',
        message: `Email ${input.email} sudah terdaftar`,
      });
    }

    if (duplicates.length > 0) {
      throw new DuplicateEntryError(duplicates);
    }

    return memberRepository.create(input);
  }

  async update(id: string, input: UpdateMemberInput) {
    const member = await memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError('Anggota', id);
    }

    // Check for duplicates (exclude self)
    const duplicates: { field: string; message: string }[] = [];

    const existingNumber = await memberRepository.findByMemberNumber(input.memberNumber, id);
    if (existingNumber) {
      duplicates.push({
        field: 'memberNumber',
        message: `Nomor anggota ${input.memberNumber} sudah digunakan oleh anggota lain`,
      });
    }

    const existingEmail = await memberRepository.findByEmail(input.email, id);
    if (existingEmail) {
      duplicates.push({
        field: 'email',
        message: `Email ${input.email} sudah digunakan oleh anggota lain`,
      });
    }

    if (duplicates.length > 0) {
      throw new DuplicateEntryError(duplicates);
    }

    return memberRepository.update(id, input);
  }

  async delete(id: string) {
    const member = await memberRepository.findById(id);
    if (!member) {
      throw new NotFoundError('Anggota', id);
    }

    const activeLoans = await memberRepository.countActiveLoans(id);
    if (activeLoans > 0) {
      throw new BadRequestError(
        'MEMBER_HAS_ACTIVE_LOANS',
        `Anggota "${member.name}" masih memiliki ${activeLoans} buku yang belum dikembalikan`
      );
    }

    try {
      await memberRepository.delete(id);
    } catch {
      throw new BadRequestError(
        'MEMBER_HAS_ACTIVE_LOANS',
        `Anggota "${member.name}" memiliki riwayat peminjaman dan tidak dapat dihapus`
      );
    }

    return { id: member.id, name: member.name };
  }
}

export default new MemberService();
