/**
 * The catalogue: books, the copies people own, and the exchange listings.
 *
 * Async throughout, so these become `fetch()` calls without touching a screen.
 */

import {
  CURRENT_USER_ID,
  db,
  findBook,
  nextId,
  resolveLater,
  toListing,
  toListings,
} from '@/services/store';
import type { Book, Copy, CopyCondition, CopyStatus, Listing } from '@/types';

export type ExchangeFilter = 'all' | 'open-for-trade' | 'direct-swaps';

/** Copies owned by the current user, newest first. */
export async function getMyShelf(): Promise<Listing[]> {
  const mine = db.copies
    .filter((copy) => copy.ownerId === CURRENT_USER_ID)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  return resolveLater(toListings(mine));
}

/** Everyone else's copies that are listed for exchange, nearest first. */
export async function getExchangeListings(filter: ExchangeFilter = 'all'): Promise<Listing[]> {
  const listed = db.copies.filter(
    (copy) => copy.ownerId !== CURRENT_USER_ID && copy.status === 'available-for-swap'
  );

  const filtered =
    filter === 'direct-swaps'
      ? listed.filter((copy) => copy.seeking.length > 0)
      : filter === 'open-for-trade'
        ? listed.filter((copy) => copy.seeking.length === 0)
        : listed;

  return resolveLater(toListings(filtered).sort((a, b) => a.copy.distanceMi - b.copy.distanceMi));
}

/** Nearby listings for the Home dashboard's "Available Near You" rail. */
export async function getNearbyListings(limit = 4): Promise<Listing[]> {
  const listings = await getExchangeListings('all');
  return listings.slice(0, limit);
}

export async function getListing(copyId: string): Promise<Listing> {
  const copy = db.copies.find((candidate) => candidate.id === copyId);
  const listing = copy ? toListing(copy) : undefined;
  if (!listing) {
    throw new Error(`No copy found with id "${copyId}".`);
  }
  return resolveLater(listing);
}

/** Case-insensitive match on title and author across every listing. */
export async function searchListings(query: string, filter: ExchangeFilter = 'all') {
  const listings = await getExchangeListings(filter);
  const needle = query.trim().toLowerCase();
  if (!needle) return listings;

  return listings.filter(
    ({ book }) =>
      book.title.toLowerCase().includes(needle) || book.author.toLowerCase().includes(needle)
  );
}

export async function getGenres(): Promise<string[]> {
  return resolveLater([...new Set(db.books.map((book) => book.genre))].sort());
}

export type NewBookInput = {
  title: string;
  author: string;
  genre: string;
  isbn?: string;
  year?: number;
  blurb?: string;
  condition: CopyCondition;
  status: CopyStatus;
  seeking: string[];
};

/**
 * Adds a book to the current user's shelf. Reuses an existing `Book` when the
 * title and author already exist — two members owning the same work must share
 * one bibliographic record, or the exchange cannot match them.
 */
export async function addBookToShelf(input: NewBookInput): Promise<Listing> {
  const title = input.title.trim();
  const author = input.author.trim();

  if (!title || !author) {
    throw new Error('A book needs both a title and an author.');
  }

  let book: Book | undefined = db.books.find(
    (candidate) =>
      candidate.title.toLowerCase() === title.toLowerCase() &&
      candidate.author.toLowerCase() === author.toLowerCase()
  );

  if (!book) {
    book = {
      id: nextId('b'),
      title,
      author,
      genre: input.genre,
      year: input.year,
      isbn: input.isbn?.trim() || undefined,
      blurb: input.blurb?.trim() || undefined,
    };
    db.books = [...db.books, book];
  }

  const copy: Copy = {
    id: nextId('c'),
    bookId: book.id,
    ownerId: CURRENT_USER_ID,
    condition: input.condition,
    status: input.status,
    hub: 'North Hall',
    distanceMi: 0,
    seeking: input.seeking,
    addedAt: new Date().toISOString(),
  };

  db.copies = [copy, ...db.copies];

  const listing = toListing(copy);
  if (!listing) {
    throw new Error('Could not add that book.');
  }
  return resolveLater(listing);
}

export type CopyPatch = Partial<Pick<Copy, 'condition' | 'status' | 'seeking' | 'hub'>> & {
  title?: string;
  author?: string;
  genre?: string;
  isbn?: string;
  blurb?: string;
};

/** Edits a copy the current user owns, and the shared book record with it. */
export async function updateCopy(copyId: string, patch: CopyPatch): Promise<Listing> {
  const copy = db.copies.find((candidate) => candidate.id === copyId);
  if (!copy) {
    throw new Error(`No copy found with id "${copyId}".`);
  }
  if (copy.ownerId !== CURRENT_USER_ID) {
    throw new Error('You can only edit books on your own shelf.');
  }

  const updated: Copy = {
    ...copy,
    condition: patch.condition ?? copy.condition,
    status: patch.status ?? copy.status,
    seeking: patch.seeking ?? copy.seeking,
    hub: patch.hub ?? copy.hub,
  };
  db.copies = db.copies.map((candidate) => (candidate.id === copyId ? updated : candidate));

  const book = findBook(copy.bookId);
  if (book) {
    const nextBook: Book = {
      ...book,
      title: patch.title?.trim() || book.title,
      author: patch.author?.trim() || book.author,
      genre: patch.genre ?? book.genre,
      isbn: patch.isbn?.trim() ?? book.isbn,
      blurb: patch.blurb?.trim() ?? book.blurb,
    };
    db.books = db.books.map((candidate) => (candidate.id === book.id ? nextBook : candidate));
  }

  const listing = toListing(updated);
  if (!listing) {
    throw new Error('Could not update that book.');
  }
  return resolveLater(listing);
}

/** Removes a copy from the shelf. Refuses while the book is out on loan. */
export async function removeCopy(copyId: string): Promise<void> {
  const copy = db.copies.find((candidate) => candidate.id === copyId);
  if (!copy) {
    throw new Error(`No copy found with id "${copyId}".`);
  }
  if (copy.ownerId !== CURRENT_USER_ID) {
    throw new Error('You can only remove books from your own shelf.');
  }
  if (copy.status === 'lent-out') {
    throw new Error('That book is lent out. It has to come back before you can remove it.');
  }

  db.copies = db.copies.filter((candidate) => candidate.id !== copyId);
  db.requests = db.requests.filter((request) => request.copyId !== copyId);

  return resolveLater(undefined);
}
