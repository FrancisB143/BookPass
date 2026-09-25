import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import type { OpenLibraryBook } from '@/services/open-library';

export type DiscoverResultCardProps = {
  book: OpenLibraryBook;
  /** True when this ISBN is already in our own database. */
  alreadyOwned: boolean;
  onAdd: () => void;
};

/** One Open Library search hit, with the details we can carry into the form. */
export function DiscoverResultCard({ book, alreadyOwned, onAdd }: DiscoverResultCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <BookCover
          title={book.title}
          author={book.author}
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
            {book.firstPublishYear ? (
              <Text variant="caption" color="onSurfaceMuted">
                {book.firstPublishYear}
              </Text>
            ) : null}
            {book.subject ? (
              <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
                {book.subject}
              </Text>
            ) : null}
          </View>

          {book.isbn ? (
            <Text variant="micro" color="onSurfaceMuted">
              ISBN {book.isbn}
            </Text>
          ) : null}
        </View>
      </View>

      {alreadyOwned ? (
        <View style={styles.owned}>
          <Pill label="Already in your library" tone="success" dot />
        </View>
      ) : (
        <Button label="Add to library" icon="add" onPress={onAdd} block />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  details: {
    flex: 1,
    gap: Spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  owned: {
    alignItems: 'flex-start',
  },
});
