import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/home/avatar';
import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

const ACTION_ICON = 22;

export type BorrowedAppBarProps = {
  userName: string;
  avatarUrl?: string;
  /** Draws the orange dot on the bell. */
  hasAlerts: boolean;
  /** The magnifier goes looking for something to borrow. */
  onSearch: () => void;
  onAlerts: () => void;
};

/**
 * The app bar the frame puts above every tab: brand tile, wordmark, the
 * current section, then the icon actions.
 *
 * It sits outside the list so it stays put while the loans scroll, and it pads
 * itself for the notch — the tab navigator draws no header.
 */
export function BorrowedAppBar({
  userName,
  avatarUrl,
  hasAlerts,
  onSearch,
  onAlerts,
}: BorrowedAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + Spacing.md }]}>
      <IconTile name="book" tone="primary" size={38} round={false} />

      <View style={styles.wordmark}>
        <Text variant="title" color="primary" numberOfLines={1}>
          BookPass
        </Text>
        <Text variant="labelLg" color="onSurface" numberOfLines={1}>
          Borrowed Books
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Find a book to borrow"
        hitSlop={Spacing.md}
        onPress={onSearch}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="search" size={ACTION_ICON} color={Colors.onSurface} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasAlerts ? 'Notifications, unread' : 'Notifications'}
        hitSlop={Spacing.md}
        onPress={onAlerts}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="notifications-outline" size={ACTION_ICON} color={Colors.onSurface} />
        {hasAlerts ? <View style={styles.badge} /> : null}
      </Pressable>

      <Avatar name={userName} uri={avatarUrl} />
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
    backgroundColor: Colors.background,
  },
  wordmark: {
    flex: 1,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -Spacing.xxs,
    right: -Spacing.xxs,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
});
