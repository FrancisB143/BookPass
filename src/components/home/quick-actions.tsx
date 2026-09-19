import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { Spacing } from '@/constants/theme';

export type QuickActionsProps = {
  onScan: () => void;
  onSwap: () => void;
};

/** The peach bar: a white secondary action beside the orange primary one. */
export function QuickActions({ onScan, onSwap }: QuickActionsProps) {
  return (
    <Card tone="accent" radius="pill" padded={false} style={styles.bar}>
      <Button
        label="Scan ISBN"
        icon="qr-code-outline"
        variant="secondary"
        onPress={onScan}
        style={styles.action}
      />
      <Button
        label="Swap Match"
        icon="swap-horizontal"
        onPress={onSwap}
        style={styles.action}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  action: {
    flex: 1,
  },
});
