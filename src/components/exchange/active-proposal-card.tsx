import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { shortName } from '@/components/exchange/exchange-status';
import { Pill } from '@/components/ui/pill';
import { IconTile } from '@/components/ui/surface';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { RequestDetail } from '@/services/exchange';

const CHEVRON = 32;

export type ActiveProposalCardProps = {
  /** The current user's own outgoing swap, still awaiting an answer. */
  detail: RequestDetail;
  onPress: () => void;
};

/**
 * The banner above the feed: the swap you are already waiting on.
 *
 * The frame fills it with a soft wash rather than a flat tint, so it is a
 * gradient between two surface tokens instead of a stack of tinted views.
 */
export function ActiveProposalCard({ detail, onPress }: ActiveProposalCardProps) {
  const { listing, counterparty } = detail;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Active proposal: ${listing.book.title}, pending with ${counterparty.name}. Opens your exchange requests.`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <LinearGradient
        colors={[Colors.surfaceBright, Colors.surfaceVariant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <IconTile name="swap-horizontal" tone="accent" size={48} />

        <View style={styles.copy}>
          <View style={styles.head}>
            <Overline color="onPrimaryContainer">Active proposal</Overline>
            <View style={styles.shrink}>
              <Pill label={`Pending ${shortName(counterparty.name)}`} tone="success" />
            </View>
          </View>

          <Text variant="titleBook" color="onSurface" numberOfLines={2}>
            {listing.book.title}
          </Text>
        </View>

        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={18} color={Colors.onSurfaceVariant} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
    padding: Spacing.gutter,
    borderRadius: Radius.lg,
  },
  copy: {
    flex: 1,
    gap: Spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  shrink: {
    flexShrink: 1,
  },
  chevron: {
    width: CHEVRON,
    height: CHEVRON,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
  },
});
