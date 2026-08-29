import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/app-error';

/**
 * Global error handling middleware.
 * Must be registered AFTER all routes.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle our custom AppError subclasses
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Handle Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (err.meta?.target as string[]) || ['unknown'];
        res.status(409).json({
          success: false,
          message: 'Data duplikat',
          errors: [{
            code: 'DUPLICATE_ENTRY',
            field: target.join(', '),
            message: `Data dengan ${target.join(', ')} tersebut sudah ada`,
          }],
        });
        return;
      }
      case 'P2025': {
        // Record not found
        res.status(404).json({
          success: false,
          message: 'Data tidak ditemukan',
          errors: [{ code: 'NOT_FOUND', message: 'Data yang diminta tidak ditemukan' }],
        });
        return;
      }
      case 'P2003': {
        // Foreign key constraint violation
        res.status(400).json({
          success: false,
          message: 'Data tidak dapat diproses',
          errors: [{
            code: 'FK_CONSTRAINT',
            message: 'Data terkait dengan data lain yang masih aktif',
          }],
        });
        return;
      }
      default:
        break;
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(422).json({
      success: false,
      message: 'Data tidak valid',
      errors: [{ code: 'VALIDATION_ERROR', message: 'Format data tidak sesuai dengan skema database' }],
    });
    return;
  }

  // Unknown errors — log and return generic message
  console.error('❌ Unexpected error:', err);

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    errors: [{
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Silakan coba lagi nanti',
    }],
  });
}
