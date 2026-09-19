import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { Divider } from '@/components/ui/surface';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Radius, Spacing, type ThemeColor } from '@/constants/theme';

export type DividerLabelProps = {
  label: string;
};

/** Hairline rule broken by a centred eyebrow — "OR CONTINUE WITH". */
export function DividerLabel({ label }: DividerLabelProps) {
  return (
    <View style={styles.dividerRow}>
      <Divider style={styles.rule} />
      <Overline>{label}</Overline>
      <Divider style={styles.rule} />
    </View>
  );
}

export type IconCircleProps = {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
};

/**
 * A dim circle carrying a glyph. `<IconTile tone="neutral">` shares its tint
 * with the tinted cards these sit on, so they need the dimmer step.
 */
export function IconCircle({ name, size = 48 }: IconCircleProps) {
  return (
    <View style={[styles.circle, { width: size, height: size }]}>
      <Ionicons name={name} size={size * 0.48} color={Colors.onSurfaceVariant} />
    </View>
  );
}

export type SsoRowProps = {
  label: string;
  onPress: () => void;
  /** Leading glyph, for the compact two-up rows. */
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: ThemeColor;
  /** Leading tile, for the full-width row. */
  tile?: ReactNode;
  /** Trailing badge — "Fast Track". */
  badge?: string;
  style?: StyleProp<ViewStyle>;
};

/** A pressable identity-provider row on the tinted track. */
export function SsoRow({
  label,
  onPress,
  icon,
  iconColor = 'onSurface',
  tile,
  badge,
  style,
}: SsoRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.ssoRow, { opacity: pressed ? 0.8 : 1 }, style]}>
      {tile}
      {icon ? <Ionicons name={icon} size={20} color={Colors[iconColor]} /> : null}

      <Text
        variant="labelLg"
        color="onSurface"
        numberOfLines={1}
        style={tile ? styles.grow : null}>
        {label}
      </Text>

      {badge ? <Pill label={badge} tone="success" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  rule: {
    flex: 1,
  },
  circle: {
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceDim,
  },
  ssoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    minHeight: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceVariant,
  },
  grow: {
    flex: 1,
  },
});
