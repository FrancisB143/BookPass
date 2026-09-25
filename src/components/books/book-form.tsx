import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Chip } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { BOOK_STATUSES, STATUS_LABEL, type BookDraft, type FieldErrors } from '@/types';

export type BookFormProps = {
  value: BookDraft;
  onChange: (draft: BookDraft) => void;
  /** Per-field messages, usually straight from the API's 422 response. */
  errors: FieldErrors;
  busy: boolean;
  submitLabel: string;
  onSubmit: () => void;
  /** Slot beneath the form — the edit screen puts its delete card here. */
  footer?: ReactNode;
};

/** A titled group of inputs. Grouping is what stops a form reading as a wall. */
function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Card style={styles.section}>
      <Overline color="onSurfaceMuted">{label}</Overline>
      {children}
    </Card>
  );
}

/**
 * The create and edit screens share this form.
 *
 * One component rather than two similar ones, because a field added to Create
 * and forgotten in Edit is how a column quietly stops being editable.
 *
 * Fields are grouped into three named sections rather than stacked in one
 * card. Eight inputs in a row is a wall; three short groups is a form you can
 * see the end of.
 */
export function BookForm({
  value,
  onChange,
  errors,
  busy,
  submitLabel,
  onSubmit,
  footer,
}: BookFormProps) {
  function set<K extends keyof BookDraft>(key: K, next: BookDraft[K]) {
    onChange({ ...value, [key]: next });
  }

  const canSubmit = value.title.trim() !== '' && value.author.trim() !== '';

  return (
    <View style={styles.form}>
      {/* The preview sits beside the identity it previews, so typing a title
          and watching the cover resolve happens in one glance. */}
      <Card style={styles.preview}>
        <BookCover
          title={value.title || 'Untitled'}
          author={value.author || 'Unknown author'}
          isbn={value.isbn.trim() || null}
          coverUrl={value.coverUrl ?? null}
          width={84}
          height={118}
          radius={Radius.sm}
        />

        <View style={styles.previewText}>
          <Text variant="titleBook" color="onSurface" numberOfLines={2}>
            {value.title.trim() || 'Untitled book'}
          </Text>
          <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
            {value.author.trim() || 'No author yet'}
          </Text>
          <Text variant="caption" color="onSurfaceMuted" style={styles.previewHint}>
            {value.isbn.trim() || value.coverUrl
              ? 'Cover from Open Library.'
              : 'Add an ISBN and the cover appears here.'}
          </Text>
        </View>
      </Card>

      <Section label="The book">
        <Field
          label="Title"
          hint="Required"
          icon="book-outline"
          onChangeText={(next) => set('title', next)}
          placeholder="Atomic Habits"
          value={value.title}
          error={errors.title}
        />

        <Field
          label="Author"
          hint="Required"
          icon="person-outline"
          onChangeText={(next) => set('author', next)}
          placeholder="James Clear"
          value={value.author}
          error={errors.author}
        />
      </Section>

      <Section label="Catalogue details">
        <Field
          label="Genre"
          icon="pricetag-outline"
          onChangeText={(next) => set('genre', next)}
          placeholder="Self-help"
          value={value.genre}
          error={errors.genre}
        />

        <View style={styles.pair}>
          <View style={styles.grow}>
            <Field
              label="ISBN"
              icon="barcode-outline"
              keyboardType="numbers-and-punctuation"
              onChangeText={(next) => set('isbn', next)}
              placeholder="9780735211292"
              value={value.isbn}
              error={errors.isbn}
            />
          </View>
          <View style={styles.year}>
            <Field
              label="Year"
              icon="calendar-outline"
              keyboardType="number-pad"
              maxLength={4}
              onChangeText={(next) => set('publishedYear', next.replace(/[^0-9]/g, ''))}
              placeholder="2018"
              value={value.publishedYear}
              error={errors.publishedYear}
            />
          </View>
        </View>

        <View style={styles.block}>
          <Text variant="labelLg" color="onSurface">
            Description
          </Text>
          <TextInput
            multiline
            numberOfLines={5}
            onChangeText={(next) => set('description', next)}
            placeholder="What is this book about?"
            placeholderTextColor={Colors.onSurfaceMuted}
            style={styles.textArea}
            textAlignVertical="top"
            value={value.description}
          />
          {errors.description ? (
            <Text variant="caption" color="error">
              {errors.description}
            </Text>
          ) : null}
        </View>
      </Section>

      <Section label="Availability">
        <View style={styles.block}>
          <View style={styles.statuses}>
            {BOOK_STATUSES.map((status) => (
              <Chip
                key={status}
                label={STATUS_LABEL[status]}
                selected={value.status === status}
                onPress={() => set('status', status)}
              />
            ))}
          </View>
          {errors.status ? (
            <Text variant="caption" color="error">
              {errors.status}
            </Text>
          ) : (
            <Text variant="caption" color="onSurfaceMuted">
              Whether this copy can be borrowed right now.
            </Text>
          )}
        </View>
      </Section>

      {footer}

      <Button
        label={submitLabel}
        icon="checkmark"
        size="lg"
        onPress={onSubmit}
        busy={busy}
        disabled={!canSubmit}
        block
      />

      {!canSubmit ? (
        <Text variant="caption" color="onSurfaceMuted" style={styles.requirement}>
          A title and an author are required.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.gutter,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  previewText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  previewHint: {
    marginTop: Spacing.md,
  },
  section: {
    gap: Spacing.x5,
  },
  pair: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  grow: {
    flex: 1,
  },
  year: {
    width: 104,
  },
  block: {
    gap: Spacing.md,
  },
  statuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  textArea: {
    minHeight: 112,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
    ...Typography.body,
    color: Colors.onSurface,
  },
  requirement: {
    textAlign: 'center',
  },
});
