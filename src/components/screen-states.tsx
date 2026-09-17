/**
 * The three states a data-backed screen shows before it shows content.
 *
 * They live together because they are one decision — "this screen has nothing
 * to render yet, and here is why" — and keeping them side by side is what stops
 * them drifting apart visually.
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const theme = useTheme();

  return (
    <View style={styles.centred}>
      <ActivityIndicator color={theme.accent} />
      <ThemedText type="small" themeColor="textSecondary" style={styles.spaced}>
        {label}
      </ThemedText>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.centred}>
      <ThemedText style={styles.glyph}>⚠️</ThemedText>
      <ThemedText type="smallBold" themeColor="danger" style={styles.centredText}>
        {message}
      </ThemedText>
      {onRetry ? (
        <Button label="Try again" variant="secondary" onPress={onRetry} style={styles.action} />
      ) : null}
    </View>
  );
}

export function EmptyState({
  glyph = '📚',
  title,
  message,
}: {
  glyph?: string;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.centred}>
      <ThemedText style={styles.glyph}>{glyph}</ThemedText>
      <ThemedText type="smallBold" style={styles.centredText}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.centredText}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  centredText: {
    textAlign: 'center',
  },
  glyph: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: Spacing.two,
  },
  spaced: {
    marginTop: Spacing.two,
  },
  action: {
    marginTop: Spacing.three,
    alignSelf: 'stretch',
    maxWidth: 240,
  },
});
