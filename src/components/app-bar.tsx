import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/pressable-scale';
import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

export type AppBarProps = {
  title: string;
  subtitle?: string;
  /** Shows a back arrow instead of the brand tile. */
  showBack?: boolean;
  /** Trailing controls, e.g. the list/grid switch. */
  actions?: ReactNode;
};

/**
 * Every screen's header.
 *
 * The stack runs with `headerShown: false`, so screens draw their own bar and
 * pad for the notch themselves.
 */
export function AppBar({ title, subtitle, showBack = false, actions }: AppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + Spacing.md }]}>
      {showBack ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
        </PressableScale>
      ) : (
        <IconTile name="library" tone="primary" size={38} round={false} />
      )}

      <View style={styles.headings}>
        <Text variant="title" color="onSurface" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actions}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.gutter,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surfaceBright,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.outline,
  },
  back: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headings: {
    flex: 1,
  },
});
