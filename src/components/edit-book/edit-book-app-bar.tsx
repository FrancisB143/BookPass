import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/home/avatar';
import { Text } from '@/components/ui/text';
import { IconTile } from '@/components/ui/surface';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type EditBookAppBarProps = {
  /** The screen title beside the brand tile — "Edit Book". */
  title: string;
  userName: string;
  avatarUrl?: string;
  onBack: () => void;
  onMore: () => void;
};

/**
 * The pushed-route app bar: back, brand tile, title, overflow, portrait.
 *
 * It pads itself for the notch because the stack navigator draws no header,
 * and it sits outside the scroll view so the back control never scrolls away.
 */
export function EditBookAppBar({
  title,
  userName,
  avatarUrl,
  onBack,
  onMore,
}: EditBookAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + Spacing.md }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={Spacing.xl}
        onPress={onBack}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
      </Pressable>

      <IconTile name="book" tone="primary" size={28} round={false} />

      <Text variant="titleBook" color="onSurface" numberOfLines={1} style={styles.grow}>
        {title}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="More options"
        hitSlop={Spacing.xl}
        onPress={onMore}
        style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="ellipsis-vertical" size={20} color={Colors.onSurfaceVariant} />
      </Pressable>

      <Avatar name={userName} uri={avatarUrl} size={32} />
    </View>
  );
}

export type ManagementBarProps = {
  /** Section heading under the app bar — "Book Management". */
  label: string;
  onSave: () => void;
  saving: boolean;
  /** Nothing has changed yet, so there is nothing to save. */
  disabled: boolean;
};

/**
 * The compact save affordance the frame puts above the form, so a long edit
 * never has to be scrolled to the bottom to be committed.
 */
export function ManagementBar({ label, onSave, saving, disabled }: ManagementBarProps) {
  const blocked = disabled || saving;

  return (
    <View style={styles.management}>
      <Ionicons name="create-outline" size={18} color={Colors.onPrimaryContainer} />

      <Text variant="titleBook" color="onSurface" numberOfLines={1} style={styles.grow}>
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save changes"
        accessibilityState={{ disabled: blocked, busy: saving }}
        disabled={blocked}
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveChip,
          { opacity: blocked ? 0.45 : pressed ? 0.88 : 1 },
        ]}>
        {saving ? (
          <ActivityIndicator color={Colors.onPrimary} size="small" />
        ) : (
          <>
            <Ionicons name="checkmark" size={16} color={Colors.onPrimary} />
            <Text variant="labelLg" color="onPrimary">
              Save
            </Text>
          </>
        )}
      </Pressable>
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
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grow: {
    flex: 1,
  },
  management: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.x5,
    paddingBottom: Spacing.xl,
  },
  saveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    minWidth: 84,
    height: 40,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.pill,
    backgroundColor: Colors.onPrimaryContainer,
  },
});
