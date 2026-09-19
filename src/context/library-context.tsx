/**
 * Everything the current user's shelf and exchanges depend on.
 *
 * Home, My Books, Exchange and Borrowed all need to agree on what is owned,
 * lent, borrowed and pending — so it is loaded once here rather than per
 * screen. Every mutation refreshes the whole set, then rethrows; screens decide
 * how to report failure.
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

import { getMyShelf, removeCopy, type CopyPatch, updateCopy } from '@/services/catalog';
import {
  acceptRequest,
  cancelRequest,
  createRequest,
  declineRequest,
  getPendingRequests,
  type RequestDetail,
} from '@/services/exchange';
import { getBorrowedBooks, getLentBooks, isOverdue, returnLoan, type LoanDetail } from '@/services/loans';
import type { Listing, RequestKind } from '@/types';

type LibraryValue = {
  shelf: Listing[];
  borrowed: LoanDetail[];
  lent: LoanDetail[];
  requests: RequestDetail[];
  isLoading: boolean;
  error: string | null;
  /** Derived counts for the dashboard stat cards. */
  stats: { owned: number; borrowed: number; lent: number; pending: number; overdue: number };
  refresh: () => Promise<void>;
  returnBook: (loanId: string) => Promise<void>;
  editCopy: (copyId: string, patch: CopyPatch) => Promise<void>;
  deleteCopy: (copyId: string) => Promise<void>;
  requestBook: (copyId: string, kind: RequestKind, offeredCopyId?: string | null) => Promise<void>;
  respondToRequest: (requestId: string, accept: boolean) => Promise<void>;
  withdrawRequest: (requestId: string) => Promise<void>;
};

const LibraryContext = createContext<LibraryValue | null>(null);

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong.';
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [shelf, setShelf] = useState<Listing[]>([]);
  const [borrowed, setBorrowed] = useState<LoanDetail[]>([]);
  const [lent, setLent] = useState<LoanDetail[]>([]);
  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // One round trip per collection; they are independent.
      const [nextShelf, nextBorrowed, nextLent, nextRequests] = await Promise.all([
        getMyShelf(),
        getBorrowedBooks(),
        getLentBooks(),
        getPendingRequests(),
      ]);
      setShelf(nextShelf);
      setBorrowed(nextBorrowed);
      setLent(nextLent);
      setRequests(nextRequests);
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

  const returnBook = useCallback(
    async (loanId: string) => {
      await returnLoan(loanId);
      await refresh();
    },
    [refresh]
  );

  const editCopy = useCallback(
    async (copyId: string, patch: CopyPatch) => {
      await updateCopy(copyId, patch);
      await refresh();
    },
    [refresh]
  );

  const deleteCopy = useCallback(
    async (copyId: string) => {
      await removeCopy(copyId);
      await refresh();
    },
    [refresh]
  );

  const requestBook = useCallback(
    async (copyId: string, kind: RequestKind, offeredCopyId: string | null = null) => {
      await createRequest(copyId, kind, offeredCopyId);
      await refresh();
    },
    [refresh]
  );

  const respondToRequest = useCallback(
    async (requestId: string, accept: boolean) => {
      await (accept ? acceptRequest(requestId) : declineRequest(requestId));
      await refresh();
    },
    [refresh]
  );

  const withdrawRequest = useCallback(
    async (requestId: string) => {
      await cancelRequest(requestId);
      await refresh();
    },
    [refresh]
  );

  const stats = useMemo(
    () => ({
      owned: shelf.length,
      borrowed: borrowed.length,
      lent: lent.length,
      pending: requests.length,
      overdue: borrowed.filter((detail) => isOverdue(detail.loan)).length,
    }),
    [shelf, borrowed, lent, requests]
  );

  const value = useMemo(
    () => ({
      shelf,
      borrowed,
      lent,
      requests,
      isLoading,
      error,
      stats,
      refresh,
      returnBook,
      editCopy,
      deleteCopy,
      requestBook,
      respondToRequest,
      withdrawRequest,
    }),
    [
      shelf,
      borrowed,
      lent,
      requests,
      isLoading,
      error,
      stats,
      refresh,
      returnBook,
      editCopy,
      deleteCopy,
      requestBook,
      respondToRequest,
      withdrawRequest,
    ]
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
