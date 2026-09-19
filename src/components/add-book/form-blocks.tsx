import type { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Chip } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export type FormSectionProps = {
  title: string;
  /** Right-aligned status beside the heading — "Tech selected". */
  hint?: string;
  /** Inline validation message, styled like `<Field error>`. */
  error?: string;
  children: ReactNode;
};

/**
 * A labelled block for the controls `<Field>` does not cover — chip clouds,
 * the segmented condition toggle, the lending rows. It carries the same label
 * row and error line as `<Field>` so the form reads as one thing.
 */
export function FormSection({ title, hint, error, children }: FormSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.labelRow}>
        <Text variant="labelLg" color="onSurface">
          {title}
        </Text>
        {hint ? (
          <Text variant="caption" color="onSurfaceMuted" numberOfLines={1} style={styles.hint}>
            {hint}
          </Text>
        ) : null}
      </View>

      {children}

      {error ? (
        <Text variant="caption" color="error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export type ChipCloudProps = {
  options: string[];
  isSelected: (option: string) => boolean;
  onToggle: (option: string) => void;
  /** Appended after the options — the frame's "+ Add Tag" chip. */
  trailing?: ReactNode;
};

/** The wrapping chip rows from the frame. Selection is the caller's to model. */
export function ChipCloud({ options, isSelected, onToggle, trailing }: ChipCloudProps) {
  return (
    <View style={styles.cloud}>
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={isSelected(option)}
          onPress={() => onToggle(option)}
        />
      ))}
      {trailing}
    </View>
  );
}

export type NoteBoxProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
};

/**
 * The blurb box. `<Field>` is a single-line pill by design — several lines of
 * text inside a full round crop against the ends — so the notes keep the same
 * tokens in a rounded rectangle.
 */
export function NoteBox({ value, onChangeText, placeholder, accessibilityLabel }: NoteBoxProps) {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      multiline
      numberOfLines={5}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.onSurfaceMuted}
      style={styles.note}
      textAlignVertical="top"
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.xl,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  hint: {
    flexShrink: 1,
  },
  cloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  note: {
    minHeight: 132,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
    ...Typography.body,
    color: Colors.onSurface,
  },
});
