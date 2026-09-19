import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';

/**
 * The launch mark: a white tile holding the orange hexagon-and-book icon, with
 * a warm halo behind it and the two floating stat badges from the frame.
 *
 * The Figma icon is a flattened bitmap, so the mark is recomposed from the
 * hexagon outline and an open book — the same two shapes the export is made of.
 */

const SIZE = {
  card: 144,
  halo: 16,
  mark: 124,
  hexagon: 84,
  book: 40,
  badge: 20,
  badgeIcon: 11,
  /** How far each badge overhangs the tile, per the frame. */
  overhangX: 12,
  overhangY: 8,
} as const;

export function BrandEmblem() {
  return (
    <View style={styles.root}>
      <View style={styles.halo} />

      <View style={styles.card}>
        {/* Labelled here rather than on the root so the two badges stay
            readable as their own nodes. */}
        <View accessible accessibilityRole="image" accessibilityLabel="BookPass" style={styles.mark}>
          <MaterialCommunityIcons
            name="hexagon-outline"
            size={SIZE.hexagon}
            color={Colors.primaryContainer}
            style={styles.hexagon}
          />
          <Ionicons name="book" size={SIZE.book} color={Colors.primaryContainer} />
        </View>
      </View>

      <View style={[styles.badge, styles.badgeTop]}>
        <Ionicons name="leaf" size={SIZE.badgeIcon} color={Colors.success} />
        <Text variant="overline" color="onSurface">
          12k+ lent
        </Text>
      </View>

      <View style={[styles.badge, styles.badgeBottom]}>
        <MaterialCommunityIcons
          name="bookshelf"
          size={SIZE.badgeIcon}
          color={Colors.onPrimaryContainer}
        />
        <Text variant="overline" color="onSurface">
          Library 4B
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: SIZE.card,
    height: SIZE.card,
  },
  halo: {
    position: 'absolute',
    top: -SIZE.halo,
    left: -SIZE.halo,
    right: -SIZE.halo,
    bottom: -SIZE.halo,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    opacity: 0.16,
  },
  card: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    ...Elevation.card,
  },
  mark: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  hexagon: {
    position: 'absolute',
    opacity: 0.55,
  },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    height: SIZE.badge,
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    ...Elevation.card,
  },
  badgeTop: {
    top: -SIZE.overhangY,
    right: -SIZE.overhangX,
  },
  badgeBottom: {
    bottom: -SIZE.overhangY,
    left: -SIZE.overhangX,
  },
});
