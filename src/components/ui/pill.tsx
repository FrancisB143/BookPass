import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Duration, EASE_IN_OUT } from '@/constants/motion';
import { Colors, Radius, Spacing, Typography, type ThemeColor } from '@/constants/theme';

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

/**
 * Selectable filter chip. Selected reads as the inverted black pill.
 *
 * Both the fill and the label cross-fade rather than switching, so a row of
 * chips reads as one control changing state instead of two things blinking.
 */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  const progress = useDerivedValue(
    () => withTiming(selected ? 1 : 0, { duration: Duration.fast, easing: EASE_IN_OUT }),
    [selected]
  );

  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.surfaceVariant, Colors.inverseSurface]
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.onSurfaceVariant, Colors.onInverseSurface]
    ),
  }));

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.chip}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.chipFill, fill]} />
      <Animated.Text style={[Typography.labelLg, labelStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </PressableScale>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  chipFill: {
    borderRadius: Radius.pill,
  },
});
