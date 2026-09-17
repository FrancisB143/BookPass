/**
 * Loans shared across screens.
 *
 * Browse, Book detail and My Loans all need to agree on what is currently
 * borrowed, so the loan list is held here rather than fetched per screen.
 * Mutations refresh the list, then rethrow — screens decide how to report
 * failure.
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

import { borrowBook, isActive, listLoans, returnLoan } from '@/services/loans';
import type { Loan } from '@/types';

type LibraryValue = {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  borrow: (bookId: string) => Promise<void>;
  returnBook: (loanId: string) => Promise<void>;
  activeLoanForBook: (bookId: string) => Loan | undefined;
};

const LibraryContext = createContext<LibraryValue | null>(null);

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong.';
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setLoans(await listLoans());
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

  const borrow = useCallback(
    async (bookId: string) => {
      await borrowBook(bookId);
      await refresh();
    },
    [refresh]
  );

  const returnBook = useCallback(
    async (loanId: string) => {
      await returnLoan(loanId);
      await refresh();
    },
    [refresh]
  );

  const activeLoanForBook = useCallback(
    (bookId: string) => loans.find((loan) => loan.bookId === bookId && isActive(loan)),
    [loans]
  );

  const value = useMemo(
    () => ({ loans, isLoading, error, refresh, borrow, returnBook, activeLoanForBook }),
    [loans, isLoading, error, refresh, borrow, returnBook, activeLoanForBook]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryValue {
  const value = useContext(LibraryContext);
  if (!value) {
    throw new Error('useLibrary must be used inside a <LibraryProvider>.');
  }
  return value;
}
