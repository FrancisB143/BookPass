/**
 * The vocabulary the Exchange screen shares between its parts.
 *
 * The filter set lives here rather than in the chip row because the chips and
 * the fetch have to agree — `EXCHANGE_FILTERS` is typed as `ExchangeFilter`,
 * so a chip that does not map to a query the service understands cannot be
 * written in the first place.
 */

import type { ExchangeFilter } from '@/services/catalog';
import type { CopyCondition } from '@/types';

export const EXCHANGE_FILTERS: { value: ExchangeFilter; label: string }[] = [
  { value: 'all', label: 'All Exchanges' },
  { value: 'open-for-trade', label: 'Open for Trade' },
  { value: 'direct-swaps', label: 'Direct Swaps' },
];

/** The disc over the cover's corner — "HC" / "PB" in the frame. */
export const CONDITION_DISC: Record<CopyCondition, string> = {
  hardcover: 'HC',
  paperback: 'PB',
};

export const CONDITION_LABEL: Record<CopyCondition, string> = {
  hardcover: 'Hardcover',
  paperback: 'Paperback',
};

/**
 * "Sci-Fi, Tech, or Philosophy". An owner with nothing listed is open to
 * anything, which is what separates "Open for Trade" from a direct swap.
 */
export function seekingLine(seeking: string[]): string {
  if (seeking.length === 0) return 'Open to any trade';
  if (seeking.length === 1) return seeking[0];

  const last = seeking[seeking.length - 1];
  return `${seeking.slice(0, -1).join(', ')}, or ${last}`;
}

/** "Leo Katsaros" reads as "Leo K." inside a pill that has to stay one line. */
export function shortName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest[rest.length - 1];
  return last ? `${first} ${last.charAt(0)}.` : first;
}

/** "Library Cafe Hub (0.3 mi)" — the pickup line under every listing. */
export function pickupLine(hub: string, distanceMi: number): string {
  return `${hub} (${distanceMi.toFixed(1)} mi)`;
}
