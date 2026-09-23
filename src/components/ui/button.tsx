import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { Colors, Elevation, Radius, Spacing, type ThemeColor } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'leading' | 'trailing';
  busy?: boolean;
  disabled?: boolean;
  /** Stretch to fill the parent instead of hugging the label. */
  block?: boolean;
  style?: ViewStyle;
};

const PALETTE: Record<Variant, { background: string; border: string; foreground: ThemeColor }> = {
  primary: { background: Colors.primary, border: Colors.primary, foreground: 'onPrimary' },
  secondary: { background: Colors.surface, border: Colors.outline, foreground: 'onSurface' },
  tonal: { background: Colors.surfaceVariant, border: 'transparent', foreground: 'onSurface' },
  ghost: { background: 'transparent', border: 'transparent', foreground: 'onPrimaryContainer' },
  danger: { background: Colors.error, border: Colors.error, foreground: 'onError' },
};

const SIZING: Record<Size, { height: number; padding: number; gap: number; icon: number }> = {
  sm: { height: 34, padding: Spacing.xl, gap: Spacing.sm, icon: 14 },
  md: { height: 44, padding: Spacing.gutter, gap: Spacing.md, icon: 16 },
  lg: { height: 54, padding: Spacing.x6, gap: Spacing.lg, icon: 18 },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  busy = false,
  disabled = false,
  block = false,
  style,
}: ButtonProps) {
  const palette = PALETTE[variant];
  const sizing = SIZING[size];
  const blocked = disabled || busy;
  const foreground = Colors[palette.foreground];

  const glyph = icon ? (
    <Ionicons name={icon} size={sizing.icon} color={foreground} />
  ) : null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy }}
      disabled={blocked}
      onPress={onPress}
      style={[
        styles.base,
        {
          height: sizing.height,
          paddingHorizontal: sizing.padding,
          gap: sizing.gap,
          backgroundColor: palette.background,
          borderColor: palette.border,
          alignSelf: block ? 'stretch' : 'flex-start',
          opacity: blocked ? 0.45 : 1,
        },
        variant === 'primary' && !blocked && Elevation.floating,
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : (
        <View style={[styles.content, { gap: sizing.gap }]}>
          {iconPosition === 'leading' ? glyph : null}
          <Text variant="labelLg" color={palette.foreground} numberOfLines={1}>
            {label}
          </Text>
          {iconPosition === 'trailing' ? glyph : null}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
