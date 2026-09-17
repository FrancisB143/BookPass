/**
 * Catalogue access.
 *
 * Every function here is async even though it reads a local array. That is
 * deliberate: when these become `fetch()` calls, the signatures do not change
 * and no screen needs editing. Screens must never import `@/data/books`
 * directly.
 */

import { BOOKS } from '@/data/books';
import type { Book } from '@/types';

/** Fake network latency, so loading states are visible while developing. */
const LATENCY_MS = 300;

function resolveLater<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export async function getBooks(): Promise<Book[]> {
  return resolveLater([...BOOKS]);
}

/** Rejects rather than returning null, so a missing book cannot render as an empty screen. */
export async function getBookById(id: string): Promise<Book> {
  const book = BOOKS.find((candidate) => candidate.id === id);
  if (!book) {
    throw new Error(`No book found with id "${id}".`);
  }
  return resolveLater(book);
}

/** Case-insensitive substring match on title and author. Empty query returns everything. */
export async function searchBooks(query: string): Promise<Book[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return getBooks();
  }

  const matches = BOOKS.filter(
    (book) =>
      book.title.toLowerCase().includes(needle) || book.author.toLowerCase().includes(needle)
  );
  return resolveLater(matches);
}
