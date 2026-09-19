import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryRail } from '@/components/home/category-rail';
import { EventCard } from '@/components/home/event-card';
import { HomeAppBar } from '@/components/home/home-app-bar';
import { NearbyCard } from '@/components/home/nearby-card';
import { QuickActions } from '@/components/home/quick-actions';
import { SearchBar } from '@/components/home/search-bar';
import { SectionHeader } from '@/components/home/section-header';
import { ShelfRow } from '@/components/home/shelf-row';
import { StatRail, type StatCard } from '@/components/home/stat-rail';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import { useAsync } from '@/hooks/use-async';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { getGenres, getNearbyListings } from '@/services/catalog';
import { isDueSoon } from '@/services/loans';
import type { Book } from '@/types';

/** The dashboard previews the shelf — "See shelf" opens the whole thing. */
const SHELF_PREVIEW = 3;

function matches(book: Book, genre: string | null, needle: string): boolean {
  if (genre && book.genre !== genre) return false;
  if (!needle) return true;
  return book.title.toLowerCase().includes(needle) || book.author.toLowerCase().includes(needle);
}

/**
 * The dashboard: what you own, what is out, and what is going spare nearby.
 *
 * Every number here is derived from `useLibrary()` rather than written down, so
 * lending a book moves the stat cards and the shelf rows together.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useSession();
  const { shelf, borrowed, lent, requests, stats, isLoading, error, refresh, requestBook } =
    useLibrary();

  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [pendingCopyId, setPendingCopyId] = useState<string | null>(null);

  const search = useDebouncedValue(query);
  const genres = useAsync(getGenres);
  const nearby = useAsync(getNearbyListings);

  const needle = search.trim().toLowerCase();
  const filtering = genre !== null || needle.length > 0;

  const visibleShelf = useMemo(
    () => shelf.filter((listing) => matches(listing.book, genre, needle)).slice(0, SHELF_PREVIEW),
    [shelf, genre, needle]
  );

  const visibleNearby = useMemo(
    () => (nearby.data ?? []).filter((listing) => matches(listing.book, genre, needle)),
    [nearby.data, genre, needle]
  );

  /** Lent copies keyed by copy, so a row can name its borrower and due date. */
  const loansByCopy = useMemo(
    () => new Map(lent.map((detail) => [detail.copy.id, detail])),
    [lent]
  );

  /** Offers other members have made on the current user's copies. */
  const offersByCopy = useMemo(() => {
    const counts = new Map<string, number>();
    for (const detail of requests) {
      if (detail.outgoing) continue;
      const copyId = detail.listing.copy.id;
      counts.set(copyId, (counts.get(copyId) ?? 0) + 1);
    }
    return counts;
  }, [requests]);

  const dueSoon = borrowed.filter((detail) => isDueSoon(detail.loan)).length;
  const borrowBadge =
    stats.overdue > 0
      ? { label: `${stats.overdue} overdue`, tone: 'error' as const }
      : dueSoon > 0
        ? { label: `${dueSoon} due soon`, tone: 'error' as const }
        : undefined;

  const cards: StatCard[] = [
    {
      key: 'owned',
      icon: 'library-outline',
      tone: 'accent',
      value: stats.owned,
      label: 'Books Owned',
      badge: { label: 'My Shelf', tone: 'accent' },
    },
    {
      key: 'borrowed',
      icon: 'book-outline',
      tone: 'accent',
      value: stats.borrowed,
      label: 'Active Borrows',
      badge: borrowBadge,
    },
    {
      key: 'pending',
      icon: 'swap-horizontal',
      tone: 'success',
      value: stats.pending,
      label: 'Pending swaps',
    },
  ];

  const columnWidth = (width - Spacing.gutter * 2 - Spacing.xl) / 2;
  const firstName = user?.name.split(' ')[0] ?? 'Reader';

  const hubs = [...new Set(visibleNearby.map((listing) => listing.copy.hub))].slice(0, 2);
  const nearbySubtitle = hubs.length
    ? `Readers in ${hubs.join(' & ')}`
    : 'Readers around your campus';

  function clearFilters() {
    setQuery('');
    setGenre(null);
  }

  async function handleRequest(copyId: string) {
    setPendingCopyId(copyId);
    try {
      await requestBook(copyId, 'borrow');
      Alert.alert('Request sent', 'The owner will find it in their exchange requests.');
    } catch (cause) {
      Alert.alert(
        'Could not send that request',
        cause instanceof Error ? cause.message : 'Something went wrong.'
      );
    } finally {
      setPendingCopyId(null);
    }
  }

  function renderShelf() {
    if (visibleShelf.length > 0) {
      return visibleShelf.map((listing) => (
        <ShelfRow
          key={listing.copy.id}
          listing={listing}
          loan={loansByCopy.get(listing.copy.id)}
          offers={offersByCopy.get(listing.copy.id) ?? 0}
          onEdit={() => router.push({ pathname: '/book/[id]', params: { id: listing.copy.id } })}
        />
      ));
    }

    return (
      <EmptyState
        icon="book-outline"
        title={filtering ? 'Nothing matches that' : 'Your shelf is empty'}
        message={
          filtering
            ? 'No book on your shelf matches this filter.'
            : 'Add a book and it lands here, ready to lend or swap.'
        }
        action={
          filtering
            ? { label: 'Clear filters', onPress: clearFilters }
            : { label: 'Add a book', onPress: () => router.push('/add-book') }
        }
      />
    );
  }

  function renderNearby() {
    if (nearby.status === 'loading') {
      return <LoadingState label="Finding books near you…" />;
    }

    if (nearby.status === 'error') {
      return <ErrorState message={nearby.error} onRetry={nearby.reload} />;
    }

    if (visibleNearby.length === 0) {
      return (
        <EmptyState
          icon="location-outline"
          title={filtering ? 'Nothing matches that' : 'No books nearby yet'}
          message={
            filtering
              ? 'No nearby book matches this filter.'
              : 'When members near you list a book, it shows up here.'
          }
          action={filtering ? { label: 'Clear filters', onPress: clearFilters } : undefined}
        />
      );
    }

    return (
      <View style={styles.grid}>
        {visibleNearby.map((listing) => (
          <NearbyCard
            key={listing.copy.id}
            listing={listing}
            width={columnWidth}
            busy={pendingCopyId === listing.copy.id}
            onRequest={() => void handleRequest(listing.copy.id)}
          />
        ))}
      </View>
    );
  }

  // Only the first load blanks the screen; a refresh after a mutation keeps the
  // content in place.
  if (isLoading && shelf.length === 0 && !error) {
    return (
      <Screen>
        <LoadingState label="Opening your shelf…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => void refresh()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.gutter}>
          <HomeAppBar
            name={user?.name ?? 'Reader'}
            avatarUri={user?.avatar}
            unread={requests.length > 0}
          />
        </View>

        <View style={[styles.gutter, styles.intro]}>
          <View style={styles.greeting}>
            <Text variant="labelLg" color="onSurface">
              {`Hello, ${firstName} 👋`}
            </Text>
            <Pill label="Campus Library #4" tone="success" dot />
          </View>

          <Text variant="display" color="onSurface">
            What are we reading today?
          </Text>
        </View>

        <StatRail cards={cards} />

        <View style={styles.gutter}>
          <QuickActions
            onScan={() => router.push('/add-book')}
            onSwap={() => router.push('/exchange')}
          />
        </View>

        <View style={styles.gutter}>
          <SearchBar value={query} onChangeText={setQuery} />
        </View>

        <CategoryRail genres={genres.data ?? []} selected={genre} onSelect={setGenre} />

        <View style={[styles.gutter, styles.section]}>
          <SectionHeader
            title="Recently Added"
            subtitle="Your personal catalog inventory"
            actionLabel="See shelf"
            onAction={() => router.push('/my-books')}
          />
          {renderShelf()}
        </View>

        <View style={[styles.gutter, styles.section]}>
          <SectionHeader
            title="Available Near You"
            subtitle={nearbySubtitle}
            actionLabel="Explore"
            onAction={() => router.push('/exchange')}
          />
          {renderNearby()}
        </View>

        <View style={styles.gutter}>
          <EventCard
            title="Weekend Book Exchange Meetup"
            detail="Saturday 11:00 AM • Courtyard Gazebo"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.x5,
    paddingBottom: Spacing.x8,
  },
  gutter: {
    paddingHorizontal: Spacing.gutter,
  },
  intro: {
    gap: Spacing.md,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
});
