import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { BookSummaryCard } from '@/components/edit-book/book-summary-card';
import { DangerZone } from '@/components/edit-book/danger-zone';
import { EditBookAppBar, ManagementBar } from '@/components/edit-book/edit-book-app-bar';
import {
  Notice,
  OptionTrack,
  PickerRow,
  SectionLabel,
  TextArea,
} from '@/components/edit-book/edit-controls';
import { Screen } from '@/components/screen';
import { ErrorState, LoadingState } from '@/components/screen-states';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Chip } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Colors, NON_INTERACTIVE, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import { getGenres, getListing, type CopyPatch } from '@/services/catalog';
import type { CopyCondition, CopyStatus, Listing } from '@/types';

/** The two statuses a member chooses between. `lent-out` is set by the loan. */
const STATUS_OPTIONS: { value: CopyStatus; label: string }[] = [
  { value: 'on-shelf', label: 'On Shelf' },
  { value: 'available-for-swap', label: 'For Swap' },
];

const CONDITION_OPTIONS: { value: CopyCondition; label: string }[] = [
  { value: 'hardcover', label: 'Hardcover' },
  { value: 'paperback', label: 'Paperback' },
];

type FormState = {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  blurb: string;
  hub: string;
  condition: CopyCondition;
  status: CopyStatus;
  seeking: string[];
};

/** The saved record, normalised so the form can be compared against it. */
function toForm({ book, copy }: Listing): FormState {
  return {
    title: book.title,
    author: book.author,
    genre: book.genre,
    isbn: book.isbn ?? '',
    blurb: book.blurb ?? '',
    hub: copy.hub,
    condition: copy.condition,
    status: copy.status,
    seeking: copy.seeking,
  };
}

