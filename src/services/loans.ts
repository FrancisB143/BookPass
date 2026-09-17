/**
 * Borrowing rules and the loan store.
 *
 * State lives in a module-level array, so it resets when the app reloads.
 * Swapping this for a database or API means rewriting the bodies below; the
 * signatures and the rules are already where they belong.
 */

import type { Loan } from '@/types';

/** How long a book may be kept before it is overdue. */
export const LOAN_PERIOD_DAYS = 14;

/** How many books one member may have out at once. */
export const BORROW_LIMIT = 3;

const LATENCY_MS = 300;

function resolveLater<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Seeded with one active loan so My Loans has something to show on first run. */
let loans: Loan[] = [
  {
    id: 'seed-1',
    bookId: '3',
    borrowedAt: addDays(new Date(), -9).toISOString(),
    dueAt: addDays(new Date(), 5).toISOString(),
    returnedAt: null,
  },
];

let nextId = 1;

export async function listLoans(): Promise<Loan[]> {
  return resolveLater([...loans]);
}

export function isActive(loan: Loan): boolean {
  return loan.returnedAt === null;
}

export function isOverdue(loan: Loan, now: Date = new Date()): boolean {
  return isActive(loan) && new Date(loan.dueAt).getTime() < now.getTime();
}

/** Whole days until due. Negative once overdue. */
export function daysUntilDue(loan: Loan, now: Date = new Date()): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const difference = new Date(loan.dueAt).getTime() - now.getTime();
  return Math.ceil(difference / millisecondsPerDay);
}

export async function borrowBook(bookId: string): Promise<Loan> {
  if (loans.some((loan) => loan.bookId === bookId && isActive(loan))) {
    throw new Error('You already have this book out.');
  }

  if (loans.filter(isActive).length >= BORROW_LIMIT) {
    throw new Error(`You can have ${BORROW_LIMIT} books out at a time. Return one first.`);
  }

  const borrowedAt = new Date();
  const loan: Loan = {
    id: `loan-${nextId++}`,
    bookId,
    borrowedAt: borrowedAt.toISOString(),
    dueAt: addDays(borrowedAt, LOAN_PERIOD_DAYS).toISOString(),
    returnedAt: null,
  };

  loans = [loan, ...loans];
  return resolveLater(loan);
}

export async function returnLoan(loanId: string): Promise<Loan> {
  const loan = loans.find((candidate) => candidate.id === loanId);
  if (!loan) {
    throw new Error(`No loan found with id "${loanId}".`);
  }
  if (!isActive(loan)) {
    throw new Error('That book has already been returned.');
  }

  const returned: Loan = { ...loan, returnedAt: new Date().toISOString() };
  loans = loans.map((candidate) => (candidate.id === loanId ? returned : candidate));
  return resolveLater(returned);
}
