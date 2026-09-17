import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  /** Shows a spinner and blocks presses. */
  busy?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  busy = false,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isBlocked = disabled || busy;

  const background =
    variant === 'primary' ? theme.accent : variant === 'danger' ? theme.danger : 'transparent';
  const foreground =
    variant === 'primary'
      ? theme.accentText
      : variant === 'danger'
        ? theme.background
        : theme.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderColor: variant === 'secondary' ? theme.border : background,
          opacity: isBlocked ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <ThemedText type="smallBold" style={{ color: foreground }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
