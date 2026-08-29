export interface PaginationParams {
  page: number;
  perPage: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function parsePagination(page?: number, perPage?: number): PaginationParams {
  const validPage = Math.max(1, page || 1);
  const validPerPage = Math.min(100, Math.max(1, perPage || 10));

  return {
    page: validPage,
    perPage: validPerPage,
    skip: (validPage - 1) * validPerPage,
    take: validPerPage,
  };
}

export function buildPaginationMeta(
  total: number,
  params: PaginationParams
): PaginationMeta {
  return {
    page: params.page,
    perPage: params.perPage,
    total,
    totalPages: Math.ceil(total / params.perPage),
  };
}
