import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { BookCover } from '@/components/book-cover';
import {
  CONDITION_BADGE,
  CONDITION_LABEL,
  STATUS_LABEL,
  STATUS_SHORT,
  STATUS_TONE,
  shortName,
} from '@/components/my-books/shelf-status';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { LoanDetail } from '@/services/loans';
import type { Listing } from '@/types';

/** Book covers are roughly 1:1.4. */
const COVER_RATIO = 1.4;
const BADGE = 26;

export type ShelfBookTileProps = {
  listing: Listing;
  loan?: LoanDetail;
  onOpen: () => void;
};

/**
 * The grid counterpart of `ShelfBookCard` — cover first, the same status
 * language, and no row actions, because a two-up tile has no room for them.
 */
export function ShelfBookTile({ listing, loan, onOpen }: ShelfBookTileProps) {
  const { width } = useWindowDimensions();
  const { book, copy } = listing;

  // Two tiles, the screen gutter on each side and one gutter between them.
  const tileWidth = (width - Spacing.gutter * 3) / 2;
  const coverWidth = Math.round(tileWidth - Spacing.gutter * 2);
  const coverHeight = Math.round(coverWidth * COVER_RATIO);

  // The tile is half a screen wide, so the pill takes the short form while the
  // screen reader still hears who is holding the copy.
  const spoken =
    copy.status === 'lent-out' && loan
      ? `${STATUS_LABEL['lent-out']} · ${shortName(loan.counterparty.name)}`
      : STATUS_LABEL[copy.status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}. ${spoken}. Opens for editing.`}
      onPress={onOpen}
      // A lone tile on the last row must not stretch across both columns.
      style={({ pressed }) => [styles.tile, { maxWidth: tileWidth, opacity: pressed ? 0.85 : 1 }]}>
      <Card style={styles.card}>
        <View accessible accessibilityLabel={CONDITION_LABEL[copy.condition]}>
          <BookCover
            title={book.title}
            author={book.author}
            isbn={book.isbn}
            width={coverWidth}
            height={coverHeight}
            radius={Radius.sm}
          />
          <View style={styles.conditionBadge}>
            <Text variant="label" color="onInverseSurface">
              {CONDITION_BADGE[copy.condition]}
            </Text>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text variant="titleBook" color="onSurface" numberOfLines={2}>
            {book.title}
          </Text>
          <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
            {book.author}
          </Text>
        </View>

        <Pill label={STATUS_SHORT[copy.status]} tone={STATUS_TONE[copy.status]} dot />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
  },
  card: {
    flex: 1,
    gap: Spacing.xl,
  },
  conditionBadge: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    width: BADGE,
    height: BADGE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.inverseSurface,
  },
  copyBlock: {
    gap: Spacing.xxs,
  },
});
