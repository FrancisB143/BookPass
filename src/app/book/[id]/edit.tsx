import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { BookForm } from '@/components/books/book-form';
import { Screen } from '@/components/screen';
import { ErrorState, LoadingState } from '@/components/screen-states';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { useAsync } from '@/hooks/use-async';
import { ApiError, getBook } from '@/services/books';
import { draftFrom, type BookDraft, type FieldErrors } from '@/types';

/**
 * Update and Delete.
 *
 * The form is prefilled from the server's copy rather than from the list, so
 * an edit always starts from what is actually stored.
 */
export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookId = Number(id);
  const { edit, remove } = useBooks();

  const load = useCallback(() => getBook(bookId), [bookId]);
  const book = useAsync(load);

  const [draft, setDraft] = useState<BookDraft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  // Fill the form once the book arrives.
  useEffect(() => {
    if (book.status === 'success') {
      setDraft(draftFrom(book.data));
    }
  }, [book.status, book.data]);

  function update(next: BookDraft) {
    setDraft(next);
    if (Object.keys(errors).length > 0) setErrors({});
  }

  async function handleSave() {
    if (!draft) return;

    setBusy(true);
    setErrors({});
    try {
      await edit(bookId, draft);
      router.back();
    } catch (cause) {
      if (cause instanceof ApiError && Object.keys(cause.fields).length > 0) {
        setErrors(cause.fields);
      } else {
        Alert.alert('Could not save', cause instanceof Error ? cause.message : 'Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

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
              // Pop the whole stack rather than going back one: behind this
              // form is the detail screen of a book that no longer exists.
              .then(() => router.dismissAll())
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
        <AppBar title="Edit" showBack />
        <ErrorState message="That book link is not valid." />
      </Screen>
    );
  }

  if (book.status === 'loading' || !draft) {
    return (
      <Screen>
        <AppBar title="Edit" showBack />
        <LoadingState />
      </Screen>
    );
  }

  if (book.status === 'error') {
    return (
      <Screen>
        <AppBar title="Edit" showBack />
        <ErrorState message={book.error} onRetry={book.reload} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppBar title="Edit book" subtitle={book.data.title} showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BookForm
            value={draft}
            onChange={update}
            errors={errors}
            busy={busy}
            submitLabel="Save changes"
            onSubmit={handleSave}
            footer={
              <Card tone="flat" style={styles.danger}>
                <View style={styles.dangerCopy}>
                  <Text variant="labelLg" color="error">
                    Delete this book
                  </Text>
                  <Text variant="caption" color="onSurfaceMuted">
                    Removes it from the library permanently. You will be asked to confirm.
                  </Text>
                </View>
                <Button label="Delete" variant="danger" onPress={confirmDelete} block />
              </Card>
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    padding: Spacing.gutter,
    paddingBottom: Spacing.x8,
  },
  danger: {
    gap: Spacing.xl,
  },
  dangerCopy: {
    gap: Spacing.xs,
  },
});
