import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { StatusPill } from '@/components/books/status-pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Book } from '@/types';

/**
 * Covers carry more recognition than any label in a book list, so they get
 * real estate here. Reading apps that show small covers are routinely
 * criticised for it.
 */
const COVER = { width: 74, height: 106 } as const;

export type BookCardProps = {
  book: Book;
  onPress: () => void;
};

/** A row in the list view. Tapping it opens the detail screen. */
export function BookCard({ book, onPress }: BookCardProps) {
  // Year and genre are the same kind of fact, so they share one muted line
  // instead of competing as separate elements.
  const meta = [book.genre, book.publishedYear ? String(book.publishedYear) : null]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
      onPress={onPress}>
      <Card style={styles.card}>
        <BookCover
          title={book.title}
          author={book.author}
          isbn={book.isbn}
          coverUrl={book.coverUrl}
          width={COVER.width}
          height={COVER.height}
          radius={Radius.xs}
        />

        <View style={styles.details}>
          <Text variant="titleBook" color="onSurface" numberOfLines={2}>
            {book.title}
          </Text>
          <Text variant="body" color="onSurfaceVariant" numberOfLines={1}>
            {book.author}
          </Text>

          {meta ? (
            <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
              {meta}
            </Text>
          ) : null}

          <View style={styles.statusRow}>
            <StatusPill status={book.status} />
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceMuted} />
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  details: {
    flex: 1,
    gap: Spacing.xxs,
  },
  // Pushed down a little so the pill reads as a separate fact from the meta
  // line rather than another word on it.
  statusRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
});
