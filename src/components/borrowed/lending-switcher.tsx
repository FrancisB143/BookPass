import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { LendingSide } from '@/components/borrowed/borrowed-status';
import { Text } from '@/components/ui/text';
import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';

const OPTIONS: { value: LendingSide; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'borrowed', label: 'Borrowed by You', icon: 'book-outline' },
  { value: 'lent', label: 'Lent to Others', icon: 'share-social-outline' },
];

export type LendingSwitcherProps = {
  value: LendingSide;
  onChange: (side: LendingSide) => void;
  /** Open loans on each side, so the counts cannot drift from the lists. */
  counts: Record<LendingSide, number>;
};

/**
 * The two-up switcher at the top of the frame.
 *
 * `Segmented` holds its labels to one line, and "Borrowed by You" does not fit
 * a half-width segment at `labelLg` — the frame wraps it, so this does too.
 */
export function LendingSwitcher({ value, onChange, counts }: LendingSwitcherProps) {
  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        const count = counts[option.value];

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={`${option.label}, ${count}`}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected ? styles.segmentSelected : null,
              { opacity: pressed ? 0.85 : 1 },
            ]}>
            <Ionicons
              name={option.icon}
              size={18}
              color={selected ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
            />

            <Text
              variant="labelLg"
              color={selected ? 'onSurface' : 'onSurfaceVariant'}
              numberOfLines={2}
              style={styles.label}>
              {option.label}
            </Text>

            <View
              style={[
                styles.badge,
                { backgroundColor: selected ? Colors.primaryContainer : Colors.outline },
              ]}>
              <Text variant="overline" color={selected ? 'primaryDarkest' : 'onSurfaceVariant'}>
                {String(count)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
  },
  segmentSelected: {
    backgroundColor: Colors.surface,
    ...Elevation.card,
  },
  label: {
    flex: 1,
  },
  badge: {
    minWidth: Spacing.x5,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
});
