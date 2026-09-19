import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ShelfAppBar } from '@/components/my-books/shelf-app-bar';
import { ShelfBookCard } from '@/components/my-books/shelf-book-card';
import { ShelfBookTile } from '@/components/my-books/shelf-book-tile';
import { Appear } from '@/components/ui/appear';
import { ShelfHeader, type ShelfView } from '@/components/my-books/shelf-header';
import {
  SHELF_SORTS,
  matchesQuery,
  type ShelfFilter,
  type ShelfSort,
} from '@/components/my-books/shelf-status';
import { ShelfToolbar } from '@/components/my-books/shelf-toolbar';
import { TrustScoreCard } from '@/components/my-books/trust-score-card';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Colors, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import type { LoanDetail } from '@/services/loans';
import type { Listing } from '@/types';

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong.';
}

/**
 * The personal catalog: everything the member owns, with the status of each
 * copy and the actions that belong to it.
 *
 * Search, the status chips and the sort all narrow one list rather than
 * fetching — the shelf is already in `useLibrary()`, and a second source of
 * truth is how a count and a list start disagreeing.
 */
export default function MyBooksScreen() {
  const { shelf, lent, requests, isLoading, error, refresh, deleteCopy, returnBook } = useLibrary();
  const { user } = useSession();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ShelfFilter>('all');
  const [sort, setSort] = useState<ShelfSort>('recent');
  const [view, setView] = useState<ShelfView>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);

  const counts = useMemo<Record<ShelfFilter, number>>(
    () => ({
      all: shelf.length,
      'on-shelf': shelf.filter((listing) => listing.copy.status === 'on-shelf').length,
      'lent-out': shelf.filter((listing) => listing.copy.status === 'lent-out').length,
      'available-for-swap': shelf.filter(
        (listing) => listing.copy.status === 'available-for-swap'
      ).length,
    }),
    [shelf]
  );

  const visible = useMemo(() => {
    const narrowed = shelf.filter(
      (listing) =>
        (filter === 'all' || listing.copy.status === filter) && matchesQuery(listing, query)
    );

    // `recent` is the order the service already returns — newest added first.
    if (sort === 'title') {
      return [...narrowed].sort((a, b) => a.book.title.localeCompare(b.book.title));
    }
    if (sort === 'author') {
      return [...narrowed].sort((a, b) => a.book.author.localeCompare(b.book.author));
    }
    return narrowed;
  }, [shelf, filter, query, sort]);

  const loanFor = useCallback(
    (copyId: string): LoanDetail | undefined =>
      lent.find((detail) => detail.copy.id === copyId),
    [lent]
  );

  const offersFor = useCallback(
    (copyId: string) =>
      requests.filter((detail) => !detail.outgoing && detail.listing.copy.id === copyId),
    [requests]
  );

  const incoming = useMemo(() => requests.filter((detail) => !detail.outgoing), [requests]);

  const openCopy = useCallback((copyId: string) => {
    router.push({ pathname: '/book/[id]', params: { id: copyId } });
  }, []);

  const removeFromShelf = useCallback(
    (listing: Listing) => {
      Alert.alert(
        'Remove from shelf?',
        `“${listing.book.title}” comes off your catalog. This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              deleteCopy(listing.copy.id).catch((cause: unknown) => {
                Alert.alert('Could not remove that book', messageFrom(cause));
              });
            },
          },
        ]
      );
    },
    [deleteCopy]
  );

  const openMenu = useCallback(
    (listing: Listing) => {
      Alert.alert(listing.book.title, listing.book.author, [
        { text: 'Edit details', onPress: () => openCopy(listing.copy.id) },
        { text: 'Remove from shelf', style: 'destructive', onPress: () => removeFromShelf(listing) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [openCopy, removeFromShelf]
  );

  const markReturned = useCallback(
    (detail: LoanDetail) => {
      Alert.alert(
        'Mark as returned?',
        `“${detail.book.title}” goes back on your shelf and ${detail.counterparty.name} is no longer holding it.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark returned',
            onPress: () => {
              returnBook(detail.loan.id).catch((cause: unknown) => {
                Alert.alert('Could not close that loan', messageFrom(cause));
              });
            },
          },
        ]
      );
    },
    [returnBook]
  );

  const chooseSort = useCallback(() => {
    Alert.alert('Sort your shelf', undefined, [
      ...SHELF_SORTS.map((option) => ({
        text: option.label,
        onPress: () => setSort(option.value),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setFilter('all');
  }, []);

  const appBar = (
    <ShelfAppBar
      subtitle="My Books"
      userName={user?.name ?? 'BookPass member'}
      avatarUrl={user?.avatar}
      hasAlerts={incoming.length > 0}
      onSearch={() => setFocusToken((token) => token + 1)}
      onAlerts={() => router.push('/exchange')}
    />
  );

  if (isLoading && shelf.length === 0) {
    return (
      <Screen>
        {appBar}
        <LoadingState label="Opening your shelf…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        {appBar}
        <ErrorState message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  const listHeader = (
    <View style={styles.header}>
      <ShelfHeader total={shelf.length} view={view} onViewChange={setView} />
      <ShelfToolbar
        query={query}
        onQueryChange={setQuery}
        focusToken={focusToken}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        sorted={sort !== 'recent'}
        onSort={chooseSort}
      />
    </View>
  );

  const narrowed = query.trim().length > 0 || filter !== 'all';

  return (
    <Screen>
      {appBar}

      <FlatList
        // Changing the column count needs a fresh list, not a re-render.
        key={view}
        data={visible}
        keyExtractor={(listing) => listing.copy.id}
        numColumns={view === 'grid' ? 2 : 1}
        columnWrapperStyle={view === 'grid' ? styles.column : undefined}
        contentContainerStyle={[styles.content, visible.length === 0 && styles.contentEmpty]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListFooterComponent={
          user && visible.length > 0 ? (
            <TrustScoreCard rating={user.rating} swapCount={user.swapCount} />
          ) : null
        }
        ListEmptyComponent={
          narrowed ? (
            <EmptyState
              icon="search-outline"
              title="Nothing matches"
              message="No book on your shelf fits that search and filter."
              action={{ label: 'Clear filters', onPress: clearFilters }}
            />
          ) : (
            <EmptyState
              icon="library-outline"
              title="Your shelf is empty"
              message="Catalog a book and it becomes lendable, swappable and searchable by the people near you."
              action={{ label: 'Add your first book', onPress: () => router.push('/add-book') }}
            />
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => void refresh()}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        renderItem={({ item, index }) => {
          const loan = loanFor(item.copy.id);

          if (view === 'grid') {
            return (
              <Appear index={index} style={styles.tile}>
                <ShelfBookTile
                  listing={item}
                  loan={loan}
                  onOpen={() => openCopy(item.copy.id)}
                />
              </Appear>
            );
          }

          return (
            <Appear index={index}>
              <ShelfBookCard
                listing={item}
                loan={loan}
                offers={offersFor(item.copy.id)}
                expanded={expandedId === item.copy.id}
                onToggle={() =>
                  setExpandedId((current) => (current === item.copy.id ? null : item.copy.id))
                }
                onOpen={() => openCopy(item.copy.id)}
                onMenu={() => openMenu(item)}
                onReviewOffers={() => router.push('/exchange')}
                onMarkReturned={() => {
                  if (loan) markReturned(loan);
                }}
              />
            </Appear>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // The tile itself is flex:1, so its animation wrapper must be too or the
  // two-column row collapses.
  tile: {
    flex: 1,
  },
  content: {
    gap: Spacing.x6,
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.x8,
  },
  contentEmpty: {
    flexGrow: 1,
  },
  column: {
    gap: Spacing.gutter,
  },
  header: {
    gap: Spacing.gutter,
  },
});
