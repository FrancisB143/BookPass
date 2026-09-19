/**
 * The vocabulary the Borrowed screen shares between its parts.
 *
 * A loan's urgency is read in exactly one place — `toneFor` — and everything
 * downstream (the badge, the countdown, the progress fill, the summary banner,
 * the chip counts) colours itself from the same answer. That is what stops a
 * row reading "Due soon" in green while the banner calls it overdue.
 */

import type Ionicons from '@expo/vector-icons/Ionicons';

import { Colors, type ThemeColor } from '@/constants/theme';
import { LOAN_PERIOD_DAYS, daysUntilDue, isDueSoon, isOverdue } from '@/services/loans';
import type { Loan } from '@/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
/** Inside two days the countdown reads in hours, as the frame's "26h left" does. */
const HOURS_CUTOFF = 48;

/** How a loan is doing, worst first. */
export type LoanTone = 'overdue' | 'due-soon' | 'healthy';

export function toneFor(loan: Loan): LoanTone {
  if (isOverdue(loan)) return 'overdue';
  if (isDueSoon(loan)) return 'due-soon';
  return 'healthy';
}

export type ToneStyle = {
  /** The badge dot, the progress fill and the due date. */
  accent: string;
  /** Text colour that sits on `container` and on white. */
  foreground: ThemeColor;
  /** Badge background. */
  container: string;
  /** The soft wash an escalated card and the summary banner are drawn on. */
  wash: readonly [string, string];
  icon: keyof typeof Ionicons.glyphMap;
};

export const TONES: Record<LoanTone, ToneStyle> = {
  overdue: {
    accent: Colors.error,
    foreground: 'error',
    container: Colors.errorContainer,
    wash: [Colors.errorContainer, Colors.surface],
    icon: 'alert-circle',
  },
  'due-soon': {
    accent: Colors.warning,
    foreground: 'warning',
    container: Colors.errorContainer,
    wash: [Colors.errorContainer, Colors.surfaceBright],
    icon: 'hourglass-outline',
  },
  healthy: {
    accent: Colors.success,
    foreground: 'success',
    container: Colors.successContainer,
    wash: [Colors.successContainer, Colors.surfaceBright],
    icon: 'speedometer-outline',
  },
};

/** "Oct 25" — the short date the frame's badges and meta lines use. */
export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** "5:00 PM" — only shown once a loan is down to its last day. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function pluralDays(count: number): string {
  return count === 1 ? '1 day' : `${count} days`;
}

/**
 * Whole calendar days between today and a date.
 *
 * `daysUntilDue` rounds up from the exact instant, which calls a book due in
 * two hours "1 day" — fine for a countdown, wrong for the words "today" and
 * "tomorrow", so the labels count dates instead.
 */
function calendarDaysUntil(iso: string, now: Date = new Date()): number {
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);
}

/** The badge on the top-left of a row: "Overdue by 3 days", "In 12 days (Nov 4)". */
export function dueLabel(loan: Loan, now: Date = new Date()): string {
  if (isOverdue(loan, now)) {
    return `Overdue by ${pluralDays(Math.abs(daysUntilDue(loan, now)))}`;
  }

  const days = calendarDaysUntil(loan.dueAt, now);
  if (days <= 0) return `Due today, ${formatTime(loan.dueAt)}`;
  if (days === 1) return `Due tomorrow, ${formatTime(loan.dueAt)}`;
  return `In ${days} days (${formatDay(loan.dueAt)})`;
}

/** The counterweight on the right of the badge row: "26h left", "Healthy Pace". */
export function paceLabel(loan: Loan, now: Date = new Date()): string {
  const remaining = new Date(loan.dueAt).getTime() - now.getTime();

  if (isOverdue(loan, now)) {
    return `${Math.abs(daysUntilDue(loan, now))}d overdue`;
  }

  const hours = Math.ceil(remaining / MS_PER_HOUR);
  if (hours < HOURS_CUTOFF) return `${Math.max(hours, 1)}h left`;
  if (isDueSoon(loan, now)) return `${daysUntilDue(loan, now)}d left`;
  return 'Healthy Pace';
}

/**
 * How much of the lending period has been used, as a whole percentage.
 *
 * A loan runs `LOAN_PERIOD_DAYS`; a longer span is honoured so an extended
 * loan does not read as instantly overdue. Clamped, because a bar wider than
 * its track is a layout bug, not a stronger warning — the colour does that.
 */
export function elapsedPercent(loan: Loan, now: Date = new Date()): number {
  const start = new Date(loan.borrowedAt).getTime();
  const due = new Date(loan.dueAt).getTime();
  const period = Math.max(due - start, LOAN_PERIOD_DAYS * MS_PER_DAY);
  const elapsed = now.getTime() - start;

  return Math.min(100, Math.max(0, Math.round((elapsed / period) * 100)));
}

/** Which list the screen is showing — the frame's two-up switcher. */
export type LendingSide = 'borrowed' | 'lent';

/** The chip row's buckets: everything, then the two that need attention. */
export type BorrowFilter = 'all' | 'due-soon' | 'overdue';

export const BORROW_FILTERS: { value: BorrowFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'due-soon', label: 'Due Soon' },
  { value: 'overdue', label: 'Overdue' },
];

export function matchesFilter(loan: Loan, filter: BorrowFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'overdue') return isOverdue(loan);
  return isDueSoon(loan);
}

/** "Marcus Lim" reads as "Marcus L." where a line has to stay short. */
export function shortName(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last.charAt(0)}.` : first;
}
