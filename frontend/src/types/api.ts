// =====================
// Generic API Response
// =====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  field?: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

// =====================
// Auth
// =====================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  name: string;
  createdAt?: string;
}

// =====================
// Books
// =====================

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  yearPublished: number;
  category: string;
  totalCopies: number;
  availableCopies: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  yearPublished: number;
  category: string;
  totalCopies: number;
}

export interface BookQuery {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// =====================
// Members
// =====================

export interface Member {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  activeLoansCount?: number;
  overdueLoansCount?: number;
}

export interface MemberFormData {
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface MemberQuery {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  perPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// =====================
// Loans
// =====================

export interface Loan {
  id: string;
  memberId: string;
  bookId: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'BORROWED' | 'RETURNED';
  displayStatus: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  lateDays: number;
  fineAmount: number | null;
  createdAt: string;
  updatedAt: string;
  member: {
    id: string;
    name: string;
    memberNumber: string;
    email?: string;
    phone?: string;
  };
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    category?: string;
  };
}

export interface CreateLoanRequest {
  memberId: string;
  bookId: string;
}

export interface ReturnLoanRequest {
  returnDate?: string;
}

export interface LoanQuery {
  memberId?: string;
  bookId?: string;
  status?: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  page?: number;
  perPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// =====================
// Dashboard
// =====================

export interface DashboardStats {
  books: {
    total: number;
    totalCopies: number;
    availableCopies: number;
  };
  members: {
    total: number;
    active: number;
    inactive: number;
  };
  loans: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  fines: {
    totalAmount: number;
    totalTransactions: number;
  };
}
