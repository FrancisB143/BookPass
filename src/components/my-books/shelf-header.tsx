import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type ShelfView = 'list' | 'grid';

const VIEWS: { value: ShelfView; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { value: 'list', icon: 'reorder-four-outline', label: 'List view' },
  { value: 'grid', icon: 'grid-outline', label: 'Grid view' },
];

export type ShelfHeaderProps = {
  /** Everything on the shelf, not the filtered slice — this is the shelf size. */
  total: number;
  view: ShelfView;
  onViewChange: (view: ShelfView) => void;
};

/** The screen title, the shelf size, and the list/grid switch beside them. */
export function ShelfHeader({ total, view, onViewChange }: ShelfHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text variant="display" color="onSurface">
            My Collection
          </Text>
          <Pill label={String(total)} tone="accent" />
        </View>
        <Text variant="body" color="onSurfaceMuted">
          Cataloged on your local BookPass shelf
        </Text>
      </View>

      <View style={styles.switch}>
        {VIEWS.map((option) => {
          const selected = option.value === view;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => onViewChange(option.value)}
              style={[styles.switchButton, selected ? styles.switchButtonSelected : null]}>
              <Ionicons
                name={option.icon}
                size={20}
                color={selected ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xl,
  },
  copy: {
    flex: 1,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  switch: {
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
  switchButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  switchButtonSelected: {
    backgroundColor: Colors.primaryContainer,
  },
});
