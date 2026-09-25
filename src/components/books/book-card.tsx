import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { StatusPill } from '@/components/books/status-pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import type { Book } from '@/types';

export type BookCardProps = {
  book: Book;
  onPress: () => void;
};

/** A row in the list view. Tapping it opens the detail screen. */
export function BookCard({ book, onPress }: BookCardProps) {
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
          width={60}
          height={82}
        />

        <View style={styles.details}>
          <Text variant="titleBook" color="onSurface" numberOfLines={2}>
            {book.title}
          </Text>
          <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
            {book.author}
          </Text>

          <View style={styles.meta}>
            <StatusPill status={book.status} />
            {book.genre ? (
              <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
                {book.genre}
              </Text>
            ) : null}
            {book.publishedYear ? (
              <Text variant="caption" color="onSurfaceMuted">
                {book.publishedYear}
              </Text>
            ) : null}
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
    gap: Spacing.xl,
  },
  details: {
    flex: 1,
    gap: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xxs,
  },
});
