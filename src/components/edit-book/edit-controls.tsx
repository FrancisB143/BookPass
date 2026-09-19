import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, Typography, type ThemeColor } from '@/constants/theme';

export type SectionLabelProps = {
  label: string;
  /** Right-hand hint — "Required", "138 chars", "1 Pending swap". */
  hint?: string;
  hintColor?: ThemeColor;
  hintIcon?: keyof typeof Ionicons.glyphMap;
  /** Small glyph after the label, e.g. the lending-notes info dot. */
  icon?: keyof typeof Ionicons.glyphMap;
};

/**
 * The label row above the controls `Field` cannot host — the status track, the
 * synopsis textarea, the seeking chips.
 *
 * It deliberately mirrors `Field`'s own label row (`labelLg` + `caption`) so a
 * form that mixes the two reads as one column.
 */
export function SectionLabel({ label, hint, hintColor = 'onSurfaceMuted', hintIcon, icon }: SectionLabelProps) {
  return (
    <View style={styles.labelRow}>
      <View style={styles.labelText}>
        <Text variant="labelLg" color="onSurface" numberOfLines={1}>
          {label}
        </Text>
        {icon ? <Ionicons name={icon} size={14} color={Colors.onPrimaryContainer} /> : null}
      </View>

      {hint ? (
        <View style={styles.labelText}>
          {hintIcon ? <Ionicons name={hintIcon} size={12} color={Colors[hintColor]} /> : null}
          <Text variant="caption" color={hintColor} numberOfLines={1}>
            {hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export type TextAreaProps = Omit<TextInputProps, 'style' | 'multiline'>;

/** The synopsis box. `Field` is a fixed-height pill, which multiline is not. */
export function TextArea(props: TextAreaProps) {
  return (
    <TextInput
      multiline
      textAlignVertical="top"
      placeholderTextColor={Colors.onSurfaceMuted}
      style={styles.textArea}
      {...props}
    />
  );
}

export type OptionTrackProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * The frame's radio group: a tinted track with the selected option as the
 * inverted black pill.
 *
 * `Segmented` from `@/components/ui` is the *other* toggle in the design — the
 * white-on-grey tab switcher. This screen uses the radio form the frame draws,
 * for both availability and binding.
 */
export function OptionTrack<T extends string>({ options, value, onChange }: OptionTrackProps<T>) {
  return (
    <View accessibilityRole="radiogroup" style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.trackOption,
              selected ? styles.trackOptionSelected : null,
              { opacity: pressed && !selected ? 0.7 : 1 },
            ]}>
            <Text
              variant="overlineSoft"
              color={selected ? 'onInverseSurface' : 'onSurfaceVariant'}
              numberOfLines={1}>
              {option.label.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type PickerRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  placeholder: string;
  open: boolean;
  onPress: () => void;
};

/** The genre row: reads like an input, opens the chip list beneath it. */
export function PickerRow({ icon, value, placeholder, open, onPress }: PickerRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onPress}
      style={({ pressed }) => [styles.pickerRow, { opacity: pressed ? 0.85 : 1 }]}>
      <Ionicons name={icon} size={18} color={Colors.onSurfaceMuted} />
      <Text
        variant="body"
        color={value ? 'onSurface' : 'onSurfaceMuted'}
        numberOfLines={1}
        style={styles.grow}>
        {value || placeholder}
      </Text>
      <Ionicons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={16}
        color={Colors.onSurfaceMuted}
      />
    </Pressable>
  );
}

export type NoticeProps = {
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
};

/** A tinted explanatory row — why a control is locked, what a choice means. */
export function Notice({ icon, children }: NoticeProps) {
  return (
    <View style={styles.notice}>
      <Ionicons name={icon} size={16} color={Colors.onSurfaceMuted} />
      <Text variant="caption" color="onSurfaceVariant" style={styles.grow}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  labelText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  textArea: {
    ...Typography.body,
    color: Colors.onSurface,
    minHeight: 92,
    padding: Spacing.gutter,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  track: {
    flexDirection: 'row',
    padding: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  trackOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
  },
  trackOptionSelected: {
    backgroundColor: Colors.inverseSurface,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  grow: {
    flex: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceVariant,
  },
});
