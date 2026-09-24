/**
 * The custom REST API client — all four CRUD operations.
 *
 * This file is the only place that knows the API's URL shape or its snake_case
 * wire format. Screens call these functions and get app-shaped `Book` objects
 * back.
 */

import { API_AUTH_TOKEN, API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/config';
import type { Book, BookDraft, BookStatus, FieldErrors } from '@/types';

const ENDPOINT = `${API_BASE_URL}/books.php`;

/**
 * Finds the JSON inside a response body.
 *
 * Freehostia's free tier prepends a comment to every PHP response, so the body
 * arrives as `/*  *​/{"id":1,…}` and `JSON.parse` throws on the very first
 * character. Everything before the opening brace or bracket is dropped rather
 * than parsed.
 */
function parseJson(text: string): unknown {
  const start = text.search(/[[{]/);
  if (start === -1) {
    throw new SyntaxError('No JSON found in the response.');
  }
  return JSON.parse(text.slice(start));
}

/** A book exactly as the API sends it. */
type BookRecord = {
  id: number;
  title: string;
  author: string;
  genre: string | null;
  isbn: string | null;
  published_year: number | null;
  description: string | null;
  status: BookStatus;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * An API failure carrying the per-field messages a form needs.
 *
 * Thrown rather than returned so a caller cannot accidentally treat a failed
 * save as a successful one.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fields: FieldErrors;

  constructor(message: string, status: number, fields: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

/** API field names differ from the form's; map them so errors land correctly. */
const FIELD_NAMES: Record<string, keyof BookDraft> = {
  title: 'title',
  author: 'author',
  genre: 'genre',
  isbn: 'isbn',
  published_year: 'publishedYear',
  description: 'description',
  status: 'status',
};

function toFieldErrors(raw: unknown): FieldErrors {
  if (typeof raw !== 'object' || raw === null) return {};

  const errors: FieldErrors = {};
  for (const [key, message] of Object.entries(raw as Record<string, unknown>)) {
    const field = FIELD_NAMES[key];
    if (field && typeof message === 'string') {
      errors[field] = message;
    }
  }
  return errors;
}

function toBook(record: BookRecord): Book {
  return {
    id: record.id,
    title: record.title,
    author: record.author,
    genre: record.genre,
    isbn: record.isbn,
    publishedYear: record.published_year,
    description: record.description,
    status: record.status,
    coverUrl: record.cover_url,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

/** Form values become the API's field names, with blanks sent as null. */
function toPayload(draft: BookDraft): Record<string, unknown> {
  const blankToNull = (value: string) => (value.trim() === '' ? null : value.trim());

  return {
    title: draft.title.trim(),
    author: draft.author.trim(),
    genre: blankToNull(draft.genre),
    isbn: blankToNull(draft.isbn),
    published_year: draft.publishedYear.trim() === '' ? null : Number(draft.publishedYear),
    description: blankToNull(draft.description),
    status: draft.status,
    cover_url: draft.coverUrl ?? null,
  };
}

/**
 * One fetch wrapper for every call, so a dead server, a PHP crash and a
 * validation failure all arrive as the same kind of error.
 */
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        // auth.php rejects anything without a bearer token.
        Authorization: `Bearer ${API_AUTH_TOKEN}`,
        ...init?.headers,
      },
    });
  } catch (cause) {
    // An unreachable server is by far the most common failure here, and the
    // default "Network request failed" tells the user nothing actionable.
    const aborted = cause instanceof Error && cause.name === 'AbortError';
    throw new ApiError(
      aborted
        ? 'The server took too long to answer.'
        : `Could not reach the server at ${API_BASE_URL}. Check that it is running and that the address in src/config.ts is right.`,
      0
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let body: unknown = null;
  if (text.trim() !== '') {
    try {
      body = parseJson(text);
    } catch {
      // PHP warnings and fatal errors come back as HTML, not JSON.
      throw new ApiError(
        `The server replied with something that was not JSON (HTTP ${response.status}). Open ${ENDPOINT} in a browser to see the error.`,
        response.status
      );
    }
  }

  if (!response.ok) {
    const payload = (body ?? {}) as { error?: string; fields?: unknown };
    throw new ApiError(
      payload.error ?? `The server returned HTTP ${response.status}.`,
      response.status,
      toFieldErrors(payload.fields)
    );
  }

  return body as T;
}

export type BookQuery = {
  search?: string;
  status?: BookStatus | 'all';
};

/** READ — every book, optionally filtered. */
export async function listBooks(query: BookQuery = {}): Promise<Book[]> {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.status && query.status !== 'all') params.set('status', query.status);

  const url = params.toString() ? `${ENDPOINT}?${params}` : ENDPOINT;
  const records = await request<BookRecord[]>(url);
  return records.map(toBook);
}

/** READ — one book, for the detail screen. */
export async function getBook(id: number): Promise<Book> {
  return toBook(await request<BookRecord>(`${ENDPOINT}?id=${id}`));
}

/** CREATE */
export async function createBook(draft: BookDraft): Promise<Book> {
  const record = await request<BookRecord>(ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(toPayload(draft)),
  });
  return toBook(record);
}

/** UPDATE */
export async function updateBook(id: number, draft: BookDraft): Promise<Book> {
  const record = await request<BookRecord>(`${ENDPOINT}?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(toPayload(draft)),
  });
  return toBook(record);
}

/** DELETE */
export async function deleteBook(id: number): Promise<void> {
  await request<{ deleted: number }>(`${ENDPOINT}?id=${id}`, { method: 'DELETE' });
}
