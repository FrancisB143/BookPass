import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

const ROW_HEIGHT = 44;

export type LocationFilterProps = {
  /** The pickup area the marketplace is scoped to. */
  label: string;
  onPress: () => void;
  onMap: () => void;
};

/**
 * The pickup-area row above the search field.
 *
 * Presentational: there is no geo service behind the app, so the area is fixed
 * and both affordances explain themselves rather than pretending to filter.
 */
export function LocationFilter({ label, onPress, onMap }: LocationFilterProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Pickup area: ${label}`}
        onPress={onPress}
        style={({ pressed }) => [styles.area, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="location" size={16} color={Colors.primary} />
        <Text variant="labelLg" color="onSurface" numberOfLines={1} style={styles.areaLabel}>
          {label}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.onSurfaceVariant} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open the map of nearby pickup points"
        onPress={onMap}
        style={({ pressed }) => [styles.map, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="map-outline" size={20} color={Colors.onSurface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  area: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: ROW_HEIGHT,
    paddingHorizontal: Spacing.gutter,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  areaLabel: {
    flex: 1,
  },
  map: {
    width: ROW_HEIGHT,
    height: ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
  },
});
