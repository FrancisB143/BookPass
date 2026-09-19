import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconTile, type IconTileProps } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type LendingOption<T extends string> = {
  value: T;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: NonNullable<IconTileProps['tone']>;
};

export type LendingOptionsProps<T extends string> = {
  options: LendingOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * The stacked single-choice list the frame uses for lending preference: one
 * row lifts onto white and takes the tick, the rest stay on the tinted track.
 *
 * A radio group rather than a `<Segmented>` because each option needs a line
 * of explanation — what a neighbour can actually do with the copy.
 */
export function LendingOptions<T extends string>({
  options,
  value,
  onChange,
}: LendingOptionsProps<T>) {
  return (
    <View accessibilityRole="radiogroup" style={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityHint={option.description}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.row,
              selected ? styles.rowSelected : null,
              { opacity: pressed ? 0.9 : 1 },
            ]}>
            <IconTile name={option.icon} tone={option.tone} size={40} />

            <View style={styles.text}>
              <Text variant="labelLg" color="onSurface">
                {option.label}
              </Text>
              <Text variant="caption" color="onSurfaceMuted">
                {option.description}
              </Text>
            </View>

            {selected ? (
              <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: Radius.md,
  },
  rowSelected: {
    backgroundColor: Colors.surface,
  },
  text: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
