import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { OpenLibraryBook } from '@/services/open-library';

const COVER = { width: 74, height: 106 } as const;
const ADD_BUTTON = 44;

export type DiscoverResultCardProps = {
  book: OpenLibraryBook;
  /** True when this ISBN is already in our own database. */
  alreadyOwned: boolean;
  onAdd: () => void;
};

/**
 * One Open Library search hit.
 *
 * A full-width button on every row turns a list of ten results into a wall of
 * identical orange bars, and the eye stops reading the books. The action is a
 * single round button instead — still a 44pt target, but subordinate to the
 * cover and title, which are what you are actually scanning.
 */
export function DiscoverResultCard({ book, alreadyOwned, onAdd }: DiscoverResultCardProps) {
  const meta = [
    book.firstPublishYear ? String(book.firstPublishYear) : null,
    book.subject,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <Card style={styles.card}>
      <BookCover
        title={book.title}
        author={book.author}
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

        {book.isbn ? (
          <Text variant="micro" color="onSurfaceMuted" numberOfLines={1}>
            ISBN {book.isbn}
          </Text>
        ) : null}
      </View>

      {alreadyOwned ? (
        <View
          accessible
          accessibilityLabel="Already in your library"
          style={[styles.action, styles.owned]}>
          <Ionicons name="checkmark" size={20} color={Colors.onSuccessContainer} />
        </View>
      ) : (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={`Add ${book.title} to your library`}
          onPress={onAdd}
          style={[styles.action, styles.add]}>
          <Ionicons name="add" size={22} color={Colors.onPrimary} />
        </PressableScale>
      )}
    </Card>
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
  action: {
    width: ADD_BUTTON,
    height: ADD_BUTTON,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    backgroundColor: Colors.primary,
  },
  owned: {
    backgroundColor: Colors.successContainer,
  },
});
