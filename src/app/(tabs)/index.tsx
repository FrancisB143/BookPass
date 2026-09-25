import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { BookCard } from '@/components/books/book-card';
import { BookTile } from '@/components/books/book-tile';
import { FilterRail } from '@/components/books/filter-rail';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Appear } from '@/components/ui/appear';
import { Field } from '@/components/ui/field';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { BOOK_STATUSES, STATUS_LABEL, type Book, type BookStatus } from '@/types';

type Filter = BookStatus | 'all';
type LayoutMode = 'list' | 'grid';

/** Case-insensitive match across the fields a reader would search by. */
function matches(book: Book, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle === '') return true;

  return [book.title, book.author, book.genre ?? '', book.isbn ?? ''].some((field) =>
    field.toLowerCase().includes(needle)
  );
}

/**
 * The catalogue — the app's Read screen.
 *
 * Filtering happens here rather than over the network: the whole catalogue is
 * already loaded, and a round trip per keystroke would be slower without
 * showing anything new. The API supports `?search=` and `?status=` too, for
 * when the library outgrows a single fetch.
 */
export default function BooksScreen() {
  const { books, isLoading, error, refresh } = useBooks();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<LayoutMode>('list');

  const visible = useMemo(
    () => books.filter((book) => (filter === 'all' || book.status === filter) && matches(book, query)),
    [books, filter, query]
  );

  // Counts come off the unfiltered list, so a chip never reads zero for the
  // bucket you are already looking at.
  const counts = useMemo(() => {
    const all: Record<Filter, number> = { all: books.length, available: 0, borrowed: 0, reserved: 0 };
    for (const book of books) all[book.status] += 1;
    return all;
  }, [books]);

  const appBar = (
    <AppBar
      title="BookPass"
      subtitle={`${books.length} ${books.length === 1 ? 'book' : 'books'} in the library`}
      actions={
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={view === 'list' ? 'Switch to grid view' : 'Switch to list view'}
          onPress={() => setView(view === 'list' ? 'grid' : 'list')}
          style={styles.viewToggle}>
          <Ionicons
            name={view === 'list' ? 'grid-outline' : 'list-outline'}
            size={20}
            color={Colors.onSurface}
          />
        </PressableScale>
      }
    />
  );

  if (isLoading && books.length === 0) {
    return (
      <Screen>
        {appBar}
        <LoadingState label="Loading the library…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        {appBar}
        <ErrorState message={error} onRetry={refresh} />
      </Screen>
    );
  }

  const narrowed = query.trim() !== '' || filter !== 'all';

  return (
    <Screen>
      {appBar}

      <FlatList
        // Changing the column count needs a fresh list, not a re-render.
        key={view}
        data={visible}
        keyExtractor={(book) => String(book.id)}
        numColumns={view === 'grid' ? 2 : 1}
        columnWrapperStyle={view === 'grid' ? styles.column : undefined}
        contentContainerStyle={[styles.list, visible.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Field
              icon="search-outline"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              onChangeText={setQuery}
              placeholder="Search title, author, genre or ISBN"
              value={query}
            />

            <FilterRail<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All', count: counts.all },
                ...BOOK_STATUSES.map((status) => ({
                  value: status,
                  label: STATUS_LABEL[status],
                  count: counts[status],
                })),
              ]}
            />
          </View>
        }
        ListEmptyComponent={
          narrowed ? (
            <EmptyState
              icon="search-outline"
              title="No matches"
              message="No book in the library matches that search."
              action={{
                label: 'Clear filters',
                onPress: () => {
                  setQuery('');
                  setFilter('all');
                },
              }}
            />
          ) : (
            <EmptyState
              icon="library-outline"
              title="The library is empty"
              message="Add your first book, or find one on Discover."
              action={{ label: 'Add a book', onPress: () => router.push('/add-book') }}
            />
          )
        }
        ListFooterComponent={
          // Only worth saying once the list is narrowed — unfiltered, the app
          // bar already gives the total.
          narrowed && visible.length > 0 ? (
            <Text variant="caption" color="onSurfaceMuted" style={styles.footer}>
              Showing {visible.length} of {books.length}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) =>
          view === 'grid' ? (
            <Appear index={index} style={styles.tile}>
              <BookTile book={item} onPress={() => router.push(`/book/${item.id}`)} />
            </Appear>
          ) : (
            <Appear index={index}>
              <BookCard book={item} onPress={() => router.push(`/book/${item.id}`)} />
            </Appear>
          )
        }
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
  listEmpty: {
    flexGrow: 1,
  },
  column: {
    gap: Spacing.xl,
  },
  // The tile is flex:1, so its animation wrapper must be too or the two-column
  // row collapses.
  tile: {
    flex: 1,
  },
  header: {
    gap: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  viewToggle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    paddingTop: Spacing.md,
  },
});
