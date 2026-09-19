import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import {
  TONES,
  dueLabel,
  elapsedPercent,
  formatDay,
  paceLabel,
  shortName,
  toneFor,
  type LendingSide,
} from '@/components/borrowed/borrowed-status';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { LoanDetail } from '@/services/loans';

const COVER = { width: 64, height: 88 } as const;
const TRACK_HEIGHT = 6;

export type LoanCardProps = {
  detail: LoanDetail;
  /** Borrowed rows return the book; lent rows are waiting on someone else. */
  side: LendingSide;
  busy: boolean;
  onReturn: () => void;
};

/**
 * One loan.
 *
 * Every escalation on the card — the wash behind it, the badge, the progress
 * fill, the countdown — comes from a single `toneFor` call, so a row cannot
 * read "healthy" in one corner and "overdue" in another.
 */
export function LoanCard({ detail, side, busy, onReturn }: LoanCardProps) {
  const { loan, book, copy, counterparty } = detail;
  const tone = TONES[toneFor(loan)];
  const elapsed = elapsedPercent(loan);
  const borrowing = side === 'borrowed';

  return (
    <Card padded={false} style={styles.card}>
      <LinearGradient colors={tone.wash} style={styles.wash}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: tone.container }]}>
            <Ionicons name={tone.icon} size={14} color={tone.accent} />
            <Text variant="label" color={tone.foreground} numberOfLines={1}>
              {dueLabel(loan)}
            </Text>
          </View>
          <Text variant="label" color={tone.foreground}>
            {paceLabel(loan)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.row}>
          <BookCover
            title={book.title}
            author={book.author}
            isbn={book.isbn}
            width={COVER.width}
            height={COVER.height}
            radius={Radius.sm}
          />

          <View style={styles.details}>
            <Pill label={book.genre} tone="neutral" />
            <Text variant="titleBook" color="onSurface" numberOfLines={2}>
              {book.title}
            </Text>
            <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
              {book.author}
            </Text>

            <View style={styles.person}>
              <Ionicons
                name={borrowing ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                size={14}
                color={Colors.onSurfaceMuted}
              />
              <Text variant="caption" color="onSurfaceVariant" numberOfLines={1}>
                {borrowing ? 'From' : 'With'} {shortName(counterparty.name)} · {copy.hub}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progress}>
          <View style={styles.track}>
            <View
              style={[styles.fill, { width: `${elapsed}%`, backgroundColor: tone.accent }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text variant="micro" color="onSurfaceMuted">
              Borrowed {formatDay(loan.borrowedAt)}
            </Text>
            <Text variant="micro" color="onSurfaceMuted">
              Due {formatDay(loan.dueAt)}
            </Text>
          </View>
        </View>

        <Button
          label={borrowing ? 'Return this book' : 'Mark returned'}
          icon="checkmark-circle-outline"
          variant={borrowing ? 'primary' : 'secondary'}
          onPress={onReturn}
          busy={busy}
          block
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  wash: {
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  badge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  body: {
    gap: Spacing.gutter,
    padding: Spacing.gutter,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  details: {
    flex: 1,
    gap: Spacing.xs,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xxs,
  },
  progress: {
    gap: Spacing.md,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
    overflow: 'hidden',
  },
  fill: {
    height: TRACK_HEIGHT,
    borderRadius: Radius.pill,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
