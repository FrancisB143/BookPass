import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { StatusPill } from '@/components/books/status-pill';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import type { Book } from '@/types';

export type BookTileProps = {
  book: Book;
  onPress: () => void;
};

/** The grid counterpart of BookCard. */
export function BookTile({ book, onPress }: BookTileProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
      onPress={onPress}
      style={styles.pressable}>
      <Card style={styles.card}>
        <View style={styles.coverRow}>
          <BookCover
            title={book.title}
            author={book.author}
            isbn={book.isbn}
            coverUrl={book.coverUrl}
            width={96}
            height={132}
            radius={Radius.sm}
          />
        </View>

        <Text variant="labelLg" color="onSurface" numberOfLines={2}>
          {book.title}
        </Text>
        <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
          {book.author}
        </Text>
        <StatusPill status={book.status} />
      </Card>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  card: {
    flex: 1,
    gap: Spacing.sm,
  },
  coverRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
});
