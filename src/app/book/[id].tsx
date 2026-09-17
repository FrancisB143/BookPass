import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ErrorState, LoadingState } from '@/components/screen-states';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useAsync } from '@/hooks/use-async';
import { useTheme } from '@/hooks/use-theme';
import { getBookById } from '@/services/books';
import { LOAN_PERIOD_DAYS } from '@/services/loans';

export default function BookDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeLoanForBook, borrow, returnBook } = useLibrary();

  const loadBook = useCallback(() => getBookById(id), [id]);
  const book = useAsync(loadBook);

  const [busy, setBusy] = useState(false);
  const loan = activeLoanForBook(id);

  async function handleBorrow() {
    setBusy(true);
    try {
      await borrow(id);
    } catch (cause) {
      Alert.alert('Could not borrow', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReturn() {
    if (!loan) return;
    setBusy(true);
    try {
      await returnBook(loan.id);
    } catch (cause) {
      Alert.alert('Could not return', cause instanceof Error ? cause.message : 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (book.status === 'loading') {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: true, title: 'Book' }} />
        <LoadingState />
      </Screen>
    );
  }

  if (book.status === 'error') {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: true, title: 'Book' }} />
        <ErrorState message={book.error} onRetry={book.reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: book.data.title }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.cover, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.coverGlyph}>{book.data.cover}</ThemedText>
          </View>

          <View style={styles.headings}>
            <ThemedText type="smallBold" style={styles.title}>
              {book.data.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {book.data.author}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {book.data.genre} · {book.data.year}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {book.data.totalCopies} copies in the library
            </ThemedText>
          </View>
        </View>

        <ThemedText type="default">{book.data.blurb}</ThemedText>

        {loan ? (
          <>
            <ThemedText type="small" themeColor="accent">
              You have this book out — due {new Date(loan.dueAt).toLocaleDateString()}.
            </ThemedText>
            <Button label="Return this book" variant="secondary" onPress={handleReturn} busy={busy} />
          </>
        ) : (
          <>
            <ThemedText type="small" themeColor="textSecondary">
              Borrowing gives you {LOAN_PERIOD_DAYS} days before the book is due back.
            </ThemedText>
            <Button label="Borrow" onPress={handleBorrow} busy={busy} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  cover: {
    width: 96,
    height: 128,
    borderRadius: Radius.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGlyph: {
    fontSize: 48,
    lineHeight: 58,
  },
  headings: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
});
