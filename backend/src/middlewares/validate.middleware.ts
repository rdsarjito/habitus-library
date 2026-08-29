import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ParamsDictionary } from 'express-serve-static-core';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Generic validation middleware factory.
 * Validates and transforms request data using Zod schemas.
 * Parsed query values are stored in res.locals.query to avoid Express getter conflicts.
 */
export function validate(schemas: ValidateSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: { code: string; field: string; message: string }[] = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            code: 'VALIDATION_ERROR',
            field: `params.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      } else {
        req.params = result.data as ParamsDictionary;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            code: 'VALIDATION_ERROR',
            field: `query.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      } else {
        // Store parsed query in res.locals to avoid Express 5 getter-only issue
        res.locals.parsedQuery = result.data;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          errors.push({
            code: 'VALIDATION_ERROR',
            field: issue.path.join('.'),
            message: issue.message,
          });
        });
      } else {
        req.body = result.data;
      }
    }

    if (errors.length > 0) {
      res.status(422).json({
        success: false,
        message: 'Validasi gagal',
        errors,
      });
      return;
    }

    next();
  };
}
