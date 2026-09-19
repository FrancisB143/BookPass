/**
 * The three states a data-backed screen shows before it shows content.
 *
 * They live together because they are one decision — "this screen has nothing
 * to render yet, and here is why" — and keeping them side by side is what stops
 * them drifting apart visually.
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import type Ionicons from '@expo/vector-icons/Ionicons';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.centred}>
      <ActivityIndicator color={Colors.primary} />
      <Text variant="caption" color="onSurfaceMuted">
        {label}
      </Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.centred}>
      <IconTile name="alert-circle-outline" tone="neutral" size={56} />
      <Text variant="labelLg" color="error" style={styles.centredText}>
        {message}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon = 'book-outline', title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.centred}>
      <IconTile name={icon} tone="accent" size={64} />
      <Text variant="title" color="onSurface" style={styles.centredText}>
        {title}
      </Text>
      <Text variant="body" color="onSurfaceMuted" style={styles.centredText}>
        {message}
      </Text>
      {action ? <Button label={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    padding: Spacing.x6,
  },
  centredText: {
    textAlign: 'center',
  },
});
