/**
 * The third-party public API: Open Library Search.
 *
 * https://openlibrary.org/dev/docs/api/search
 *
 * Free, no account and no key. Used by the Discover screen to look a book up
 * by title or author and hand its details straight into the Add Book form, so
 * a real catalogue entry can be created without typing an ISBN by hand.
 *
 * Nothing here touches the custom API — the two are kept apart on purpose.
 */

import { OPEN_LIBRARY_COVERS_URL, OPEN_LIBRARY_SEARCH_URL, REQUEST_TIMEOUT_MS } from '@/config';

/** One search hit, reduced to the fields the app actually shows. */
export type OpenLibraryBook = {
  /** Open Library's own work key, e.g. "/works/OL45804W". Used as a list key. */
  key: string;
  title: string;
  author: string;
  firstPublishYear: number | null;
  isbn: string | null;
  /** First subject, used as a genre suggestion. */
  subject: string | null;
  coverUrl: string | null;
};

/** The subset of Open Library's response we read. It returns far more. */
type SearchResponse = {
  numFound?: number;
  docs?: {
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    isbn?: string[];
    subject?: string[];
    cover_i?: number;
  }[];
};

export class OpenLibraryError extends Error {}

/**
 * Prefers a 13-digit ISBN.
 *
 * Open Library returns every edition's ISBN in one flat array, mixing 10- and
 * 13-digit forms. The 13-digit one is the modern standard and is what the
 * covers API resolves most reliably.
 */
function pickIsbn(isbns: string[] | undefined): string | null {
  if (!isbns || isbns.length === 0) return null;
  const cleaned = isbns.map((value) => value.replace(/[^0-9Xx]/g, ''));
  return cleaned.find((value) => value.length === 13) ?? cleaned[0] ?? null;
}

function toBook(doc: NonNullable<SearchResponse['docs']>[number]): OpenLibraryBook | null {
  // A hit with no title is unusable, and Open Library does return a few.
  if (!doc.title) return null;

  const isbn = pickIsbn(doc.isbn);

  return {
    key: doc.key ?? doc.title,
    title: doc.title,
    author: doc.author_name?.[0] ?? 'Unknown author',
    firstPublishYear: doc.first_publish_year ?? null,
    isbn,
    subject: doc.subject?.[0] ?? null,
    coverUrl: isbn ? `${OPEN_LIBRARY_COVERS_URL}/${isbn}-M.jpg?default=false` : null,
  };
}

/**
 * Searches Open Library by title, author or keyword.
 *
 * `fields` and `limit` are passed so the response stays small — the default
 * reply carries dozens of columns per hit and is slow over mobile data.
 */
export async function searchOpenLibrary(query: string, limit = 20): Promise<OpenLibraryBook[]> {
  const trimmed = query.trim();
  if (trimmed === '') return [];

  const params = new URLSearchParams({
    q: trimmed,
    fields: 'key,title,author_name,first_publish_year,isbn,subject,cover_i',
    limit: String(limit),
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${OPEN_LIBRARY_SEARCH_URL}?${params}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new OpenLibraryError(`Open Library returned HTTP ${response.status}.`);
    }

    const data = (await response.json()) as SearchResponse;

    return (data.docs ?? [])
      .map(toBook)
      .filter((book): book is OpenLibraryBook => book !== null);
  } catch (cause) {
    if (cause instanceof OpenLibraryError) throw cause;

    const aborted = cause instanceof Error && cause.name === 'AbortError';
    throw new OpenLibraryError(
      aborted
        ? 'Open Library took too long to answer.'
        : 'Could not reach Open Library. Check your internet connection.'
    );
  } finally {
    clearTimeout(timeout);
  }
}
