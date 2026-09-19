import { StyleSheet, View } from 'react-native';

import { Card, IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

/** One level per five completed swaps, so a new member starts at Level 1. */
const SWAPS_PER_LEVEL = 5;

export type TrustScoreCardProps = {
  /** Community rating out of 5. */
  rating: number;
  /** Completed swaps — the social proof behind the level. */
  swapCount: number;
};

/** The standing footer of the catalog: what the community makes of you. */
export function TrustScoreCard({ rating, swapCount }: TrustScoreCardProps) {
  const level = Math.floor(swapCount / SWAPS_PER_LEVEL) + 1;

  return (
    <Card tone="accent" style={styles.card}>
      <IconTile name="ribbon-outline" tone="primary" size={44} />

      <View style={styles.copy}>
        <Text variant="title" color="onSurface">
          Community Trust Score
        </Text>
        <Text variant="caption" color="onSurfaceVariant">
          {rating.toFixed(1)} average rating · {swapCount} completed swaps
        </Text>
      </View>

      <Text variant="labelLg" color="success">
        Level {level}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  copy: {
    flex: 1,
    gap: Spacing.xxs,
  },
});
