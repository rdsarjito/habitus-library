import { Response } from 'express';

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

interface SuccessResponseOptions {
  statusCode?: number;
  message: string;
  data?: unknown;
  meta?: PaginationMeta;
}

export function sendSuccess(res: Response, options: SuccessResponseOptions): void {
  const { statusCode = 200, message, data, meta } = options;

  const response: Record<string, unknown> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
}
