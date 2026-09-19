import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, type ThemeColor } from '@/constants/theme';

type Tone = 'success' | 'accent' | 'error' | 'neutral' | 'inverse';

const TONES: Record<Tone, { background: string; foreground: ThemeColor }> = {
  success: { background: Colors.successContainer, foreground: 'onSuccessContainer' },
  accent: { background: Colors.primaryContainer, foreground: 'onPrimaryContainer' },
  error: { background: Colors.errorContainer, foreground: 'error' },
  neutral: { background: Colors.surfaceVariant, foreground: 'onSurfaceVariant' },
  inverse: { background: Colors.inverseSurface, foreground: 'onInverseSurface' },
};

export type PillProps = {
  label: string;
  tone?: Tone;
  /** Leading status dot, as on "Available for Exchange". */
  dot?: boolean;
};

/** Status badge. Not interactive — see `Chip` for filters. */
export function Pill({ label, tone = 'neutral', dot = false }: PillProps) {
  const palette = TONES[tone];

  return (
    <View style={[styles.pill, { backgroundColor: palette.background }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: Colors[palette.foreground] }]} /> : null}
      <Text variant="label" color={palette.foreground} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

/** Selectable filter chip. Selected reads as the inverted black pill. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? Colors.inverseSurface : Colors.surfaceVariant,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Text
        variant="labelLg"
        color={selected ? 'onInverseSurface' : 'onSurfaceVariant'}
        numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
  chip: {
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
  },
});