function sameSeeking(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((genre) => b.includes(genre));
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Something went wrong.';
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

/**
 * The overflow menu and the two cover affordances are presentational until an
 * image picker and a barcode scanner land.
 */
function noop() {}

/**
 * Edit and delete one copy on the current member's shelf.
 *
 * The route param is a **copy** id, not a book id: two members owning the same
 * work edit different records, and only the owner's copy is touched here. The
 * shared `Book` fields — title, author, genre, ISBN, blurb — are edited with
 * it, so a correction reaches everyone who owns the same work.
 *
 * Delete is boxed off in its own card and confirmed before it runs. A copy out
 * on loan cannot be removed at all; that is said up front rather than left for
 * the user to discover by failing.
 */
export default function EditBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const copyId = id ?? '';

  const { editCopy, deleteCopy, requests } = useLibrary();
  const { user } = useSession();

  const [listing, setListing] = useState<Listing | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [genreOpen, setGenreOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!copyId) {
      setLoadError('No book was selected.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      // `getListing` rejects on an unknown id rather than resolving empty.
      const [next, known] = await Promise.all([getListing(copyId), getGenres()]);
      setListing(next);
      setForm(toForm(next));
      // This copy's own genre may predate the catalogue's list.
      setGenres([...new Set([...known, next.book.genre])].sort());
    } catch (cause) {
      setLoadError(messageFrom(cause));
    } finally {
      setLoading(false);
    }
  }, [copyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const baseline = useMemo(() => (listing ? toForm(listing) : null), [listing]);

  const dirty = useMemo(() => {
    if (!form || !baseline) return false;
    return (
      form.title.trim() !== baseline.title ||
      form.author.trim() !== baseline.author ||
      form.genre !== baseline.genre ||
      form.isbn.trim() !== baseline.isbn ||
      form.blurb.trim() !== baseline.blurb ||
      form.hub.trim() !== baseline.hub ||
      form.condition !== baseline.condition ||
      form.status !== baseline.status ||
      !sameSeeking(form.seeking, baseline.seeking)
    );
  }, [form, baseline]);

  const complete = Boolean(form && form.title.trim() && form.author.trim());
  const lentOut = listing?.copy.status === 'lent-out';
  const pendingSwaps = requests.filter((detail) => detail.listing.copy.id === copyId).length;

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => (previous ? { ...previous, [key]: value } : previous));
  }

  function handleStatus(status: CopyStatus) {
    // Seeking genres only mean anything on a copy that is up for exchange.
    setForm((previous) =>
      previous
        ? { ...previous, status, seeking: status === 'available-for-swap' ? previous.seeking : [] }
        : previous
    );
  }

  function toggleSeeking(genre: string) {
    setForm((previous) =>
      previous
        ? {
            ...previous,
            seeking: previous.seeking.includes(genre)
              ? previous.seeking.filter((candidate) => candidate !== genre)
              : [...previous.seeking, genre],
          }
        : previous
    );
  }

  function handleGenre(genre: string) {
    patch('genre', genre);
    setGenreOpen(false);
  }

  async function handleSave() {
    if (!form || !baseline || !dirty || !complete) return;

    // Only what actually changed travels, so an untouched field can never
    // overwrite a value that was corrected somewhere else.
    const changes: CopyPatch = {};
    if (form.title.trim() !== baseline.title) changes.title = form.title.trim();
    if (form.author.trim() !== baseline.author) changes.author = form.author.trim();
    if (form.genre !== baseline.genre) changes.genre = form.genre;
    if (form.isbn.trim() !== baseline.isbn) changes.isbn = form.isbn.trim();
    if (form.blurb.trim() !== baseline.blurb) changes.blurb = form.blurb.trim();
    if (form.hub.trim() !== baseline.hub) changes.hub = form.hub.trim();
    if (form.condition !== baseline.condition) changes.condition = form.condition;
    if (form.status !== baseline.status) changes.status = form.status;
    if (!sameSeeking(form.seeking, baseline.seeking)) changes.seeking = form.seeking;

    setSaving(true);
    try {
      await editCopy(copyId, changes);
      router.back();
    } catch (cause) {
      Alert.alert('Could not save those changes', messageFrom(cause));
    } finally {
      setSaving(false);
    }
  }

  async function runDelete() {
    setDeleting(true);
    try {
      await deleteCopy(copyId);
      router.back();
    } catch (cause) {
      // `deleteCopy` refuses while the copy is lent out — say so verbatim.
      Alert.alert('Could not delete that book', messageFrom(cause));
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    if (!listing) return;

    const swaps = pendingSwaps
      ? ` and cancel ${plural(pendingSwaps, 'pending exchange request')}`
      : '';

    Alert.alert(
      'Are you sure you want to delete this book?',
      `Removing “${listing.book.title}” will clear it from your personal catalog${swaps}. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Delete Book', style: 'destructive', onPress: () => void runDelete() },
      ]
    );
  }

  return (
    <Screen>
      <LinearGradient
        colors={[Colors.surfaceBright, Colors.background]}
        style={[StyleSheet.absoluteFill, NON_INTERACTIVE]}
      />

      <EditBookAppBar
        title="Edit Book"
        userName={user?.name ?? listing?.owner.name ?? 'You'}
        avatarUrl={user?.avatar ?? listing?.owner.avatar}
        onBack={() => router.back()}
        onMore={noop}
      />

      {loading ? (
        <LoadingState label="Opening this book…" />
      ) : loadError || !listing || !form ? (
        <ErrorState message={loadError ?? 'That book is no longer on your shelf.'} onRetry={load} />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fill}>
          <ManagementBar
            label="Book Management"
            onSave={handleSave}
            saving={saving}
            disabled={!dirty || !complete}
          />

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <BookSummaryCard
              book={listing.book}
              status={listing.copy.status}
              title={form.title}
              author={form.author}
              isbn={form.isbn}
              onChangeCover={noop}
              onScanIsbn={noop}
            />

            <View style={styles.form}>
              <Field
                label="Book Title"
                hint="Required"
                icon="book-outline"
                onChangeText={(value) => patch('title', value)}
                placeholder="The Secret History"
                value={form.title}
                valid={form.title.trim().length > 0}
              />

              <Field
                label="Author"
                hint="Required"
                icon="person-outline"
                onChangeText={(value) => patch('author', value)}
                placeholder="Donna Tartt"
                value={form.author}
                valid={form.author.trim().length > 0}
              />

              <View style={styles.group}>
                <SectionLabel label="Genre & Category" hint={`${genres.length} in the catalog`} />
                <PickerRow
                  icon="pricetags-outline"
                  value={form.genre}
                  placeholder="Pick a genre"
                  open={genreOpen}
                  onPress={() => setGenreOpen((previous) => !previous)}
                />
                {genreOpen ? (
                  <View style={styles.chips}>
                    {genres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        selected={genre === form.genre}
                        onPress={() => handleGenre(genre)}
                      />
                    ))}
                  </View>
                ) : null}
              </View>

              <Field
                label="ISBN"
                hint="Finds the cover"
                icon="barcode-outline"
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
                onChangeText={(value) => patch('isbn', value)}
                placeholder="9781400031702"
                value={form.isbn}
              />

              <View style={styles.group}>
                <SectionLabel
                  label="Availability Status"
                  hint={pendingSwaps ? plural(pendingSwaps, 'pending swap') : undefined}
                  hintColor="success"
                  hintIcon="swap-horizontal"
                />
                {lentOut ? (
                  <Notice icon="time-outline">
                    This copy is out on loan, so its status stays &ldquo;Lent Out&rdquo; until the
                    borrower returns it.
                  </Notice>
                ) : (
                  <OptionTrack
                    options={STATUS_OPTIONS}
                    value={form.status}
                    onChange={handleStatus}
                  />
                )}
              </View>

              {form.status === 'available-for-swap' ? (
                <View style={styles.group}>
                  <SectionLabel
                    label="Seeking in Exchange"
                    hint={form.seeking.length ? `${form.seeking.length} picked` : 'Open to anything'}
                  />
                  <View style={styles.chips}>
                    {genres.map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        selected={form.seeking.includes(genre)}
                        onPress={() => toggleSeeking(genre)}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              <View style={styles.group}>
                <SectionLabel label="Copy Condition" />
                <OptionTrack
                  options={CONDITION_OPTIONS}
                  value={form.condition}
                  onChange={(condition) => patch('condition', condition)}
                />
              </View>

              <View style={styles.group}>
                <SectionLabel label="Book Synopsis" hint={`${form.blurb.trim().length} chars`} />
                <TextArea
                  onChangeText={(value) => patch('blurb', value)}
                  placeholder="What a neighbor should know before they borrow it."
                  value={form.blurb}
                />
              </View>

              <Field
                label="Neighborhood Pickup Spot"
                hint="Where swaps happen"
                icon="location-outline"
                onChangeText={(value) => patch('hub', value)}
                placeholder="North Hall"
                value={form.hub}
              />
            </View>

            <View style={styles.actions}>
              <Button
                label="Save Changes"
                icon="save-outline"
                onPress={handleSave}
                busy={saving}
                disabled={!dirty || !complete}
                size="lg"
                block
              />

              {!complete ? (
                <Text variant="caption" color="onSurfaceMuted" style={styles.centred}>
                  A book needs both a title and an author.
                </Text>
              ) : !dirty ? (
                <Text variant="caption" color="onSurfaceMuted" style={styles.centred}>
                  Nothing has changed yet.
                </Text>
              ) : null}

              <DangerZone
                message="Removing this book will permanently unlink it from your BookPass shelf and cancel any pending neighborhood exchange requests."
                actionLabel="Delete Book from My Shelf"
                onPress={confirmDelete}
                busy={deleting}
                blockedReason={
                  lentOut
                    ? 'That book is lent out. It has to come back before you can remove it.'
                    : undefined
                }
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: Spacing.x6,
    paddingHorizontal: Spacing.x5,
    paddingBottom: Spacing.x8,
  },
  form: {
    gap: Spacing.x5,
  },
  group: {
    gap: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actions: {
    gap: Spacing.gutter,
  },
  centred: {
    textAlign: 'center',
  },
});
