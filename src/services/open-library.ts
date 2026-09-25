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
 * Everything the book detail screen shows from Open Library.
 *
 * All of it is optional — Open Library's coverage is uneven, and a book with
 * no ratings or no page count is normal rather than an error.
 */
export type OpenLibraryDetails = {
  ratingAverage: number | null;
  ratingCount: number | null;
  pageCount: number | null;
  editionCount: number | null;
  firstPublishYear: number | null;
  publishers: string[];
  languages: string[];
  subjects: string[];
};

type DetailsResponse = {
  numFound?: number;
  docs?: {
    first_publish_year?: number;
    number_of_pages_median?: number;
    edition_count?: number;
    ratings_average?: number;
    ratings_count?: number;
    publisher?: string[];
    language?: string[];
    subject?: string[];
  }[];
};

const DETAIL_FIELDS = [
  'first_publish_year',
  'number_of_pages_median',
  'edition_count',
  'ratings_average',
  'ratings_count',
  'publisher',
  'language',
  'subject',
].join(',');

/** Open Library returns ISO 639-2 codes; these are the ones worth spelling out. */
const LANGUAGE_NAMES: Record<string, string> = {
  eng: 'English',
  spa: 'Spanish',
  fre: 'French',
  ger: 'German',
  ita: 'Italian',
  por: 'Portuguese',
  chi: 'Chinese',
  jpn: 'Japanese',
  kor: 'Korean',
  rus: 'Russian',
  ara: 'Arabic',
  hin: 'Hindi',
  tgl: 'Tagalog',
};

export function languageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code.toUpperCase();
}

/**
 * Looks a book up by ISBN for the detail screen.
 *
 * Resolves to `null` when Open Library has no record, which is not a failure —
 * the screen simply has nothing extra to show. Only a network or server
 * problem rejects.
 */
export async function lookupByIsbn(isbn: string): Promise<OpenLibraryDetails | null> {
  const cleaned = isbn.replace(/[^0-9Xx]/g, '');
  if (cleaned === '') return null;

  const params = new URLSearchParams({
    q: `isbn:${cleaned}`,
    fields: DETAIL_FIELDS,
    limit: '1',
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

    const data = (await response.json()) as DetailsResponse;
    const doc = data.docs?.[0];
    if (!doc) return null;

    return {
      ratingAverage: doc.ratings_average ?? null,
      ratingCount: doc.ratings_count ?? null,
      pageCount: doc.number_of_pages_median ?? null,
      editionCount: doc.edition_count ?? null,
      firstPublishYear: doc.first_publish_year ?? null,
      // Duplicates are common across editions.
      publishers: [...new Set(doc.publisher ?? [])].slice(0, 3),
      languages: [...new Set(doc.language ?? [])].slice(0, 4),
      subjects: [...new Set(doc.subject ?? [])].slice(0, 8),
    };
  } catch (cause) {
    if (cause instanceof OpenLibraryError) throw cause;

    const aborted = cause instanceof Error && cause.name === 'AbortError';
    throw new OpenLibraryError(
      aborted
        ? 'Open Library took too long to answer.'
        : 'Could not reach Open Library.'
    );
  } finally {
    clearTimeout(timeout);
  }
}

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
