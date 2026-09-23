import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { AppBar } from '@/components/app-bar';
import { BookForm } from '@/components/books/book-form';
import { Screen } from '@/components/screen';
import { Spacing } from '@/constants/theme';
import { useBooks } from '@/context/books-context';
import { ApiError } from '@/services/books';
import { EMPTY_DRAFT, type BookDraft, type FieldErrors } from '@/types';

/**
 * Create — the app's POST screen.
 *
 * Discover hands books here as route params, so a title found on Open Library
 * arrives prefilled rather than being retyped.
 */
export default function AddBookScreen() {
  const { add } = useBooks();
  const prefill = useLocalSearchParams<{
    title?: string;
    author?: string;
    genre?: string;
    isbn?: string;
    publishedYear?: string;
  }>();

  const [draft, setDraft] = useState<BookDraft>({
    ...EMPTY_DRAFT,
    title: prefill.title ?? '',
    author: prefill.author ?? '',
    genre: prefill.genre ?? '',
    isbn: prefill.isbn ?? '',
    publishedYear: prefill.publishedYear ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  function update(next: BookDraft) {
    setDraft(next);
    // Clearing on edit means a message never outlives the problem it describes.
    if (Object.keys(errors).length > 0) setErrors({});
  }

  async function handleSubmit() {
    setBusy(true);
    setErrors({});
    try {
      const created = await add(draft);
      // Replace, so Back from the new book's page returns to the library
      // rather than to a form that has already been submitted.
      router.replace(`/book/${created.id}`);
    } catch (cause) {
      if (cause instanceof ApiError && Object.keys(cause.fields).length > 0) {
        setErrors(cause.fields);
      } else {
        Alert.alert(
          'Could not save',
          cause instanceof Error ? cause.message : 'Please try again.'
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AppBar title="Add a book" subtitle="New library entry" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <BookForm
            value={draft}
            onChange={update}
            errors={errors}
            busy={busy}
            submitLabel="Add to library"
            onSubmit={handleSubmit}
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
});
