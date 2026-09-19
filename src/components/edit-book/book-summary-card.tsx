import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Book, CopyStatus } from '@/types';

const COVER_WIDTH = 96;
const COVER_HEIGHT = 144;

/** The eyebrow over the title says what the copy is doing right now. */
const STATUS_BADGE: Record<CopyStatus, { label: string; tone: 'success' | 'accent' }> = {
  'on-shelf': { label: 'On Your Shelf', tone: 'success' },
  'lent-out': { label: 'Lent Out', tone: 'accent' },
  'available-for-swap': { label: 'Active Listing', tone: 'success' },
};

export type BookSummaryCardProps = {
  book: Book;
  status: CopyStatus;
  /** The live title being typed, so the card tracks the form as it is edited. */
  title: string;
  author: string;
  isbn?: string;
  onChangeCover: () => void;
  onScanIsbn: () => void;
};

/**
 * The card at the top of the edit form: which book is being changed, and the
 * two cover affordances the frame hangs off it.
 *
 * Title and author come from the form rather than the loaded record, so the
 * preview updates as the fields are typed into.
 */
export function BookSummaryCard({
  book,
  status,
  title,
  author,
  isbn,
  onChangeCover,
  onScanIsbn,
}: BookSummaryCardProps) {
  const badge = STATUS_BADGE[status];
  const shownTitle = title.trim() || book.title;
  const shownAuthor = author.trim() || book.author;

  return (
    <Card style={styles.card}>
      <View style={styles.coverFrame}>
        <BookCover
          title={shownTitle}
          author={shownAuthor}
          isbn={isbn?.trim() || undefined}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
          radius={Radius.sm}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change cover photo"
          hitSlop={Spacing.md}
          onPress={onChangeCover}
          style={({ pressed }) => [styles.coverBadge, { opacity: pressed ? 0.7 : 1 }]}>
          <Ionicons name="camera" size={12} color={Colors.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Pill label={badge.label.toUpperCase()} tone={badge.tone} />

        <View style={styles.headings}>
          <Text variant="titleBook" color="onSurface" numberOfLines={2}>
            {shownTitle}
          </Text>
          <Text variant="caption" color="onSurfaceVariant" numberOfLines={1}>
            {book.year ? `${shownAuthor} • ${book.year}` : shownAuthor}
          </Text>
        </View>

        <View style={styles.coverActions}>
          <Pressable
            accessibilityRole="button"
            onPress={onChangeCover}
            style={({ pressed }) => [styles.tonalAction, { opacity: pressed ? 0.85 : 1 }]}>
            <Ionicons name="image-outline" size={12} color={Colors.onPrimaryContainer} />
            <Text variant="label" color="onSurface" numberOfLines={1}>
              Change Cover Photo
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onScanIsbn}
            hitSlop={Spacing.md}
            style={({ pressed }) => [styles.ghostAction, { opacity: pressed ? 0.6 : 1 }]}>
            <Text variant="overline" color="onSurfaceVariant" numberOfLines={1}>
              Scan Barcode ISBN
            </Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.gutter,
  },
  coverFrame: {
    width: COVER_WIDTH,
  },
  coverBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: Spacing.x5,
    height: Spacing.x5,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.scrim,
  },
  meta: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  headings: {
    gap: Spacing.xs,
  },
  coverActions: {
    gap: Spacing.md,
  },
  tonalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 32,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  ghostAction: {
    alignItems: 'center',
  },
});
