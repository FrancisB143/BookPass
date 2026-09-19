import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { BorrowedAppBar } from '@/components/borrowed/borrowed-app-bar';
import {
  BORROW_FILTERS,
  matchesFilter,
  toneFor,
  type BorrowFilter,
  type LendingSide,
} from '@/components/borrowed/borrowed-status';
import { LendingSwitcher } from '@/components/borrowed/lending-switcher';
import { LoanCard } from '@/components/borrowed/loan-card';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Chip } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import type { LoanDetail } from '@/services/loans';

/** "2 overdue · 1 due soon" — or the reassuring version when nothing is urgent. */
function summarise(details: LoanDetail[]): string {
  const overdue = details.filter((detail) => toneFor(detail.loan) === 'overdue').length;
  const dueSoon = details.filter((detail) => toneFor(detail.loan) === 'due-soon').length;

  if (overdue === 0 && dueSoon === 0) {
    return details.length === 0 ? 'Nothing out at the moment' : 'Everything is on track';
  }

  const parts: string[] = [];
  if (overdue > 0) parts.push(`${overdue} overdue`);
  if (dueSoon > 0) parts.push(`${dueSoon} due soon`);
  return parts.join(' · ');
}

export default function BorrowedScreen() {
  const { borrowed, lent, isLoading, error, refresh, returnBook } = useLibrary();
  const { user } = useSession();

  const [side, setSide] = useState<LendingSide>('borrowed');
  const [filter, setFilter] = useState<BorrowFilter>('all');
  const [returningId, setReturningId] = useState<string | null>(null);

  const active = side === 'borrowed' ? borrowed : lent;

  const visible = useMemo(
    () => active.filter((detail) => matchesFilter(detail.loan, filter)),
    [active, filter]
  );

  // Counts come off the unfiltered list, so a chip never reports zero for the
  // bucket the user is already looking at.
  const counts = useMemo(
    () =>
      BORROW_FILTERS.reduce<Record<BorrowFilter, number>>(
        (all, option) => ({
          ...all,
          [option.value]: active.filter((detail) => matchesFilter(detail.loan, option.value)).length,
        }),
        { all: 0, 'due-soon': 0, overdue: 0 }
      ),
    [active]
  );

  async function handleReturn(detail: LoanDetail) {
    setReturningId(detail.loan.id);
    try {
      await returnBook(detail.loan.id);
    } catch (cause) {
      Alert.alert(
        'Could not return',
        cause instanceof Error ? cause.message : 'Please try again.'
      );
    } finally {
      setReturningId(null);
    }
  }

  const appBar = (
    <BorrowedAppBar
      userName={user?.name ?? 'Reader'}
      hasAlerts={borrowed.some((detail) => toneFor(detail.loan) !== 'healthy')}
      onSearch={() => router.push('/exchange')}
      onAlerts={() => setFilter('overdue')}
    />
  );

  if (isLoading) {
    return (
      <Screen>
        {appBar}
        <LoadingState label="Loading your loans…" />
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

  return (
    <Screen>
      {appBar}

      <FlatList
        data={visible}
        keyExtractor={(detail) => detail.loan.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refresh} tintColor={Colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="display" color="onSurface">
              {side === 'borrowed' ? 'Borrowed books' : 'Lent to others'}
            </Text>
            <Text variant="body" color="onSurfaceMuted">
              {summarise(active)}
            </Text>

            <LendingSwitcher
              value={side}
              onChange={setSide}
              counts={{ borrowed: borrowed.length, lent: lent.length }}
            />

            <View style={styles.chips}>
              {BORROW_FILTERS.map((option) => (
                <Chip
                  key={option.value}
                  label={`${option.label} (${counts[option.value]})`}
                  selected={filter === option.value}
                  onPress={() => setFilter(option.value)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          filter === 'all' ? (
            <EmptyState
              icon={side === 'borrowed' ? 'download-outline' : 'share-outline'}
              title={side === 'borrowed' ? 'Nothing borrowed' : 'Nothing lent out'}
              message={
                side === 'borrowed'
                  ? 'Books you borrow from other members show up here with their due dates.'
                  : 'When someone borrows one of your books, you can track it here.'
              }
              action={
                side === 'borrowed'
                  ? { label: 'Browse the exchange', onPress: () => router.push('/exchange') }
                  : undefined
              }
            />
          ) : (
            <EmptyState
              icon="checkmark-circle-outline"
              title="Nothing in this bucket"
              message="No loans match that filter right now."
              action={{ label: 'Show all', onPress: () => setFilter('all') }}
            />
          )
        }
        renderItem={({ item }) => (
          <LoanCard
            detail={item}
            side={side}
            busy={returningId === item.loan.id}
            onReturn={() => handleReturn(item)}
          />
        )}
      />
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
    gap: Spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
});
