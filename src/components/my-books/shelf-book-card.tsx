import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import {
  CONDITION_BADGE,
  CONDITION_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  formatDay,
  pluralDays,
  shortName,
} from '@/components/my-books/shelf-status';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Card, Divider } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, type ThemeColor } from '@/constants/theme';
import type { RequestDetail } from '@/services/exchange';
import { daysUntilDue, isDueSoon, isOverdue, type LoanDetail } from '@/services/loans';
import type { Listing } from '@/types';

const COVER = { width: 72, height: 100 };
const BADGE = 28;

export type ShelfBookCardProps = {
  listing: Listing;
  /** The open loan, when this copy is out with someone. */
  loan?: LoanDetail;
  /** Requests other members have made for this copy and not yet had answered. */
  offers: RequestDetail[];
  expanded: boolean;
  onToggle: () => void;
  /** The row tap and the pencil both open the copy for editing. */
  onOpen: () => void;
  onMenu: () => void;
  onReviewOffers: () => void;
  onMarkReturned: () => void;
};

type Strip = {
  background: string;
  foreground: ThemeColor;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
};

/** The due strip escalates: neutral, then peach as it nears, then red once late. */
function dueStrip(detail: LoanDetail): Strip {
  const days = daysUntilDue(detail.loan);

  if (isOverdue(detail.loan)) {
    return {
      background: Colors.errorContainer,
      foreground: 'error',
      icon: 'alert-circle-outline',
      text: `Overdue by ${pluralDays(Math.abs(days))}`,
    };
  }

  const soon = isDueSoon(detail.loan);
  return {
    background: soon ? Colors.primaryContainer : Colors.surfaceVariant,
    foreground: soon ? 'onPrimaryContainer' : 'onSurfaceVariant',
    icon: 'time-outline',
    text: `Due in ${pluralDays(days)} (${formatDay(detail.loan.dueAt)})`,
  };
}

function offerLabel(offers: RequestDetail[]): string {
  if (offers.length > 1) return `${offers.length} Requests Received`;
  return offers[0].request.kind === 'exchange' ? '1 Swap Offer Received' : '1 Borrow Request';
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="caption" color="onSurfaceMuted">
        {label}
      </Text>
      <Text variant="labelLg" color="onSurfaceVariant" style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

/**
 * One catalog row: cover, genre, title, author, status and the actions that
 * belong to the copy. Anything conditional — an unanswered offer, a due date —
 * arrives as a strip beneath the row rather than crowding the status line.
 */
export function ShelfBookCard({
  listing,
  loan,
  offers,
  expanded,
  onToggle,
  onOpen,
  onMenu,
  onReviewOffers,
  onMarkReturned,
}: ShelfBookCardProps) {
  const { book, copy } = listing;
  const status =
    copy.status === 'lent-out' && loan
      ? `${STATUS_LABEL['lent-out']} · ${shortName(loan.counterparty.name)}`
      : STATUS_LABEL[copy.status];
  const strip = loan ? dueStrip(loan) : undefined;

  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${book.title} by ${book.author}. ${status}. Opens for editing.`}
        onPress={onOpen}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}>
        <View accessible accessibilityLabel={CONDITION_LABEL[copy.condition]} style={styles.coverSlot}>
          <BookCover
            title={book.title}
            author={book.author}
            isbn={book.isbn}
            width={COVER.width}
            height={COVER.height}
            radius={Radius.sm}
          />
          <View style={styles.conditionBadge}>
            <Text variant="label" color="onInverseSurface">
              {CONDITION_BADGE[copy.condition]}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.shrink}>
              <Pill label={book.genre} tone="neutral" />
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${book.title}`}
                hitSlop={Spacing.md}
                onPress={onOpen}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Ionicons name="create-outline" size={20} color={Colors.onSurfaceVariant} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`More actions for ${book.title}`}
                hitSlop={Spacing.md}
                onPress={onMenu}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text variant="titleBook" color="onSurface">
              {book.title}
            </Text>
            <Text variant="body" color="onSurfaceMuted" numberOfLines={1}>
              {book.author}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.shrink}>
              <Pill label={status} tone={STATUS_TONE[copy.status]} dot />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={expanded ? 'Hide details' : 'Show details'}
              accessibilityState={{ expanded }}
              hitSlop={Spacing.md}
              onPress={onToggle}
              style={({ pressed }) => [styles.details, { opacity: pressed ? 0.6 : 1 }]}>
              <Text variant="labelLg" color="onPrimaryContainer">
                Details
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={Colors.onPrimaryContainer}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.detailPanel}>
          <Divider />
          <DetailRow label="Format" value={CONDITION_LABEL[copy.condition]} />
          <DetailRow label="Pickup" value={copy.hub} />
          <DetailRow label="Added" value={formatDay(copy.addedAt)} />
          <DetailRow
            label="Seeking"
            value={copy.seeking.length ? copy.seeking.join(' · ') : 'Open to any trade'}
          />
          {loan ? <DetailRow label="Borrowed by" value={loan.counterparty.name} /> : null}
        </View>
      ) : null}

      {offers.length ? (
        <View style={[styles.strip, { backgroundColor: Colors.primaryContainer }]}>
          <Ionicons name="swap-horizontal" size={18} color={Colors.onPrimaryContainer} />
          <Text variant="labelLg" color="onPrimaryContainer" style={styles.stripText}>
            {offerLabel(offers)}
          </Text>
          <Button label="Review Offer" size="sm" onPress={onReviewOffers} />
        </View>
      ) : null}

      {strip && loan ? (
        <View style={[styles.strip, { backgroundColor: strip.background }]}>
          <Ionicons name={strip.icon} size={18} color={Colors[strip.foreground]} />
          <Text variant="labelLg" color={strip.foreground} style={styles.stripText}>
            {strip.text}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Mark ${book.title} as returned`}
            hitSlop={Spacing.md}
            onPress={onMarkReturned}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text variant="labelLg" color="warning">
              Mark returned
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.gutter,
  },
  coverSlot: {
    width: COVER.width,
    height: COVER.height,
  },
  conditionBadge: {
    position: 'absolute',
    right: -Spacing.md,
    bottom: -Spacing.sm,
    width: BADGE,
    height: BADGE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inverseSurface,
    borderWidth: Spacing.xxs,
    borderColor: Colors.surface,
  },
  body: {
    flex: 1,
    gap: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  titleBlock: {
    gap: Spacing.xxs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  shrink: {
    flexShrink: 1,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailPanel: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.gutter,
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingLeft: Spacing.gutter,
    paddingRight: Spacing.md,
    borderRadius: Radius.pill,
  },
  stripText: {
    flex: 1,
  },
});
