/** Shared domain types. Everything the app renders is one of these shapes. */

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  /** One-paragraph blurb shown on the detail screen. */
  blurb: string;
  /** Physical copies the library holds. */
  totalCopies: number;
  /**
   * Emoji stand-in for cover art. Keeps the template free of binary assets;
   * swap for an image URL when real covers arrive.
   */
  cover: string;
};

export type Loan = {
  id: string;
  bookId: string;
  /** ISO 8601 timestamps. Stored as strings so they survive JSON round-trips. */
  borrowedAt: string;
  dueAt: string;
  /** `null` while the book is still out. */
  returnedAt: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  /** Library card number shown on the profile screen. */
  cardNumber: string;
};
