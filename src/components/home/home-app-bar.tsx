import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/home/avatar';
import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

const ACTION_ICON = 22;

export type HomeAppBarProps = {
  name: string;
  avatarUri?: string;
  /** Draws the unread dot on the bell. */
  unread?: boolean;
};

/**
 * Logo, wordmark and the three status affordances. Search, notifications and
 * the portrait are presentational in the design — the working search field is
 * the one further down the screen.
 */
export function HomeAppBar({ name, avatarUri, unread = false }: HomeAppBarProps) {
  return (
    <View style={styles.bar}>
      <IconTile name="book" tone="primary" size={40} round={false} />

      <View style={styles.wordmark}>
        <Text variant="title" color="primary">
          BookPass
        </Text>
        <Text variant="label" color="onSurface">
          Home Dashboard
        </Text>
      </View>

      <View style={styles.actions}>
        <Ionicons
          accessibilityLabel="Search"
          name="search-outline"
          size={ACTION_ICON}
          color={Colors.onSurface}
        />

        <View>
          <Ionicons
            accessibilityLabel={unread ? 'Notifications, unread' : 'Notifications'}
            name="notifications-outline"
            size={ACTION_ICON}
            color={Colors.onSurface}
          />
          {unread ? <View style={styles.unread} /> : null}
        </View>

        <Avatar name={name} uri={avatarUri} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  wordmark: {
    flex: 1,
    gap: Spacing.xxs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  unread: {
    position: 'absolute',
    top: -Spacing.xxs,
    right: -Spacing.xxs,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
});
