import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Avatar } from '@/components/home/avatar';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { RequestDetail } from '@/services/exchange';

const COVER = { width: 56, height: 76 };

export type RequestCardProps = {
  detail: RequestDetail;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onWithdraw: () => void;
};

/**
 * One unanswered request, in either direction.
 *
 * Direction decides everything on the card: an incoming request is a decision
 * to make, an outgoing one is a wait you can call off. The two sets of actions
 * are never on screen at once.
 */
export function RequestCard({ detail, busy, onAccept, onDecline, onWithdraw }: RequestCardProps) {
  const { request, listing, offered, counterparty, outgoing } = detail;
  const swap = request.kind === 'exchange';
  const party = outgoing ? `You asked ${counterparty.name}` : `${counterparty.name} asked you`;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <BookCover
          title={listing.book.title}
          author={listing.book.author}
          isbn={listing.book.isbn}
          width={COVER.width}
          height={COVER.height}
          radius={Radius.xs}
        />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={styles.shrink}>
              <Pill
                label={outgoing ? 'Outgoing' : 'Incoming'}
                tone={outgoing ? 'neutral' : 'accent'}
                dot
              />
            </View>
            <Text variant="caption" color="onSurfaceMuted">
              {swap ? 'Swap' : 'Borrow'}
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <Text variant="titleBook" color="onSurface" numberOfLines={2}>
              {listing.book.title}
            </Text>
            <Text variant="caption" color="onSurfaceMuted" numberOfLines={1}>
              {listing.book.author}
            </Text>
          </View>

          <View style={styles.party}>
            <Avatar name={counterparty.name} uri={counterparty.avatar} size={24} />
            <Text variant="caption" color="onSurfaceVariant" numberOfLines={2} style={styles.grow}>
              {party}
            </Text>
          </View>
        </View>
      </View>

      {swap ? (
        <View style={styles.offer}>
          <Ionicons name="swap-horizontal" size={16} color={Colors.onPrimaryContainer} />
          <Text variant="label" color="onSurfaceVariant" numberOfLines={2} style={styles.grow}>
            {offered
              ? `${outgoing ? 'You offered' : 'Offered in return'}: ${offered.book.title}`
              : 'Nothing offered in return'}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {outgoing ? (
          <Button
            label="Withdraw"
            variant="secondary"
            icon="close-circle-outline"
            onPress={onWithdraw}
            busy={busy}
            style={styles.grow}
          />
        ) : (
          <>
            <Button
              label="Accept"
              icon="checkmark"
              onPress={onAccept}
              busy={busy}
              style={styles.grow}
            />
            <Button
              label="Decline"
              variant="secondary"
              onPress={onDecline}
              disabled={busy}
              style={styles.grow}
            />
          </>
        )}
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
  body: {
    flex: 1,
    gap: Spacing.md,
  },
  topRow: {
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
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
});
