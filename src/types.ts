/** Domain types. One entity — a book — which is what the CRUD screens manage. */

export type BookStatus = 'available' | 'borrowed' | 'reserved';

export const BOOK_STATUSES: BookStatus[] = ['available', 'borrowed', 'reserved'];

export const STATUS_LABEL: Record<BookStatus, string> = {
  available: 'Available',
  borrowed: 'Borrowed',
  reserved: 'Reserved',
};

/**
 * A book as the app uses it.
 *
 * The API speaks snake_case, this speaks camelCase, and `src/services/books.ts`
 * is the single place that translates. Screens never see the wire format.
 */
export type Book = {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  isbn: string | null;
  publishedYear: number | null;
  description: string | null;
  status: BookStatus;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What the create and edit forms produce. */
export type BookDraft = {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  publishedYear: string;
  description: string;
  status: BookStatus;
  coverUrl?: string | null;
};

export const EMPTY_DRAFT: BookDraft = {
  title: '',
  author: '',
  genre: '',
  isbn: '',
  publishedYear: '',
  description: '',
  status: 'available',
};

/** Turns a saved book back into form values so the edit screen can prefill. */
export function draftFrom(book: Book): BookDraft {
  return {
    title: book.title,
    author: book.author,
    genre: book.genre ?? '',
    isbn: book.isbn ?? '',
    publishedYear: book.publishedYear === null ? '' : String(book.publishedYear),
    description: book.description ?? '',
    status: book.status,
    coverUrl: book.coverUrl,
  };
}

/** Per-field messages from the API's 422 response, keyed by form field. */
export type FieldErrors = Partial<Record<keyof BookDraft, string>>;
