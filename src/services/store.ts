/**
 * The in-memory store every service reads and writes.
 *
 * It lives in one module rather than one per service so that borrowing a book
 * and listing it on the exchange cannot drift apart. State resets on reload;
 * replacing it with a database means rewriting the service bodies, not the
 * screens.
 */

import { BOOKS, COPIES, LOANS, REQUESTS, USERS } from '@/data/seed';
import type { Book, Copy, ExchangeRequest, Listing, Loan, User } from '@/types';

export { CURRENT_USER_ID } from '@/data/seed';

/** Fake network latency so loading states are exercised during development. */
const LATENCY_MS = 260;

export function resolveLater<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export const db = {
  users: [...USERS] as User[],
  books: [...BOOKS] as Book[],
  copies: [...COPIES] as Copy[],
  loans: [...LOANS] as Loan[],
  requests: [...REQUESTS] as ExchangeRequest[],
};

export function findBook(bookId: string): Book | undefined {
  return db.books.find((book) => book.id === bookId);
}

export function findUser(userId: string): User | undefined {
  return db.users.find((user) => user.id === userId);
}

export function findCopy(copyId: string): Copy | undefined {
  return db.copies.find((copy) => copy.id === copyId);
}

/**
 * Joins a copy to its book and owner. Returns undefined when either is
 * missing, so callers filter rather than render a half-empty row.
 */
export function toListing(copy: Copy): Listing | undefined {
  const book = findBook(copy.bookId);
  const owner = findUser(copy.ownerId);
  if (!book || !owner) return undefined;
  return { copy, book, owner };
}

export function toListings(copies: Copy[]): Listing[] {
  return copies.map(toListing).filter((listing): listing is Listing => listing !== undefined);
}

let sequence = 0;

export function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}
