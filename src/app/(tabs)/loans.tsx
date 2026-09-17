import { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet } from 'react-native';

import { LoanCard } from '@/components/loan-card';
import { Screen } from '@/components/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/screen-states';
import { Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getBooks } from '@/services/books';
import { isActive } from '@/services/loans';

export default function LoansScreen() {
  const theme = useTheme();
  const { loans, isLoading, error, refresh, returnBook } = useLibrary();

  const loadBooks = useCallback(() => getBooks(), []);
  const books = useAsync(loadBooks);

  const [returningId, setReturningId] = useState<string | null>(null);

  async function handleReturn(loanId: string) {
    setReturningId(loanId);
    try {
      await returnBook(loanId);
    } catch (cause) {
      Alert.alert('Could not return', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setReturningId(null);
    }
  }

  // Both the loan list and the catalogue are needed before a row can be drawn.
  if (isLoading || books.status === 'loading') {
    return (
      <Screen>
        <LoadingState label="Loading your loans…" />
      </Screen>
    );
  }

  const failure = error ?? (books.status === 'error' ? books.error : null);
  if (failure) {
    return (
      <Screen>
        <ErrorState
          message={failure}
          onRetry={() => {
            void refresh();
            books.reload();
          }}
        />
      </Screen>
    );
  }

  const catalogue = new Map((books.data ?? []).map((book) => [book.id, book]));
  const active = loans.filter(isActive);

  return (
    <Screen>
      {active.length === 0 ? (
        <EmptyState
          glyph="🔖"
          title="Nothing borrowed"
          message="Books you borrow will appear here with their due dates."
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={active}
          keyExtractor={(loan) => loan.id}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refresh} tintColor={theme.accent} />
          }
          renderItem={({ item }) => (
            <LoanCard
              loan={item}
              book={catalogue.get(item.bookId)}
              returning={returningId === item.id}
              onReturn={() => handleReturn(item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
