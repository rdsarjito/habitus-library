import { describe, it, expect, vi } from 'vitest';

// Mock env before importing date utils
vi.mock('../../../src/config/env', () => ({
  default: {
    LOAN_DURATION_DAYS: 14,
    FINE_PER_DAY: 1000,
  },
}));

import { calculateDueDate, calculateLateDays, calculateFine, getDisplayStatus } from '../../../src/utils/date';

describe('calculateDueDate', () => {
  it('should add LOAN_DURATION_DAYS (14) to the loan date', () => {
    const loanDate = new Date(2026, 0, 1); // Jan 1
    const result = calculateDueDate(loanDate);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(15); // Jan 1 + 14 = Jan 15
  });

  it('should handle month boundary', () => {
    const loanDate = new Date(2026, 0, 25); // Jan 25
    const result = calculateDueDate(loanDate);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(8); // Jan 25 + 14 = Feb 8
  });
});

describe('calculateLateDays', () => {
  it('should return 0 when returned on due date (on time)', () => {
    const dueDate = new Date(2026, 0, 15);
    const returnDate = new Date(2026, 0, 15);
    expect(calculateLateDays(dueDate, returnDate)).toBe(0);
  });

  it('should return 0 when returned before due date', () => {
    const dueDate = new Date(2026, 0, 15);
    const returnDate = new Date(2026, 0, 10);
    expect(calculateLateDays(dueDate, returnDate)).toBe(0);
  });

  it('should return correct late days when returned 1 day late', () => {
    const dueDate = new Date(2026, 0, 15);
    const returnDate = new Date(2026, 0, 16);
    expect(calculateLateDays(dueDate, returnDate)).toBe(1);
  });

  it('should return correct late days when returned 6 days late', () => {
    const dueDate = new Date(2026, 0, 15);
    const returnDate = new Date(2026, 0, 21);
    expect(calculateLateDays(dueDate, returnDate)).toBe(6);
  });

  it('should handle month boundary for late return', () => {
    const dueDate = new Date(2026, 0, 30); // Jan 30
    const returnDate = new Date(2026, 1, 5); // Feb 5
    expect(calculateLateDays(dueDate, returnDate)).toBe(6);
  });
});

describe('calculateFine', () => {
  it('should return null when lateDays is 0', () => {
    expect(calculateFine(0)).toBeNull();
  });

  it('should return null when lateDays is negative', () => {
    expect(calculateFine(-1)).toBeNull();
  });

  it('should return 1000 for 1 late day (FINE_PER_DAY = 1000)', () => {
    expect(calculateFine(1)).toBe(1000);
  });

  it('should return 6000 for 6 late days', () => {
    expect(calculateFine(6)).toBe(6000);
  });
});

describe('getDisplayStatus', () => {
  it('should return RETURNED for returned loans regardless of date', () => {
    const pastDate = new Date(2020, 0, 1);
    expect(getDisplayStatus('RETURNED', pastDate)).toBe('RETURNED');
  });

  it('should return BORROWED for active loans with future due date', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(getDisplayStatus('BORROWED', futureDate)).toBe('BORROWED');
  });

  it('should return OVERDUE for active loans with past due date', () => {
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    expect(getDisplayStatus('BORROWED', pastDate)).toBe('OVERDUE');
  });
});
