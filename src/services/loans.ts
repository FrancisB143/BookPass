/**
 * Borrowing rules, and the loans in both directions.
 *
 * A loan now has two members — a lender and a borrower. "My Borrowed Books"
 * reads the borrower side; the Home dashboard's "Lent Out" badge reads the
 * lender side.
 */

import { CURRENT_USER_ID, db, findCopy, findUser, nextId, resolveLater } from '@/services/store';
import type { Book, Copy, Loan, User } from '@/types';

/** How long a borrowed book may be kept. */
export const LOAN_PERIOD_DAYS = 14;

/** How many books one member may have out at once. */
export const BORROW_LIMIT = 5;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function isActive(loan: Loan): boolean {
  return loan.returnedAt === null;
}

/** Whole days until due. Negative once overdue. */
export function daysUntilDue(loan: Loan, now: Date = new Date()): number {
  return Math.ceil((new Date(loan.dueAt).getTime() - now.getTime()) / MS_PER_DAY);
}

export function isOverdue(loan: Loan, now: Date = new Date()): boolean {
  return isActive(loan) && new Date(loan.dueAt).getTime() < now.getTime();
}

/** Due within three days but not yet overdue — the "due soon" warning state. */
export function isDueSoon(loan: Loan, now: Date = new Date()): boolean {
  if (!isActive(loan) || isOverdue(loan, now)) return false;
  return daysUntilDue(loan, now) <= 3;
}

/** A loan joined to what a row needs to render it. */
export type LoanDetail = {
  loan: Loan;
  copy: Copy;
  book: Book;
  /** The other member — the lender when borrowing, the borrower when lending. */
  counterparty: User;
};

function toDetail(loan: Loan, perspective: 'borrowing' | 'lending'): LoanDetail | undefined {
  const copy = findCopy(loan.copyId);
  if (!copy) return undefined;

  const book = db.books.find((candidate) => candidate.id === copy.bookId);
  const counterparty = findUser(perspective === 'borrowing' ? loan.lenderId : loan.borrowerId);
  if (!book || !counterparty) return undefined;

  return { loan, copy, book, counterparty };
}

function detailsFor(loans: Loan[], perspective: 'borrowing' | 'lending'): LoanDetail[] {
  return loans
    .map((loan) => toDetail(loan, perspective))
    .filter((detail): detail is LoanDetail => detail !== undefined)
    .sort((a, b) => a.loan.dueAt.localeCompare(b.loan.dueAt));
}

/** Books the current user has borrowed from other members. */
export async function getBorrowedBooks(): Promise<LoanDetail[]> {
  const mine = db.loans.filter((loan) => loan.borrowerId === CURRENT_USER_ID && isActive(loan));
  return resolveLater(detailsFor(mine, 'borrowing'));
}

/** Books the current user has lent out. */
export async function getLentBooks(): Promise<LoanDetail[]> {
  const mine = db.loans.filter((loan) => loan.lenderId === CURRENT_USER_ID && isActive(loan));
  return resolveLater(detailsFor(mine, 'lending'));
}

/** Starts a loan. Used when the owner accepts a borrow request. */
export async function startLoan(copyId: string, borrowerId: string): Promise<Loan> {
  const copy = findCopy(copyId);
  if (!copy) {
    throw new Error(`No copy found with id "${copyId}".`);
  }
  if (copy.status === 'lent-out') {
    throw new Error('That copy is already out on loan.');
  }

  const active = db.loans.filter((loan) => loan.borrowerId === borrowerId && isActive(loan));
  if (active.length >= BORROW_LIMIT) {
    throw new Error(`A member can have ${BORROW_LIMIT} books out at a time.`);
  }

  const borrowedAt = new Date();
  const dueAt = new Date(borrowedAt.getTime() + LOAN_PERIOD_DAYS * MS_PER_DAY);

  const loan: Loan = {
    id: nextId('l'),
    copyId,
    lenderId: copy.ownerId,
    borrowerId,
    borrowedAt: borrowedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    returnedAt: null,
  };

  db.loans = [loan, ...db.loans];
  db.copies = db.copies.map((candidate) =>
    candidate.id === copyId ? { ...candidate, status: 'lent-out' } : candidate
  );

  return resolveLater(loan);
}

/** Closes a loan and puts the copy back on its owner's shelf. */
export async function returnLoan(loanId: string): Promise<Loan> {
  const loan = db.loans.find((candidate) => candidate.id === loanId);
  if (!loan) {
    throw new Error(`No loan found with id "${loanId}".`);
  }
  if (!isActive(loan)) {
    throw new Error('That book has already been returned.');
  }

  const returned: Loan = { ...loan, returnedAt: new Date().toISOString() };
  db.loans = db.loans.map((candidate) => (candidate.id === loanId ? returned : candidate));
  db.copies = db.copies.map((candidate) =>
    candidate.id === loan.copyId ? { ...candidate, status: 'on-shelf' } : candidate
  );

  return resolveLater(returned);
}
