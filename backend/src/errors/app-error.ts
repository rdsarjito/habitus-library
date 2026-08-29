export interface ErrorDetail {
  code: string;
  field?: string;
  message: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly errors: ErrorDetail[];

  constructor(statusCode: number, code: string, message: string, errors?: ErrorDetail[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors || [{ code, message }];
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} dengan ID ${identifier} tidak ditemukan`
      : `${resource} tidak ditemukan`;
    super(404, 'NOT_FOUND', message);
  }
}

export class ValidationError extends AppError {
  constructor(errors: ErrorDetail[]) {
    super(422, 'VALIDATION_ERROR', 'Validasi gagal', errors);
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string, field?: string) {
    const errors: ErrorDetail[] = [{ code, message, ...(field && { field }) }];
    super(409, code, message, errors);
  }
}

export class DuplicateEntryError extends AppError {
  constructor(fields: { field: string; message: string }[]) {
    const errors: ErrorDetail[] = fields.map((f) => ({
      code: 'DUPLICATE_ENTRY',
      field: f.field,
      message: f.message,
    }));
    super(409, 'DUPLICATE_ENTRY', 'Data duplikat', errors);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, violations: ErrorDetail[]) {
    super(400, 'BUSINESS_RULE_VIOLATION', message, violations);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Akses tidak diizinkan') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class BadRequestError extends AppError {
  constructor(code: string, message: string) {
    super(400, code, message);
  }
}
