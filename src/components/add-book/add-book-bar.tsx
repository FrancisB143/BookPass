import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/home/avatar';
import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';

export type AddBookBarProps = {
  title: string;
  onBack: () => void;
  userName: string;
  avatarUrl?: string;
};

/**
 * The app bar for the pushed route. The stack draws no header, so the screen
 * owns its back control and pads the notch itself — the same arrangement the
 * tab screens use.
 */
export function AddBookBar({ title, onBack, userName, avatarUrl }: AddBookBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + Spacing.md }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={Spacing.xl}
        onPress={onBack}
        style={({ pressed }) => [styles.back, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
      </Pressable>

      <IconTile name="book" tone="primary" size={34} round={false} />

      <Text variant="title" color="onSurface" numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <Avatar name={userName} uri={avatarUrl} size={38} />
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
  back: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
  },
});
