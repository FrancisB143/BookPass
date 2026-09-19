import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Avatar } from '@/components/home/avatar';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { daysUntilDue, isOverdue, type LoanDetail } from '@/services/loans';
import type { Copy, Listing } from '@/types';

const COVER_WIDTH = 56;
const COVER_HEIGHT = 78;
const OVERFLOW_SIZE = 32;
const META_ICON = 14;
const BORROWER_AVATAR = 24;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "Marcus Lim" becomes "Marcus L." — the frame's borrower format. */
function shortName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0] ?? name;
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  return last ? `${first} ${last.charAt(0)}.` : first;
}

function addedLabel(addedAt: string): string {
  const days = Math.floor((Date.now() - new Date(addedAt).getTime()) / MS_PER_DAY);
  if (days <= 0) return 'Added today';
  if (days === 1) return 'Added yesterday';
  return `Added ${days}d ago`;
}

function StatusBadge({ status }: { status: Copy['status'] }) {
  if (status === 'on-shelf') return <Pill label="On Shelf" tone="success" />;
  if (status === 'available-for-swap') return <Pill label="Available for Swap" tone="accent" />;

  // The frame renders "Lent Out" as bare rose text rather than a badge.
  return (
    <Text variant="label" color="warning">
      Lent Out
    </Text>
  );
}

type MetaProps = { copy: Copy; loan?: LoanDetail; offers: number };

/** The bottom line of a row, which is different for each copy status. */
function RowMeta({ copy, loan, offers }: MetaProps) {
  if (copy.status === 'lent-out') {
    const borrower = loan?.counterparty.name;
    const days = loan ? daysUntilDue(loan.loan) : null;
    const overdue = loan ? isOverdue(loan.loan) : false;

    return (
      <>
        <View style={styles.meta}>
          {borrower ? <Avatar name={borrower} size={BORROWER_AVATAR} /> : null}
          <Text variant="label" color="onSurfaceVariant" numberOfLines={1}>
            {borrower ? shortName(borrower) : 'Out on loan'}
          </Text>
        </View>

        {days === null ? null : (
          <Text variant="label" color={overdue ? 'error' : 'warning'}>
            {overdue ? `${Math.abs(days)}d overdue` : `Due in ${days}d`}
          </Text>
        )}
      </>
    );
  }

  if (copy.status === 'available-for-swap') {
    return (
      <View style={styles.meta}>
        <Ionicons name="swap-horizontal" size={META_ICON} color={Colors.success} />
        <Text variant="label" color="success" numberOfLines={1}>
          {offers > 0 ? `${offers} trade offer${offers === 1 ? '' : 's'}` : 'Open for trade'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.meta}>
      <Ionicons name="time-outline" size={META_ICON} color={Colors.onSurfaceMuted} />
      <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
        {addedLabel(copy.addedAt)}
      </Text>
    </View>
  );
}

export type ShelfRowProps = {
  listing: Listing;
  /** The loan this copy is out on, when it is lent out. */
  loan?: LoanDetail;
  /** Pending requests other members have made for this copy. */
  offers: number;
  onEdit: () => void;
};

/** One book on the current user's shelf, as "Recently Added" renders it. */
export function ShelfRow({ listing, loan, offers, onEdit }: ShelfRowProps) {
  const { book, copy } = listing;

  return (
    <Card style={styles.row}>
      <BookCover
        title={book.title}
        author={book.author}
        isbn={book.isbn}
        width={COVER_WIDTH}
        height={COVER_HEIGHT}
      />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Pill label={book.genre} tone="neutral" />
          <StatusBadge status={copy.status} />
        </View>

        <Text variant="titleBook" color="onSurface">
          {book.title}
        </Text>
        <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
          {book.author}
        </Text>

        <View style={styles.metaRow}>
          <RowMeta copy={copy} loan={loan} offers={offers} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${book.title}`}
            hitSlop={Spacing.md}
            onPress={onEdit}
            style={({ pressed }) => [styles.overflow, { opacity: pressed ? 0.7 : 1 }]}>
            <Ionicons name="ellipsis-vertical" size={META_ICON} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  body: {
    flex: 1,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  meta: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  overflow: {
    width: OVERFLOW_SIZE,
    height: OVERFLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
});
