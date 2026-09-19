import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/components/my-books/shelf-status';
import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

const AVATAR = 40;

export type ShelfAppBarProps = {
  /** The second line under the wordmark — "My Books". */
  subtitle: string;
  userName: string;
  avatarUrl?: string;
  /** Draws the orange dot on the bell. */
  hasAlerts: boolean;
  onSearch: () => void;
  onAlerts: () => void;
};

/**
 * The app bar the frame puts above every tab: brand tile, wordmark, the
 * current section, then the icon actions.
 *
 * It sits outside the list so it stays put while the catalog scrolls, and it
 * pads itself for the notch — the tab navigator draws no header.
 */
export function ShelfAppBar({
  subtitle,
  userName,
  avatarUrl,
  hasAlerts,
  onSearch,
  onAlerts,
}: ShelfAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + Spacing.md }]}>
      <IconTile name="book" tone="primary" size={38} round={false} />

      <View style={styles.wordmark}>
        <Text variant="title" color="primary" numberOfLines={1}>
          BookPass
        </Text>
        <Text variant="labelLg" color="onSurface" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search your shelf"
        hitSlop={Spacing.md}
        onPress={onSearch}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="search" size={22} color={Colors.onSurface} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={hasAlerts ? 'Notifications, unread' : 'Notifications'}
        hitSlop={Spacing.md}
        onPress={onAlerts}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="notifications-outline" size={22} color={Colors.onSurface} />
        {hasAlerts ? <View style={styles.badge} /> : null}
      </Pressable>

      <View accessible accessibilityLabel={`Signed in as ${userName}`} style={styles.avatar}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text variant="label" color="onPrimaryContainer">
            {initials(userName)}
          </Text>
        )}
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
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.primaryContainer,
  },
});
