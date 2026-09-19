import type Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { Card, IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

/** Matches the frame: two cards fit, the third peeks to advertise the scroll. */
const CARD_WIDTH = 168;

export type StatCard = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'accent' | 'success';
  value: number;
  label: string;
  /** Status badge in the card's top-right, e.g. "1 due soon". */
  badge?: { label: string; tone: 'accent' | 'error' };
};

export function StatRail({ cards }: { cards: StatCard[] }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}>
      {cards.map((card) => (
        <Card key={card.key} style={styles.card}>
          <View style={styles.top}>
            <IconTile name={card.icon} tone={card.tone} />
            {card.badge ? <Pill label={card.badge.label} tone={card.badge.tone} /> : null}
          </View>

          <Text variant="display" color="onSurface">
            {String(card.value)}
          </Text>
          <Text variant="body" color="onSurfaceVariant" numberOfLines={1}>
            {card.label}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: Spacing.xl,
    paddingHorizontal: Spacing.gutter,
  },
  card: {
    width: CARD_WIDTH,
    gap: Spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
});
