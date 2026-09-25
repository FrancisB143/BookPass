import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { BookCover } from '@/components/book-cover';
import { OpenLibraryPanel } from '@/components/books/open-library-panel';
import { StatusPill } from '@/components/books/status-pill';
import { Screen } from '@/components/screen';
import { ErrorState, LoadingState } from '@/components/screen-states';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { useAsync } from '@/hooks/use-async';
import { getBook } from '@/services/books';
import { lookupByIsbn, type OpenLibraryDetails } from '@/services/open-library';

/** One cell of the two-column fact grid. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Overline color="onSurfaceMuted">{label}</Overline>
      <Text variant="labelLg" color="onSurface" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

type PanelState = 'loading' | 'ready' | 'error' | 'none';

/**
 * One book — the detail half of Read.
 *
 * Two sources sit on this screen and are kept visually apart: the library's
 * own record above, and whatever Open Library knows about the same ISBN in its
 * own labelled card below. The external lookup runs after the book resolves
 * and never blocks it, so a slow or unreachable third party cannot stop you
 * reading your own catalogue.
 */
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const { remove } = useBooks();

  const load = useCallback(() => getBook(bookId), [bookId]);
  const book = useAsync(load);

  const [details, setDetails] = useState<OpenLibraryDetails | null>(null);
  const [panel, setPanel] = useState<PanelState>('none');
  const [panelMessage, setPanelMessage] = useState<string>();

  const isbn = book.status === 'success' ? book.data.isbn : null;

  useEffect(() => {
    if (book.status !== 'success') return;

    if (!isbn) {
      setPanel('none');
      setPanelMessage('Add an ISBN to this book to pull its details from Open Library.');
      return;
    }

    let cancelled = false;
    setPanel('loading');

    lookupByIsbn(isbn)
      .then((found) => {
        if (cancelled) return;
        setDetails(found);
        setPanel(found ? 'ready' : 'none');
        setPanelMessage(found ? undefined : 'Open Library has no record for this ISBN.');
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setPanel('error');
        setPanelMessage(cause instanceof Error ? cause.message : undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [book.status, isbn]);

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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cover left, identity right — the title gets the width it needs
            instead of wrapping under a centred cover. */}
        <Card style={styles.hero}>
          <BookCover
            title={data.title}
            author={data.author}
            isbn={data.isbn}
            coverUrl={data.coverUrl}
            width={118}
            height={166}
            radius={Radius.sm}
          />

          <View style={styles.identity}>
            {data.genre ? <Pill label={data.genre} tone="neutral" /> : null}

            <Text variant="titleLg" color="onSurface">
              {data.title}
            </Text>
            <Text variant="body" color="onSurfaceMuted">
              {data.author}
            </Text>

            <View style={styles.statusRow}>
              <StatusPill status={data.status} />
            </View>
          </View>
        </Card>

        {/* The one primary action on this screen. */}
        <Button
          label="Edit this book"
          icon="create-outline"
          size="lg"
          onPress={() => router.push(`/book/${data.id}/edit`)}
          block
        />

        <Card style={styles.facts}>
          <Overline color="onSurfaceMuted">Library record</Overline>
          <View style={styles.factGrid}>
            <Fact label="Published" value={data.publishedYear ? String(data.publishedYear) : '—'} />
            <Fact label="Genre" value={data.genre ?? '—'} />
            <Fact label="ISBN" value={data.isbn ?? '—'} />
            <Fact label="Added" value={data.createdAt.slice(0, 10)} />
          </View>
        </Card>

        {data.description ? (
          <Card style={styles.about}>
            <Overline color="onSurfaceMuted">About this book</Overline>
            <Text variant="body" color="onSurfaceVariant">
              {data.description}
            </Text>
          </Card>
        ) : null}

        <OpenLibraryPanel state={panel} details={details} message={panelMessage} />

        {/* Destructive action, kept well below the primary one and visually
            separated so it cannot be hit by accident. */}
        <View style={styles.danger}>
          <View style={styles.dangerCopy}>
            <Ionicons name="trash-outline" size={16} color={Colors.onSurfaceMuted} />
            <Text variant="caption" color="onSurfaceMuted">
              Remove this book from the library
            </Text>
          </View>
          <Button label="Delete" variant="secondary" size="sm" onPress={confirmDelete} />
        </View>
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
    flexDirection: 'row',
    gap: Spacing.gutter,
  },
  identity: {
    flex: 1,
    gap: Spacing.md,
  },
  statusRow: {
    marginTop: Spacing.xxs,
  },
  facts: {
    gap: Spacing.gutter,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.x5,
  },
  // Two per row, so labels line up in a column down the card.
  fact: {
    width: '50%',
    gap: Spacing.xxs,
    paddingRight: Spacing.md,
  },
  about: {
    gap: Spacing.md,
  },
  danger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.gutter,
    marginTop: Spacing.md,
    paddingTop: Spacing.gutter,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outline,
  },
  dangerCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
