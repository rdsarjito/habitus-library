import env from '../config/env';

/**
 * Get today's date at midnight (no time component).
 */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Calculate due date from loan date.
 */
export function calculateDueDate(loanDate: Date): Date {
  const due = new Date(loanDate);
  due.setDate(due.getDate() + env.LOAN_DURATION_DAYS);
  return due;
}

/**
 * Calculate number of late days.
 * Returns 0 if not late (returnDate <= dueDate).
 */
export function calculateLateDays(dueDate: Date, returnDate: Date): number {
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const ret = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());

  if (ret <= due) return 0;

  const diffMs = ret.getTime() - due.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate fine amount based on late days.
 * Returns null if no late days.
 */
export function calculateFine(lateDays: number): number | null {
  if (lateDays <= 0) return null;
  return lateDays * env.FINE_PER_DAY;
}

/**
 * Check if a loan is overdue based on due date.
 */
export function isOverdue(dueDate: Date): boolean {
  const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  return today() > due;
}

/**
 * Get display status for a loan.
 * BORROWED + past due = OVERDUE
 * Otherwise, return stored status as-is.
 */
export function getDisplayStatus(
  status: 'BORROWED' | 'RETURNED',
  dueDate: Date
): 'BORROWED' | 'RETURNED' | 'OVERDUE' {
  if (status === 'RETURNED') return 'RETURNED';
  if (isOverdue(dueDate)) return 'OVERDUE';
  return 'BORROWED';
}
