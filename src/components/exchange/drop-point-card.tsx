import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type DropPointCardProps = {
  /** Where the shelf is, e.g. "East Arbor Green Grocers". */
  place: string;
  /** How many books went in today. */
  checkedInToday: number;
  onViewInventory: () => void;
};

/**
 * The leave-a-book, take-a-book shelf at the foot of the marketplace.
 *
 * Presentational — there is no drop-box service — so the card states what the
 * shelf is rather than offering an action it cannot complete.
 */
export function DropPointCard({ place, checkedInToday, onViewInventory }: DropPointCardProps) {
  return (
    <LinearGradient
      colors={[Colors.primaryContainer, Colors.surfaceBright]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.head}>
        <Ionicons name="cafe-outline" size={20} color={Colors.onPrimaryContainer} />
        <Text variant="title" color="onSurface" numberOfLines={1} style={styles.grow}>
          Community Drop Point
        </Text>
        <View style={styles.badge}>
          <Text variant="label" color="onPrimaryContainer">
            Free Box
          </Text>
        </View>
      </View>

      <Text variant="body" color="onSurfaceVariant">
        {`Leave a book, take a book at the ${place} shelf. ${checkedInToday} paperbacks checked in today.`}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View the drop box inventory"
        hitSlop={Spacing.md}
        onPress={onViewInventory}
        style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}>
        <Text variant="labelLg" color="onPrimaryContainer">
          View Drop Box Inventory
        </Text>
        <Ionicons name="arrow-forward" size={16} color={Colors.onPrimaryContainer} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
    padding: Spacing.gutter,
    borderRadius: Radius.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  grow: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
});
