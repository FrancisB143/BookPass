import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

const AVATAR = 36;

export type ExchangeAppBarProps = {
  userName: string;
  /** Draws the dot on the bell while requests are waiting on an answer. */
  pending: boolean;
  onSearch: () => void;
  onAlerts: () => void;
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

/** The pushed-route screens draw their own bars; the stack has no header. */
export function ExchangeAppBar({ userName, pending, onSearch, onAlerts }: ExchangeAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + Spacing.md }]}>
      <IconTile name="book" tone="primary" size={38} round={false} />

      <View style={styles.brand}>
        <Text variant="title" color="onSurface" numberOfLines={1}>
          BookPass
        </Text>
        <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
          Exchange Market
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search the exchange"
        hitSlop={8}
        onPress={onSearch}
        style={styles.action}>
        <Ionicons name="search" size={20} color={Colors.onSurface} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={pending ? 'Requests waiting for an answer' : 'Notifications'}
        hitSlop={8}
        onPress={onAlerts}
        style={styles.action}>
        <Ionicons name="notifications-outline" size={20} color={Colors.onSurface} />
        {pending ? <View style={styles.dot} /> : null}
      </Pressable>

      <View style={styles.avatar}>
        <Text variant="label" color="onPrimaryContainer">
          {initials(userName)}
        </Text>
      </View>
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
  brand: {
    flex: 1,
  },
  action: {
    padding: Spacing.xs,
  },
  dot: {
    position: 'absolute',
    top: Spacing.xxs,
    right: Spacing.xxs,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryContainer,
  },
});
