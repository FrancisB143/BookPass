import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export type FieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  /** Right-aligned hint beside the label, e.g. "Uni or Personal". */
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Shows a green check once the value is considered valid. */
  valid?: boolean;
  error?: string;
  /** Renders a password field with an eye toggle. */
  secure?: boolean;
};

export function Field({
  label,
  hint,
  icon,
  valid = false,
  error,
  secure = false,
  ...rest
}: FieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.field}>
      {label ? (
        <View style={styles.labelRow}>
          <Text variant="labelLg" color="onSurface">
            {label}
          </Text>
          {hint ? (
            <Text variant="caption" color="onSurfaceMuted">
              {hint}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        {icon ? (
          <Ionicons name={icon} size={18} color={Colors.onSurfaceMuted} />
        ) : null}

        <TextInput
          placeholderTextColor={Colors.onSurfaceMuted}
          secureTextEntry={secure && !revealed}
          style={styles.input}
          {...rest}
        />

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setRevealed((previous) => !previous)}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.onSurfaceMuted}
            />
          </Pressable>
        ) : valid ? (
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color="error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export type SegmentedProps<T extends string> = {
  options: { value: T; label: string; icon?: keyof typeof Ionicons.glyphMap; badge?: number }[];
  value: T;
  onChange: (value: T) => void;
};

/** Two-up pill toggle — "Sign In / Create Account", "Browse / Exchange Requests". */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View style={styles.segmentTrack}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected ? styles.segmentSelected : null]}>
            {option.icon ? (
              <Ionicons
                name={option.icon}
                size={16}
                color={selected ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
              />
            ) : null}
            <Text
              variant="labelLg"
              color={selected ? 'onPrimaryContainer' : 'onSurfaceVariant'}
              numberOfLines={1}>
              {option.label}
            </Text>
            {option.badge ? (
              <View style={styles.segmentBadge}>
                <Text variant="micro" color="onSurfaceVariant">
                  {String(option.badge)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  inputRowError: {
    backgroundColor: Colors.errorContainer,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.onSurface,
    // Android adds its own vertical padding that breaks the fixed row height.
    paddingVertical: 0,
  },
  segmentTrack: {
    flexDirection: 'row',
    padding: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    minHeight: 46,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
  },
  segmentSelected: {
    backgroundColor: Colors.surface,
  },
  segmentBadge: {
    minWidth: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.pill,
    alignItems: 'center',
    backgroundColor: Colors.surfaceDim,
  },
});
