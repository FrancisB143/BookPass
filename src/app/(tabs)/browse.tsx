import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { BookCard } from '@/components/book-card';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Radius, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useAsync } from '@/hooks/use-async';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTheme } from '@/hooks/use-theme';
import { searchBooks } from '@/services/books';

export default function BrowseScreen() {
  const theme = useTheme();
  const { activeLoanForBook } = useLibrary();

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  const loadBooks = useCallback(() => searchBooks(debouncedQuery), [debouncedQuery]);
  const books = useAsync(loadBooks);

  return (
    <Screen>
      <View style={styles.searchRow}>
        <TextInput
          accessibilityLabel="Search the catalogue"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          onChangeText={setQuery}
          placeholder="Search by title or author"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.search,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          value={query}
        />
      </View>

      {books.status === 'loading' ? (
        <LoadingState label="Loading catalogue…" />
      ) : books.status === 'error' ? (
        <ErrorState message={books.error} onRetry={books.reload} />
      ) : books.data.length === 0 ? (
        <EmptyState
          glyph="🔍"
          title="No matches"
          message={`Nothing in the catalogue matches “${query.trim()}”.`}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={books.data}
          keyboardDismissMode="on-drag"
          keyExtractor={(book) => book.id}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              borrowed={Boolean(activeLoanForBook(item.id))}
              onPress={() => router.push(`/book/${item.id}`)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  search: {
    minHeight: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
  },
  list: {
    padding: Spacing.three,
    paddingTop: Spacing.one,
    gap: Spacing.three,
  },
});
