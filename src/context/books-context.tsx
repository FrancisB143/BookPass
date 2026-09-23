/**
 * The book catalogue, loaded once and shared by every screen.
 *
 * All four CRUD calls go through here so that after a create, edit or delete
 * the list, the detail screen and the counts cannot disagree with each other.
 * Mutations refresh the catalogue and then rethrow, leaving each screen to
 * decide how to report a failure.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError, createBook, deleteBook, listBooks, updateBook } from '@/services/books';
import type { Book, BookDraft } from '@/types';

type BooksValue = {
  books: Book[];
  isLoading: boolean;
  /** Set when the catalogue could not be loaded at all. */
  error: string | null;
  refresh: () => Promise<void>;
  add: (draft: BookDraft) => Promise<Book>;
  edit: (id: number, draft: BookDraft) => Promise<Book>;
  remove: (id: number) => Promise<void>;
};

const BooksContext = createContext<BooksValue | null>(null);

function messageFrom(cause: unknown): string {
  if (cause instanceof ApiError) return cause.message;
  return cause instanceof Error ? cause.message : 'Something went wrong.';
}

export function BooksProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setBooks(await listBooks());
      setError(null);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = useCallback(
    async (draft: BookDraft) => {
      const created = await createBook(draft);
      await refresh();
      return created;
    },
    [refresh]
  );

  const edit = useCallback(
    async (id: number, draft: BookDraft) => {
      const updated = await updateBook(id, draft);
      await refresh();
      return updated;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteBook(id);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ books, isLoading, error, refresh, add, edit, remove }),
    [books, isLoading, error, refresh, add, edit, remove]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks(): BooksValue {
  const value = useContext(BooksContext);
  if (!value) {
    throw new Error('useBooks must be used inside a <BooksProvider>.');
  }
  return value;
}
