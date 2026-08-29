import { Request, Response, NextFunction } from 'express';
import memberService from '../services/member.service';
import { sendSuccess } from '../utils/response';
import { MemberQueryInput, CreateMemberInput, UpdateMemberInput } from '../validators/member.validator';

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals.parsedQuery || req.query) as MemberQueryInput;
    const result = await memberService.findAll(query);
    sendSuccess(res, {
      message: 'Data anggota berhasil diambil',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

export async function findById(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await memberService.findById(req.params.id as string);
    sendSuccess(res, {
      message: 'Detail anggota berhasil diambil',
      data: member,
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateMemberInput;
    const member = await memberService.create(input);
    sendSuccess(res, {
      statusCode: 201,
      message: 'Anggota berhasil ditambahkan',
      data: member,
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateMemberInput;
    const member = await memberService.update(req.params.id as string, input);
    sendSuccess(res, {
      message: 'Anggota berhasil diperbarui',
      data: member,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await memberService.delete(req.params.id as string);
    sendSuccess(res, {
      message: 'Anggota berhasil dihapus',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
