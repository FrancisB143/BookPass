import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

export type SectionHeaderProps = {
  title: string;
  subtitle: string;
  /** The trailing link, e.g. "See shelf ›". */
  actionLabel: string;
  onAction: () => void;
};

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <Text variant="titleLg" color="onSurface">
          {title}
        </Text>
        <Text variant="caption" color="onSurfaceMuted">
          {subtitle}
        </Text>
      </View>

      <Button
        label={actionLabel}
        variant="ghost"
        size="sm"
        icon="chevron-forward"
        iconPosition="trailing"
        onPress={onAction}
        style={styles.action}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
  },
  action: {
    // Strips the ghost button's own padding so the link lines up with the gutter.
    paddingHorizontal: 0,
  },
});
