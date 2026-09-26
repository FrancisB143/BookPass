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
import { Overline, Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { useAsync } from '@/hooks/use-async';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  fetchTrending,
  searchOpenLibrary,
  TRENDING_LABEL,
  type OpenLibraryBook,
} from '@/services/open-library';

/** Which window the popular list ranks over. */
const TRENDING_PERIOD = 'weekly';

/**
 * Discover — the third-party API screen.
 *
 * With nothing typed it shows what Open Library reports as most-read this
 * week; typing searches instead. A search box over an empty screen asks the
 * reader to already know what they want, which is the opposite of
 * discovering — so there is always something to look at.
 *
 * Either way a result can be handed straight to the Add Book form with its
 * fields prefilled, so a book found here becomes a row in our own database in
 * two taps. This screen only ever reads from Open Library; writing is the
 * custom API's job, and the handover happens through route params.
 */
export default function DiscoverScreen() {
  const { books } = useBooks();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 400);

  const searching = debounced.trim() !== '';

  // One request either way — whichever the search box calls for.
  const load = useCallback(
    () => (searching ? searchOpenLibrary(debounced) : fetchTrending(TRENDING_PERIOD)),
    [searching, debounced]
  );
  const results = useAsync(load);

  const ownedIsbns = new Set(books.map((book) => book.isbn).filter(Boolean) as string[]);
  const ownedTitles = new Set(
    books.map((book) => `${book.title}|${book.author}`.trim().toLowerCase())
  );

  /**
   * Whether a result is already on the shelf.
   *
   * ISBN alone is not enough: a work has many editions, and Open Library's
   * trending list happens to return a different one than the copy you own —
   * "Atomic Habits" comes back as a UK edition whose ISBN will never match the
   * one in the library. Title and author catch that case.
   */
  function isOwned(book: OpenLibraryBook): boolean {
    if (book.isbn && ownedIsbns.has(book.isbn)) return true;
    return ownedTitles.has(`${book.title}|${book.author}`.trim().toLowerCase());
  }

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

  const heading = searching ? 'Results' : `Popular ${TRENDING_LABEL[TRENDING_PERIOD].toLowerCase()}`;
  const subheading = searching
    ? `Matching “${debounced.trim()}”`
    : 'The most-read books on Open Library right now';

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

            {/* Naming the list matters more than usual here: the same rows mean
                "most-read right now" or "matches your search" depending on the
                box above, and nothing else on screen says which. */}
            {results.status === 'success' && results.data.length > 0 ? (
              <View style={styles.sectionHeading}>
                <Overline color="onSurfaceMuted">{heading}</Overline>
                <Text variant="caption" color="onSurfaceMuted">
                  {subheading}
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          results.status === 'loading' ? (
            <LoadingState
              label={searching ? 'Searching Open Library…' : 'Loading popular books…'}
            />
          ) : results.status === 'error' ? (
            <ErrorState message={results.error} onRetry={results.reload} />
          ) : searching ? (
            <EmptyState
              icon="search-outline"
              title="No results"
              message={`Open Library has nothing for “${debounced.trim()}”.`}
            />
          ) : (
            <EmptyState
              icon="compass-outline"
              title="Nothing to show"
              message="Open Library did not return any popular books just now. Try a search instead."
              action={{ label: 'Try again', onPress: results.reload }}
            />
          )
        }
        renderItem={({ item, index }) => (
          <Appear index={index}>
            <DiscoverResultCard
              book={item}
              alreadyOwned={isOwned(item)}
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
  sectionHeading: {
    gap: Spacing.xxs,
    marginTop: Spacing.md,
  },
});
