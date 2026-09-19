/**
 * Domain types for peer-to-peer lending.
 *
 * The load-bearing decision is that `Book` (the work) is separate from `Copy`
 * (one person's physical copy of it). The marketplace shows two members both
 * offering "Atomic Habits" with different conditions, hubs and swap status —
 * which is impossible if ownership lives on the book itself.
 */

export type UserId = string;

export type User = {
  id: UserId;
  name: string;
  /** Remote avatar URL; falls back to initials when absent. */
  avatar?: string;
  /** Community rating out of 5, e.g. 4.9. */
  rating: number;
  /** Completed swaps — shown beside the rating as social proof. */
  swapCount: number;
  /** Pickup point, e.g. "Library Cafe Hub". */
  hub: string;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  year?: number;
  /** Drives cover lookup from Open Library. */
  isbn?: string;
  blurb?: string;
};

export type CopyCondition = 'hardcover' | 'paperback';

export type CopyStatus =
  /** Owned and at home. */
  | 'on-shelf'
  /** Currently lent to another member. */
  | 'lent-out'
  /** Listed on the exchange. */
  | 'available-for-swap';

/** One member's physical copy of a book. */
export type Copy = {
  id: string;
  bookId: string;
  ownerId: UserId;
  condition: CopyCondition;
  status: CopyStatus;
  hub: string;
  /** Distance from the current user, in miles. */
  distanceMi: number;
  /** Genres the owner will trade for, e.g. ["Sci-Fi", "Tech"]. */
  seeking: string[];
  addedAt: string;
};

/** A copy in someone else's hands. Has two sides, unlike a library loan. */
export type Loan = {
  id: string;
  copyId: string;
  lenderId: UserId;
  borrowerId: UserId;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
};

export type RequestKind = 'borrow' | 'exchange';

export type RequestStatus = 'pending' | 'accepted' | 'declined';

export type ExchangeRequest = {
  id: string;
  /** The copy being asked for. */
  copyId: string;
  fromUserId: UserId;
  toUserId: UserId;
  kind: RequestKind;
  /** What the requester puts up in return. Null for a plain borrow. */
  offeredCopyId: string | null;
  status: RequestStatus;
  createdAt: string;
};

/** A copy joined to its book and owner — what list rows actually render. */
export type Listing = {
  copy: Copy;
  book: Book;
  owner: User;
};
