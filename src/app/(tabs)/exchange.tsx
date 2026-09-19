import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { ActiveProposalCard } from '@/components/exchange/active-proposal-card';
import { DropPointCard } from '@/components/exchange/drop-point-card';
import { ExchangeAppBar } from '@/components/exchange/exchange-app-bar';
import { ExchangeSearch } from '@/components/exchange/exchange-search';
import { EXCHANGE_FILTERS } from '@/components/exchange/exchange-status';
import { ListingCard } from '@/components/exchange/listing-card';
import { LocationFilter } from '@/components/exchange/location-filter';
import { RequestCard } from '@/components/exchange/request-card';
import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Field, Segmented } from '@/components/ui/field';
import { Chip, Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import { useAsync } from '@/hooks/use-async';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { searchListings, type ExchangeFilter } from '@/services/catalog';
import type { Listing } from '@/types';

type Tab = 'browse' | 'requests';

/** The area the marketplace is scoped to. Presentational — there is no geo service. */
const AREA = 'North Campus & Downtown (within 3 mi)';

export default function ExchangeScreen() {
  const { requests, shelf, isLoading, error, refresh, requestBook, respondToRequest, withdrawRequest } =
    useLibrary();
  const { user } = useSession();

  const [tab, setTab] = useState<Tab>('browse');
  const [filter, setFilter] = useState<ExchangeFilter>('all');
  const [query, setQuery] = useState('');
  const [focusToken, setFocusToken] = useState(0);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  /** The listing the user is choosing a book to offer against. */
  const [offering, setOffering] = useState<Listing | null>(null);

  const debouncedQuery = useDebouncedValue(query);

  const loadListings = useCallback(
    () => searchListings(debouncedQuery, filter),
    [debouncedQuery, filter]
  );
  const listings = useAsync(loadListings);

  /** The current user's own outgoing swap, still waiting on an answer. */
  const proposal = useMemo(
    () => requests.find((detail) => detail.outgoing && detail.request.kind === 'exchange'),
    [requests]
  );

  /** Copies the user could put up in a trade — not the ones already lent out. */
  const offerable = useMemo(
    () => shelf.filter((listing) => listing.copy.status !== 'lent-out'),
    [shelf]
  );

  const requestedCopyIds = useMemo(
    () => new Set(requests.filter((detail) => detail.outgoing).map((detail) => detail.listing.copy.id)),
    [requests]
  );

  function toggleFavourite(copyId: string) {
    setFavourites((previous) =>
      previous.includes(copyId)
        ? previous.filter((candidate) => candidate !== copyId)
        : [...previous, copyId]
    );
  }

  function startRequest(listing: Listing) {
    if (offerable.length === 0) {
      Alert.alert(
        'Nothing to offer',
        'An exchange needs a book from your own shelf. Add one, or free up a copy that is lent out.'
      );
      return;
    }
    setOffering(listing);
  }

  async function confirmExchange(offeredCopyId: string) {
    if (!offering) return;
    const target = offering;

    setOffering(null);
    setBusyId(target.copy.id);
    try {
      await requestBook(target.copy.id, 'exchange', offeredCopyId);
      Alert.alert('Request sent', `${target.owner.name} will see your offer.`);
    } catch (cause) {
      Alert.alert('Could not send', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function answer(requestId: string, accept: boolean) {
    setBusyId(requestId);
    try {
      await respondToRequest(requestId, accept);
    } catch (cause) {
      Alert.alert('Could not update', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function withdraw(requestId: string) {
    setBusyId(requestId);
    try {
      await withdrawRequest(requestId);
    } catch (cause) {
      Alert.alert('Could not withdraw', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusyId(null);
    }
  }

  const appBar = (
    <ExchangeAppBar
      userName={user?.name ?? 'Reader'}
      pending={requests.length > 0}
      onSearch={() => {
        setTab('browse');
        setFocusToken((token) => token + 1);
      }}
      onAlerts={() => setTab('requests')}
    />
  );

  const controls = (
    <View style={styles.controls}>
      <LocationFilter
        label={AREA}
        onPress={() => Alert.alert('Pickup area', 'Choosing an area needs a location service.')}
        onMap={() => Alert.alert('Map view', 'The map view is not built yet.')}
      />

      <ExchangeSearch
        value={query}
        onChangeText={setQuery}
        focusToken={focusToken}
        filtered={filter !== 'all' || query.trim().length > 0}
        onFilter={() => setFilter('all')}
      />

      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'browse', label: 'Browse Books' },
          { value: 'requests', label: 'Exchange Requests', badge: requests.length || undefined },
        ]}
      />
    </View>
  );

  if (isLoading) {
    return (
      <Screen>
        {appBar}
        <LoadingState label="Loading the exchange…" />
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

  if (tab === 'requests') {
    return (
      <Screen>
        {appBar}
        <FlatList
          data={requests}
          keyExtractor={(detail) => detail.request.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={controls}
          ListEmptyComponent={
            <EmptyState
              icon="swap-horizontal-outline"
              title="No open requests"
              message="Borrow and swap requests appear here while they wait for an answer."
              action={{ label: 'Browse books', onPress: () => setTab('browse') }}
            />
          }
          renderItem={({ item }) => (
            <RequestCard
              detail={item}
              busy={busyId === item.request.id}
              onAccept={() => answer(item.request.id, true)}
              onDecline={() => answer(item.request.id, false)}
              onWithdraw={() => withdraw(item.request.id)}
            />
          )}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      {appBar}

      <FlatList
        data={listings.status === 'success' ? listings.data : []}
        keyExtractor={(listing) => listing.copy.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            {controls}

            {proposal ? (
              <ActiveProposalCard detail={proposal} onPress={() => setTab('requests')} />
            ) : null}

            <View style={styles.chips}>
              {EXCHANGE_FILTERS.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={filter === option.value}
                  onPress={() => setFilter(option.value)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          listings.status === 'loading' ? (
            <LoadingState label="Finding books nearby…" />
          ) : listings.status === 'error' ? (
            <ErrorState message={listings.error} onRetry={listings.reload} />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Nothing matches"
              message="No listings in this area match what you are looking for."
              action={{
                label: 'Clear filters',
                onPress: () => {
                  setQuery('');
                  setFilter('all');
                },
              }}
            />
          )
        }
        ListFooterComponent={
          listings.status === 'success' && listings.data.length > 0 ? (
            <DropPointCard
              place="East Arbor Green Grocers"
              checkedInToday={14}
              onViewInventory={() =>
                Alert.alert('Drop point', 'Drop box inventory is not built yet.')
              }
            />
          ) : null
        }
        renderItem={({ item }) => (
          <ListingCard
            listing={item}
            favourite={favourites.includes(item.copy.id)}
            onToggleFavourite={() => toggleFavourite(item.copy.id)}
            requested={requestedCopyIds.has(item.copy.id)}
            busy={busyId === item.copy.id}
            onRequest={() => startRequest(item)}
            onChat={() => Alert.alert('Chat', 'Messaging is not built yet.')}
          />
        )}
      />

      {/* An exchange needs a book in return, so the offer is chosen before the
          request is sent rather than after the service rejects it. */}
      <Modal
        visible={offering !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setOffering(null)}>
        <Pressable style={styles.scrim} onPress={() => setOffering(null)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.grabber} />

            <Text variant="titleLg" color="onSurface">
              Offer a book in return
            </Text>
            <Text variant="body" color="onSurfaceMuted">
              {offering
                ? `${offering.owner.name} is seeking ${offering.copy.seeking.join(', ') || 'anything'}.`
                : ''}
            </Text>

            <FlatList
              data={offerable}
              keyExtractor={(listing) => listing.copy.id}
              contentContainerStyle={styles.offers}
              renderItem={({ item }) => (
                <Pressable onPress={() => confirmExchange(item.copy.id)}>
                  <Card tone="flat" style={styles.offer}>
                    <BookCover
                      title={item.book.title}
                      author={item.book.author}
                      isbn={item.book.isbn}
                      width={44}
                      height={60}
                    />
                    <View style={styles.offerText}>
                      <Text variant="labelLg" color="onSurface" numberOfLines={2}>
                        {item.book.title}
                      </Text>
                      <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
                        {item.book.author}
                      </Text>
                    </View>
                    <Pill label={item.book.genre} tone="neutral" />
                  </Card>
                </Pressable>
              )}
            />

            <Button label="Cancel" variant="secondary" onPress={() => setOffering(null)} block />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    gap: Spacing.gutter,
    padding: Spacing.gutter,
    paddingTop: Spacing.md,
  },
  header: {
    gap: Spacing.gutter,
  },
  controls: {
    gap: Spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.scrim,
  },
  sheet: {
    maxHeight: '80%',
    gap: Spacing.xl,
    padding: Spacing.x5,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    backgroundColor: Colors.background,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.outline,
  },
  offers: {
    gap: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  offerText: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
