/**
 * The vocabulary the My Books screen shares between its parts.
 *
 * Status labels, condition badges and the filter set live here rather than in
 * the card, because the chip row counts by the same buckets the cards render —
 * and the two drifting apart is how a filter starts lying about its count.
 */

import type { CopyCondition, CopyStatus, Listing } from '@/types';

/** The chip row's buckets: every status, plus "everything". */
export type ShelfFilter = 'all' | CopyStatus;

export const SHELF_FILTERS: { value: ShelfFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'on-shelf', label: 'On Shelf' },
  { value: 'lent-out', label: 'Lent Out' },
  { value: 'available-for-swap', label: 'For Exchange' },
];

export type ShelfSort = 'recent' | 'title' | 'author';

export const SHELF_SORTS: { value: ShelfSort; label: string }[] = [
  { value: 'recent', label: 'Recently added' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'author', label: 'Author A–Z' },
];

/** `Pill` has no rose tone, and the frame draws "Lent Out" on peach anyway. */
export const STATUS_TONE: Record<CopyStatus, 'success' | 'accent'> = {
  'on-shelf': 'success',
  'lent-out': 'accent',
  'available-for-swap': 'accent',
};

export const STATUS_LABEL: Record<CopyStatus, string> = {
  'on-shelf': 'Available on Shelf',
  'lent-out': 'Lent Out',
  'available-for-swap': 'Available for Exchange',
};

/** The disc over the cover's corner — "PB" / "HB" in the frame. */
export const CONDITION_BADGE: Record<CopyCondition, string> = {
  hardcover: 'HB',
  paperback: 'PB',
};

export const CONDITION_LABEL: Record<CopyCondition, string> = {
  hardcover: 'Hardcover',
  paperback: 'Paperback',
};

/** "Marcus Lim" reads as "Marcus L." inside a pill that has to stay one line. */
export function shortName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last.charAt(0)}.` : first;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** "Oct 28" — the short form the due strip uses. */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function pluralDays(count: number): string {
  return count === 1 ? '1 day' : `${count} days`;
}

export function matchesQuery(listing: Listing, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const { book } = listing;
  return (
    book.title.toLowerCase().includes(needle) ||
    book.author.toLowerCase().includes(needle) ||
    book.genre.toLowerCase().includes(needle)
  );
}

/** The two-up grid has no room for the long form. */
export const STATUS_SHORT: Record<CopyStatus, string> = {
  'on-shelf': 'On Shelf',
  'lent-out': 'Lent Out',
  'available-for-swap': 'For Exchange',
};
