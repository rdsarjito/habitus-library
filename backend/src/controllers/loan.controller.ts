import { Request, Response, NextFunction } from 'express';
import loanService from '../services/loan.service';
import { sendSuccess } from '../utils/response';
import { LoanQueryInput, CreateLoanInput, ReturnLoanInput } from '../validators/loan.validator';

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals.parsedQuery || req.query) as LoanQueryInput;
    const result = await loanService.findAll(query);
    sendSuccess(res, {
      message: 'Data peminjaman berhasil diambil',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

export async function findById(req: Request, res: Response, next: NextFunction) {
  try {
    const loan = await loanService.findById(req.params.id as string);
    sendSuccess(res, {
      message: 'Detail peminjaman berhasil diambil',
      data: loan,
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateLoanInput;
    const loan = await loanService.create(input);
    sendSuccess(res, {
      statusCode: 201,
      message: 'Peminjaman berhasil dibuat',
      data: loan,
    });
  } catch (err) {
    next(err);
  }
}

export async function returnLoan(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as ReturnLoanInput;
    const result = await loanService.returnLoan(req.params.id as string, input);
    sendSuccess(res, {
      message: result.lateDays > 0
        ? `Buku berhasil dikembalikan (terlambat ${result.lateDays} hari, denda Rp ${result.fineAmount?.toLocaleString('id-ID')})`
        : 'Buku berhasil dikembalikan tepat waktu',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
