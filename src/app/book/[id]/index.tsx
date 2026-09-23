import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { BookCover } from '@/components/book-cover';
import { StatusPill } from '@/components/books/status-pill';
import { Screen } from '@/components/screen';
import { ErrorState, LoadingState } from '@/components/screen-states';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { useAsync } from '@/hooks/use-async';
import { getBook } from '@/services/books';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="caption" color="onSurfaceMuted">
        {label}
      </Text>
      <Text variant="labelLg" color="onSurface" style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

/**
 * One book — the detail half of Read.
 *
 * Fetched by id rather than read out of the list, so opening a link directly
 * works and the screen always shows what the server currently holds.
 */
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const { remove } = useBooks();

  const load = useCallback(() => getBook(bookId), [bookId]);
  const book = useAsync(load);

  function confirmDelete() {
    if (book.status !== 'success') return;
    const target = book.data;

    Alert.alert(
      'Delete this book?',
      `“${target.title}” will be removed from the library. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            remove(target.id)
              .then(() => router.back())
              .catch((cause: unknown) => {
                Alert.alert(
                  'Could not delete',
                  cause instanceof Error ? cause.message : 'Please try again.'
                );
              });
          },
        },
      ]
    );
  }

  if (Number.isNaN(bookId)) {
    return (
      <Screen>
        <AppBar title="Book" showBack />
        <ErrorState message="That book link is not valid." />
      </Screen>
    );
  }

  if (book.status === 'loading') {
    return (
      <Screen>
        <AppBar title="Book" showBack />
        <LoadingState />
      </Screen>
    );
  }

  if (book.status === 'error') {
    return (
      <Screen>
        <AppBar title="Book" showBack />
        <ErrorState message={book.error} onRetry={book.reload} />
      </Screen>
    );
  }

  const { data } = book;

  return (
    <Screen>
      <AppBar title="Book details" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.hero}>
          <BookCover
            title={data.title}
            author={data.author}
            isbn={data.isbn}
            coverUrl={data.coverUrl}
            width={132}
            height={184}
            radius={Radius.md}
          />

          <View style={styles.headings}>
            <Text variant="titleLg" color="onSurface" style={styles.centred}>
              {data.title}
            </Text>
            <Text variant="body" color="onSurfaceMuted" style={styles.centred}>
              {data.author}
            </Text>
          </View>

          <StatusPill status={data.status} />
        </Card>

        <Card style={styles.facts}>
          <Row label="Genre" value={data.genre ?? 'Not set'} />
          <Row label="Published" value={data.publishedYear ? String(data.publishedYear) : 'Not set'} />
          <Row label="ISBN" value={data.isbn ?? 'Not set'} />
          <Row label="Added" value={data.createdAt.slice(0, 10)} />
        </Card>

        {data.description ? (
          <Card style={styles.about}>
            <Text variant="title" color="onSurface">
              About this book
            </Text>
            <Text variant="body" color="onSurfaceVariant">
              {data.description}
            </Text>
          </Card>
        ) : null}

        <Button
          label="Edit this book"
          icon="create-outline"
          size="lg"
          onPress={() => router.push(`/book/${data.id}/edit`)}
          block
        />

        <Card tone="flat" style={styles.danger}>
          <View style={styles.dangerCopy}>
            <Ionicons name="warning-outline" size={20} color={Colors.error} />
            <Text variant="labelLg" color="error">
              Delete from library
            </Text>
          </View>
          <Text variant="caption" color="onSurfaceMuted">
            Removes this book permanently. You will be asked to confirm.
          </Text>
          <Button label="Delete" variant="danger" onPress={confirmDelete} block />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.gutter,
    padding: Spacing.gutter,
    paddingBottom: Spacing.x8,
  },
  hero: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  headings: {
    gap: Spacing.xs,
  },
  centred: {
    textAlign: 'center',
  },
  facts: {
    gap: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  about: {
    gap: Spacing.md,
  },
  danger: {
    gap: Spacing.xl,
  },
  dangerCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
