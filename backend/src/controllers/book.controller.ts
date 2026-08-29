import { Request, Response, NextFunction } from 'express';
import bookService from '../services/book.service';
import { sendSuccess } from '../utils/response';
import { BookQueryInput, CreateBookInput, UpdateBookInput } from '../validators/book.validator';

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = (res.locals.parsedQuery || req.query) as BookQueryInput;
    const result = await bookService.findAll(query);
    sendSuccess(res, {
      message: 'Data buku berhasil diambil',
      data: result.data,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
}

export async function findById(req: Request, res: Response, next: NextFunction) {
  try {
    const book = await bookService.findById(req.params.id as string);
    sendSuccess(res, {
      message: 'Detail buku berhasil diambil',
      data: book,
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as CreateBookInput;
    const book = await bookService.create(input);
    sendSuccess(res, {
      statusCode: 201,
      message: 'Buku berhasil ditambahkan',
      data: book,
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as UpdateBookInput;
    const book = await bookService.update(req.params.id as string, input);
    sendSuccess(res, {
      message: 'Buku berhasil diperbarui',
      data: book,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookService.delete(req.params.id as string);
    sendSuccess(res, {
      message: 'Buku berhasil dihapus',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await bookService.getCategories();
    sendSuccess(res, {
      message: 'Daftar kategori berhasil diambil',
      data: categories,
    });
  } catch (err) {
    next(err);
  }
}
