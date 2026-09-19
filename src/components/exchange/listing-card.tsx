import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import {
  CONDITION_DISC,
  CONDITION_LABEL,
  pickupLine,
  seekingLine,
} from '@/components/exchange/exchange-status';
import { Avatar } from '@/components/home/avatar';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { Listing } from '@/types';

const COVER = { width: 88, height: 116 };
const DISC = 30;
const SEEKING_ICON = 22;

export type ListingCardProps = {
  listing: Listing;
  favourite: boolean;
  onToggleFavourite: () => void;
  /** True once the current user has an unanswered request on this copy. */
  requested: boolean;
  busy: boolean;
  onRequest: () => void;
  onChat: () => void;
};

/**
 * One member's book on the marketplace: what it is, who has it, where to pick
 * it up, and what they will trade it for.
 *
 * "Seeking" is the row that decides whether an exchange is worth proposing, so
 * it gets its own strip across the card rather than a line of meta text.
 */
export function ListingCard({
  listing,
  favourite,
  onToggleFavourite,
  requested,
  busy,
  onRequest,
  onChat,
}: ListingCardProps) {
  const { book, copy, owner } = listing;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View
          accessible
          accessibilityLabel={CONDITION_LABEL[copy.condition]}
          style={styles.coverSlot}>
          <BookCover
            title={book.title}
            author={book.author}
            isbn={book.isbn}
            width={COVER.width}
            height={COVER.height}
            radius={Radius.sm}
          />
          <View style={styles.disc}>
            <Text variant="label" color="onSurface">
              {CONDITION_DISC[copy.condition]}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.statusRow}>
            <View style={styles.shrink}>
              <Pill label="Available for Exchange" tone="success" dot />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: favourite }}
              accessibilityLabel={
                favourite ? `Remove ${book.title} from favourites` : `Save ${book.title}`
              }
              hitSlop={Spacing.md}
              onPress={onToggleFavourite}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Ionicons
                name={favourite ? 'heart' : 'heart-outline'}
                size={22}
                color={favourite ? Colors.primary : Colors.onSurfaceVariant}
              />
            </Pressable>
          </View>

          <View style={styles.titleBlock}>
            <Text variant="titleBook" color="onSurface" numberOfLines={2}>
              {book.title}
            </Text>
            <Text variant="body" color="onSurfaceMuted" numberOfLines={1}>
              {`by ${book.author}`}
            </Text>
          </View>

          <View style={styles.ownerRow}>
            <Avatar name={owner.name} uri={owner.avatar} size={32} />
            <View style={styles.ownerCopy}>
              <Text variant="labelLg" color="onSurface" numberOfLines={1}>
                {owner.name}
              </Text>
              <View style={styles.rating}>
                <Text variant="caption" color="onSurfaceVariant">
                  {owner.rating.toFixed(1)}
                </Text>
                <Ionicons name="star" size={12} color={Colors.onSurfaceVariant} />
                <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
                  {`· ${owner.swapCount} swaps`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.pickup}>
            <Ionicons name="storefront-outline" size={14} color={Colors.onPrimaryContainer} />
            <Text variant="label" color="onSurfaceVariant" numberOfLines={1} style={styles.grow}>
              {pickupLine(copy.hub, copy.distanceMi)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.seeking}>
        <View style={styles.seekingIcon}>
          <Ionicons name="repeat" size={12} color={Colors.onPrimaryContainer} />
        </View>
        <Text variant="labelLg" color="onSurfaceVariant" numberOfLines={1} style={styles.grow}>
          {`Seeking: ${seekingLine(copy.seeking)}`}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label={requested ? 'Request Pending' : 'Request Exchange'}
          icon={requested ? 'time-outline' : 'swap-horizontal'}
          onPress={onRequest}
          busy={busy}
          disabled={requested}
          style={styles.grow}
        />
        <Button label="Chat" variant="secondary" icon="chatbubble-outline" onPress={onChat} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.gutter,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.gutter,
  },
  coverSlot: {
    width: COVER.width,
    height: COVER.height,
  },
  // The frame hangs the format disc off the cover's top-left corner.
  disc: {
    position: 'absolute',
    top: -Spacing.md,
    left: -Spacing.md,
    width: DISC,
    height: DISC,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: Spacing.xxs,
    borderColor: Colors.surfaceVariant,
  },
  body: {
    flex: 1,
    gap: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  shrink: {
    flexShrink: 1,
  },
  grow: {
    flex: 1,
  },
  titleBlock: {
    gap: Spacing.xxs,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  ownerCopy: {
    flex: 1,
    gap: Spacing.xxs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pickup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  seeking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  seekingIcon: {
    width: SEEKING_ICON,
    height: SEEKING_ICON,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryContainer,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
});
