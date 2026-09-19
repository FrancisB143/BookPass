import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';

const BOX = 20;

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** "Keep me signed in" — a square tick box with its label as the hit target. */
export function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={Spacing.md}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.checkRow, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[styles.box, checked ? styles.boxChecked : null]}>
        {checked ? <Ionicons name="checkmark" size={14} color={Colors.onPrimary} /> : null}
      </View>
      <Text variant="body" color="onSurfaceVariant">
        {label}
      </Text>
    </Pressable>
  );
}

export type TextLinkProps = {
  label: string;
  onPress: () => void;
};

/** Inline accent link — "Forgot password?". */
export function TextLink({ label, onPress }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      hitSlop={Spacing.md}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      <Text variant="labelLg" color="onPrimaryContainer">
        {label}
      </Text>
    </Pressable>
  );
}

export type PillLinkProps = {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

/** White pill with an accent label — the "Guest Pass" call to action. */
export function PillLink({ label, onPress, icon = 'arrow-forward' }: PillLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pillLink, { opacity: pressed ? 0.85 : 1 }]}>
      <Text variant="labelLg" color="onPrimaryContainer" numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name={icon} size={16} color={Colors.onPrimaryContainer} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  box: {
    width: BOX,
    height: BOX,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.outline,
    backgroundColor: Colors.surfaceVariant,
  },
  boxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  pillLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    ...Elevation.card,
  },
});
