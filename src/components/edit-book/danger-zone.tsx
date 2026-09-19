import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Notice } from '@/components/edit-book/edit-controls';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type DangerZoneProps = {
  message: string;
  actionLabel: string;
  onPress: () => void;
  busy?: boolean;
  /**
   * Why the delete cannot run — a copy that is out on loan has to come back
   * first. Shown in place of guessing, and the button is disabled with it.
   */
  blockedReason?: string;
};

/**
 * The destructive half of the screen, boxed off from the form above it so a
 * delete is never a neighbour of a save.
 */
export function DangerZone({
  message,
  actionLabel,
  onPress,
  busy = false,
  blockedReason,
}: DangerZoneProps) {
  const blocked = Boolean(blockedReason) || busy;

  return (
    <Card style={styles.card}>
      <View style={styles.heading}>
        <Ionicons name="warning-outline" size={18} color={Colors.error} />
        <Text variant="labelLg" color="error">
          Danger Zone
        </Text>
      </View>

      <Text variant="caption" color="onSurfaceVariant">
        {message}
      </Text>

      {blockedReason ? <Notice icon="lock-closed-outline">{blockedReason}</Notice> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        accessibilityHint={blockedReason ?? 'Asks you to confirm before removing the book.'}
        accessibilityState={{ disabled: blocked, busy }}
        disabled={blocked}
        onPress={onPress}
        style={({ pressed }) => [
          styles.action,
          { opacity: blocked ? 0.45 : pressed ? 0.85 : 1 },
        ]}>
        {busy ? (
          <ActivityIndicator color={Colors.error} size="small" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text variant="labelLg" color="error" numberOfLines={1}>
              {actionLabel}
            </Text>
          </>
        )}
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.xl,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    height: 48,
    paddingHorizontal: Spacing.x5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.errorContainer,
  },
});
