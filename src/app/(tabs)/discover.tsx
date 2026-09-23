import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { DiscoverResultCard } from '@/components/discover/discover-result-card';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Appear } from '@/components/ui/appear';
import { Field } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { useAsync } from '@/hooks/use-async';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { searchOpenLibrary, type OpenLibraryBook } from '@/services/open-library';

/**
 * Discover — the third-party API screen.
 *
 * Searches Open Library (https://openlibrary.org/dev/docs/api/search) and
 * hands any result straight to the Add Book form with its fields prefilled, so
 * a book found here becomes a real row in our own database in two taps.
 *
 * This screen only ever reads from Open Library. Writing is the custom API's
 * job, and the handover happens through route params.
 */
export default function DiscoverScreen() {
  const { books } = useBooks();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 400);

  const search = useCallback(() => searchOpenLibrary(debounced), [debounced]);
  const results = useAsync(search);

  /** ISBNs already in our library, so a duplicate can be pointed out. */
  const ownedIsbns = new Set(books.map((book) => book.isbn).filter(Boolean) as string[]);

  function addToLibrary(book: OpenLibraryBook) {
    router.push({
      pathname: '/add-book',
      params: {
        title: book.title,
        author: book.author,
        genre: book.subject ?? '',
        isbn: book.isbn ?? '',
        publishedYear: book.firstPublishYear ? String(book.firstPublishYear) : '',
      },
    });
  }

  const idle = debounced.trim() === '';

  return (
    <Screen>
      <AppBar title="Discover" subtitle="Search Open Library" />

      <FlatList
        data={results.status === 'success' ? results.data : []}
        keyExtractor={(book) => book.key}
        contentContainerStyle={[styles.list, styles.listGrow]}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Field
              icon="search-outline"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={setQuery}
              placeholder="Search by title or author"
              value={query}
            />
            <View style={styles.credit}>
              <Pill label="Open Library API" tone="accent" dot />
              <Text variant="caption" color="onSurfaceMuted">
                openlibrary.org
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          idle ? (
            <EmptyState
              icon="compass-outline"
              title="Find a book"
              message="Search millions of titles on Open Library, then add one to your own library with its details already filled in."
            />
          ) : results.status === 'loading' ? (
            <LoadingState label="Searching Open Library…" />
          ) : results.status === 'error' ? (
            <ErrorState message={results.error} onRetry={results.reload} />
          ) : (
            <EmptyState
              icon="search-outline"
              title="No results"
              message={`Open Library has nothing for “${debounced.trim()}”.`}
            />
          )
        }
        renderItem={({ item, index }) => (
          <Appear index={index}>
            <DiscoverResultCard
              book={item}
              alreadyOwned={Boolean(item.isbn && ownedIsbns.has(item.isbn))}
              onAdd={() => addToLibrary(item)}
            />
          </Appear>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.xl,
    padding: Spacing.gutter,
    paddingBottom: Spacing.x8,
  },
  listGrow: {
    flexGrow: 1,
  },
  header: {
    gap: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  credit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
