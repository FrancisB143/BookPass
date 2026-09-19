import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Listing } from '@/types';

/** Cover proportions, as drawn in the frame. */
const COVER_RATIO = 1.16;
const META_ICON = 14;

export type NearbyCardProps = {
  listing: Listing;
  /** Column width, measured by the screen so the grid stays two-up. */
  width: number;
  busy?: boolean;
  onRequest: () => void;
};

/** One member's book in the "Available Near You" grid. */
export function NearbyCard({ listing, width, busy = false, onRequest }: NearbyCardProps) {
  const { book, copy } = listing;

  return (
    <Card padded={false} style={{ width }}>
      <View style={styles.coverFrame}>
        <BookCover
          title={book.title}
          author={book.author}
          isbn={book.isbn}
          width={width}
          height={Math.round(width * COVER_RATIO)}
          radius={0}
        />
      </View>

      <View style={styles.body}>
        <Text variant="titleBook" color="onSurface" numberOfLines={1}>
          {book.title}
        </Text>
        <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
          {book.author}
        </Text>

        <View style={styles.meta}>
          <Ionicons name="location-outline" size={META_ICON} color={Colors.success} />
          <Text variant="label" color="success">
            {`${copy.distanceMi.toFixed(1)} mi`}
          </Text>
          <Text variant="label" color="onSurface" numberOfLines={1} style={styles.hub}>
            {copy.hub}
          </Text>
        </View>

        <Button
          label="Request Borrow"
          icon="mail-outline"
          size="sm"
          onPress={onRequest}
          busy={busy}
          block
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // The cover is clipped here rather than on the card: a view that both casts
  // a shadow and hides its overflow loses the shadow on iOS.
  coverFrame: {
    overflow: 'hidden',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
  },
  body: {
    gap: Spacing.xs,
    padding: Spacing.xl,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  hub: {
    flex: 1,
    textAlign: 'right',
  },
});
