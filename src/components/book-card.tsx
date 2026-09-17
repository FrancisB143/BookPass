import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Book } from '@/types';

export type BookCardProps = {
  book: Book;
  onPress: () => void;
  /** Marks the book as already out on this member's card. */
  borrowed?: boolean;
};

export function BookCard({ book, onPress, borrowed = false }: BookCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      <View style={[styles.cover, { backgroundColor: theme.background }]}>
        <ThemedText style={styles.coverGlyph}>{book.cover}</ThemedText>
      </View>

      <View style={styles.details}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {book.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {book.author}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {book.genre} · {book.year}
        </ThemedText>
      </View>

      {borrowed ? (
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <ThemedText type="small" style={{ color: theme.accentText }}>
            Out
          </ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cover: {
    width: 56,
    height: 72,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGlyph: {
    fontSize: 28,
    lineHeight: 34,
  },
  details: {
    flex: 1,
    gap: Spacing.half,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
});
