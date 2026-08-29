import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Generic validation middleware factory.
 * Usage: router.post('/', validate({ body: createBookSchema }), controller.create)
 */
export function validate(schemas: ValidateSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: { code: string; field: string; message: string }[] = [];

    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            code: 'VALIDATION_ERROR',
            field: `params.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      }
    }

    try {
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            code: 'VALIDATION_ERROR',
            field: `query.${e.path.join('.')}`,
            message: e.message,
          }))
        );
      }
    }

    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        errors.push(
          ...err.errors.map((e) => ({
            code: 'VALIDATION_ERROR',
            field: e.path.join('.'),
            message: e.message,
          }))
        );
      }
    }

    if (errors.length > 0) {
      _res.status(422).json({
        success: false,
        message: 'Validasi gagal',
        errors,
      });
      return;
    }

    next();
  };
}
