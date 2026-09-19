import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddBookBar } from '@/components/add-book/add-book-bar';
import { ChipCloud, FormSection, NoteBox } from '@/components/add-book/form-blocks';
import { LendingOptions, type LendingOption } from '@/components/add-book/lending-options';
import { MetadataCard } from '@/components/add-book/metadata-card';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Field, Segmented } from '@/components/ui/field';
import { Chip, Pill } from '@/components/ui/pill';
import { Card, IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import { addBookToShelf, getGenres } from '@/services/catalog';
import type { CopyCondition, CopyStatus } from '@/types';

/**
 * A copy cannot arrive already lent out, so `lent-out` is not offered — it is
 * reached by accepting a borrow request, never by typing.
 */
type InitialStatus = Extract<CopyStatus, 'on-shelf' | 'available-for-swap'>;

type FormErrors = {
  title?: string;
  author?: string;
  genre?: string;
  year?: string;
};

const CONDITIONS: { value: CopyCondition; label: string; icon: 'book' | 'document-text-outline' }[] =
  [
    { value: 'paperback', label: 'Paperback', icon: 'document-text-outline' },
    { value: 'hardcover', label: 'Hardcover', icon: 'book' },
  ];

const LENDING: LendingOption<InitialStatus>[] = [
  {
    value: 'on-shelf',
    label: 'Available on Shelf',
    description: 'Neighbors can borrow it immediately',
    icon: 'library-outline',
    tone: 'success',
  },
  {
    value: 'available-for-swap',
    label: 'Available for Exchange',
    description: 'Trade-in or swap requests only',
    icon: 'swap-horizontal',
    tone: 'accent',
  },
];

/** An ISBN-10 or ISBN-13, once the separators are taken out. */
const ISBN = /^(\d{9}[\dX]|\d{13})$/;

function isbnLooksRight(value: string): boolean {
  return ISBN.test(value.replace(/[\s-]/g, '').toUpperCase());
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong.';
}

/**
 * Add Book — the create half of the shelf CRUD, pushed from the tab bar's FAB.
 *
 * The form writes through `addBookToShelf` and then refreshes `useLibrary()`:
 * Home, My Books and Exchange all read the shelf from that context, so a copy
 * that is only in the store is a copy no other screen can see.
 */
export default function AddBookScreen() {
  const { refresh } = useLibrary();
  const { user } = useSession();
  const insets = useSafeAreaInsets();

  const [genres, setGenres] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [isbn, setIsbn] = useState('');
  const [year, setYear] = useState('');
  const [blurb, setBlurb] = useState('');
  const [condition, setCondition] = useState<CopyCondition>('paperback');
  const [status, setStatus] = useState<InitialStatus>('on-shelf');
  const [seeking, setSeeking] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [taggingOpen, setTaggingOpen] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    let active = true;

    getGenres()
      .then((list) => {
        if (active) setGenres(list);
      })
      .catch(() => {
        // The catalog's genres are a convenience; "+ Add Tag" still works.
        if (active) setGenres([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const swapping = status === 'available-for-swap';
  const ready = title.trim().length > 0 && author.trim().length > 0;

  function clear(field: keyof FormErrors) {
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));
  }

  function changeTitle(value: string) {
    setTitle(value);
    clear('title');
  }

  function changeAuthor(value: string) {
    setAuthor(value);
    clear('author');
  }

  function changeYear(value: string) {
    setYear(value);
    clear('year');
  }

  function chooseGenre(option: string) {
    setGenre(option);
    clear('genre');
  }

  function toggleSeeking(option: string) {
    setSeeking((previous) =>
      previous.includes(option)
        ? previous.filter((candidate) => candidate !== option)
        : [...previous, option]
    );
  }

  function commitTag() {
    const tag = newTag.trim();
    if (!tag) {
      setTaggingOpen(false);
      return;
    }

    const existing = genres.find((candidate) => candidate.toLowerCase() === tag.toLowerCase());
    if (!existing) {
      setGenres((previous) => [...previous, tag]);
    }

    chooseGenre(existing ?? tag);
    setNewTag('');
    setTaggingOpen(false);
  }

  function changeStatus(next: InitialStatus) {
    setStatus(next);
    // "Seeking" only means something on an exchange listing.
    if (next !== 'available-for-swap') {
      setSeeking([]);
    }
  }

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!title.trim()) {
      next.title = 'A book needs a title.';
    }
    if (!author.trim()) {
      next.author = 'A book needs an author.';
    }
    if (!genre) {
      next.genre = 'Pick a genre so neighbors can find it.';
    }
    if (year.trim() && !/^\d{4}$/.test(year.trim())) {
      next.year = 'Four digits, e.g. 2008.';
    }

    return next;
  }

  async function handleSubmit() {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      return;
    }

    setBusy(true);
    try {
      await addBookToShelf({
        title: title.trim(),
        author: author.trim(),
        genre,
        isbn: isbn.trim() || undefined,
        year: year.trim() ? Number(year.trim()) : undefined,
        blurb: blurb.trim() || undefined,
        condition,
        status,
        seeking: swapping ? seeking : [],
      });

      // Home, My Books and Exchange all read the shelf from the context — it
      // has to reload before the new copy exists anywhere but the store.
      await refresh();
      router.back();
    } catch (cause) {
      Alert.alert('Could not add that book', messageFrom(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <AddBookBar
        title="Add Book"
        onBack={() => router.back()}
        userName={user?.name ?? 'You'}
        avatarUrl={user?.avatar}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.statusRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel and go back"
              hitSlop={Spacing.md}
              onPress={() => router.back()}
              style={({ pressed }) => [styles.cancel, { opacity: pressed ? 0.6 : 1 }]}>
              <Ionicons name="close" size={20} color={Colors.onSurface} />
              <Text variant="labelLg" color="onSurface">
                Cancel
              </Text>
            </Pressable>

            <Pill
              label={ready ? 'Ready to add' : 'Title and author required'}
              tone={ready ? 'success' : 'neutral'}
              dot
            />
          </View>

          <MetadataCard title={title} author={author} isbn={isbn} onScan={noop} />

          <Field
            label="Book Title"
            autoCapitalize="words"
            error={errors.title}
            onChangeText={changeTitle}
            placeholder="Clean Code: A Handbook of Agile Software Craftsmanship"
            returnKeyType="next"
            value={title}
            valid={title.trim().length > 1}
          />

          <Field
            label="Author / Contributor"
            autoCapitalize="words"
            error={errors.author}
            onChangeText={changeAuthor}
            placeholder="Robert C. Martin"
            returnKeyType="next"
            value={author}
            valid={author.trim().length > 1}
          />

          <FormSection
            title="Genre & Shelf Category"
            hint={genre ? `${genre} selected` : 'Pick one'}
            error={errors.genre}>
            <ChipCloud
              options={genres}
              isSelected={(option) => option === genre}
              onToggle={chooseGenre}
              trailing={
                <Chip
                  label={taggingOpen ? 'Close' : '+ Add Tag'}
                  onPress={() => setTaggingOpen((previous) => !previous)}
                />
              }
            />

            {taggingOpen ? (
              <View style={styles.tagRow}>
                <View style={styles.grow}>
                  <Field
                    autoCapitalize="words"
                    autoFocus
                    onChangeText={setNewTag}
                    onSubmitEditing={commitTag}
                    placeholder="New genre, e.g. Poetry"
                    returnKeyType="done"
                    value={newTag}
                    accessibilityLabel="New genre"
                  />
                </View>
                <Button label="Add" variant="tonal" size="md" onPress={commitTag} />
              </View>
            ) : null}
          </FormSection>

          <View style={styles.pairRow}>
            <View style={styles.isbn}>
              <Field
                label="ISBN Number"
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
                onChangeText={setIsbn}
                placeholder="978-0132350884"
                value={isbn}
                valid={isbnLooksRight(isbn)}
              />
            </View>

            <View style={styles.year}>
              <Field
                label="Year"
                error={errors.year}
                keyboardType="number-pad"
                maxLength={4}
                onChangeText={changeYear}
                placeholder="2008"
                value={year}
                valid={/^\d{4}$/.test(year.trim())}
              />
            </View>
          </View>

          <FormSection title="Copy Format" hint="How it sits on the shelf">
            <Segmented<CopyCondition>
              value={condition}
              onChange={setCondition}
              options={CONDITIONS}
            />
          </FormSection>

          <FormSection title="Lending Preference">
            <LendingOptions<InitialStatus>
              options={LENDING}
              value={status}
              onChange={changeStatus}
            />
          </FormSection>

          {swapping ? (
            <FormSection
              title="Seeking in Return"
              hint={seeking.length > 0 ? `${seeking.length} selected` : 'Optional'}>
              <Text variant="caption" color="onSurfaceMuted">
                Pick the genres you would trade this copy for. Leave it empty to stay open to any
                offer.
              </Text>
              <ChipCloud
                options={genres}
                isSelected={(option) => seeking.includes(option)}
                onToggle={toggleSeeking}
              />
            </FormSection>
          ) : null}

          <FormSection title="Curator’s Notes & Summary" hint="Optional">
            <NoteBox
              value={blurb}
              onChangeText={setBlurb}
              placeholder="A must-read handbook for software craftsmanship, including pragmatic refactoring techniques and clean testing patterns."
              accessibilityLabel="Notes and summary"
            />
          </FormSection>

          <Card style={styles.dropPoint}>
            <IconTile name="home-outline" tone="accent" size={44} />
            <View style={styles.dropText}>
              <Text variant="title" color="onSurface">
                Drop Point
              </Text>
              <Text variant="caption" color="onSurfaceMuted">
                {user?.hub ?? 'North Hall'} · where neighbors collect from you
              </Text>
            </View>
          </Card>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.gutter }]}>
          <Button
            label="Add Book to My Shelf"
            icon="add-circle-outline"
            size="lg"
            block
            busy={busy}
            onPress={handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** The barcode control is deliberately inert — there is no camera integration. */
function noop() {}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    gap: Spacing.x5,
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.x8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  cancel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  grow: {
    flex: 1,
  },
  pairRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xl,
  },
  isbn: {
    flex: 2,
  },
  year: {
    flex: 1,
  },
  dropPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  dropText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  footer: {
    paddingHorizontal: Spacing.gutter,
    paddingTop: Spacing.xl,
    backgroundColor: Colors.background,
  },
});
