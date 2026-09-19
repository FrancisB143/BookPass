import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, IconTile } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

export type EventCardProps = {
  title: string;
  detail: string;
};

/**
 * The community notice at the foot of the dashboard. RSVP is presentational in
 * the design — there is no events service behind it yet.
 */
export function EventCard({ title, detail }: EventCardProps) {
  return (
    <Card tone="flat" style={styles.card}>
      <IconTile name="people" tone="primary" size={48} />

      <View style={styles.copy}>
        <Text variant="labelLg" color="onSurface">
          {title}
        </Text>
        <Text variant="caption" color="onSurfaceMuted">
          {detail}
        </Text>
      </View>

      <Button label="RSVP" variant="secondary" size="sm" onPress={() => {}} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  copy: {
    flex: 1,
    gap: Spacing.xs,
  },
});
