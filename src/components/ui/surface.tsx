import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Elevation, Radius, Spacing, type ThemeColor } from '@/constants/theme';

export type CardProps = ViewProps & {
  /** `raised` lifts off the canvas; `flat` sits in it (tinted, no shadow). */
  tone?: 'raised' | 'flat' | 'accent' | 'success';
  padded?: boolean;
  radius?: keyof typeof Radius;
};

const TONES: Record<NonNullable<CardProps['tone']>, { background: string; bordered: boolean }> = {
  raised: { background: Colors.surface, bordered: false },
  flat: { background: Colors.surfaceVariant, bordered: false },
  accent: { background: Colors.primaryContainer, bordered: false },
  success: { background: Colors.successContainer, bordered: false },
};

export function Card({
  tone = 'raised',
  padded = true,
  radius = 'lg',
  style,
  ...rest
}: CardProps) {
  const { background } = TONES[tone];

  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderRadius: Radius[radius],
          padding: padded ? Spacing.gutter : 0,
        },
        tone === 'raised' && Elevation.card,
        style,
      ]}
      {...rest}
    />
  );
}

export type IconTileProps = {
  name: keyof typeof Ionicons.glyphMap;
  /** Background tint. The glyph colour is derived to sit on it. */
  tone?: 'accent' | 'success' | 'neutral' | 'primary';
  size?: number;
  round?: boolean;
};

const TILE_TONES: Record<
  NonNullable<IconTileProps['tone']>,
  { background: string; foreground: ThemeColor }
> = {
  accent: { background: Colors.primaryContainer, foreground: 'onPrimaryContainer' },
  success: { background: Colors.successContainer, foreground: 'onSuccessContainer' },
  neutral: { background: Colors.surfaceVariant, foreground: 'onSurfaceVariant' },
  primary: { background: Colors.primary, foreground: 'onPrimary' },
};

/** The rounded icon squares and circles used throughout the design. */
export function IconTile({ name, tone = 'accent', size = 40, round = true }: IconTileProps) {
  const palette = TILE_TONES[tone];

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: round ? Radius.pill : Radius.sm,
          backgroundColor: palette.background,
        },
      ]}>
      <Ionicons name={name} size={size * 0.48} color={Colors[palette.foreground]} />
    </View>
  );
}

/** Hairline rule, optionally with a centred label — "OR CONTINUE WITH". */
export function Divider({ style }: { style?: ViewProps['style'] }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.outline,
  },
});
