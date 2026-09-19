import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/book-cover';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/surface';
import { Text } from '@/components/ui/text';
import { Colors, Radius, Spacing } from '@/constants/theme';

/** Roughly the 3:4 slot the frame reserves for the cover. */
const COVER_WIDTH = 132;
const COVER_HEIGHT = 178;

export type MetadataCardProps = {
  title: string;
  author: string;
  /** Drives the Open Library lookup — the preview updates as it is typed. */
  isbn?: string;
  onScan: () => void;
};

/**
 * The cataloguing card: a live preview of the cover the entry will carry, and
 * the barcode affordance from the frame.
 *
 * The preview is the honest half of the frame's "snap or upload cover" slot —
 * there is no image picker, but an ISBN really does resolve artwork, and
 * `BookCover` falls back typographically when it does not.
 */
export function MetadataCard({ title, author, isbn, onScan }: MetadataCardProps) {
  const hasIsbn = Boolean(isbn?.trim());

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={[Colors.surfaceBright, Colors.surfaceSubtle] as const}
        style={styles.stage}>
        <BookCover
          title={title.trim() || 'Your next entry'}
          author={author.trim() || 'Author pending'}
          isbn={isbn?.trim() || undefined}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
          radius={Radius.sm}
        />
      </LinearGradient>

      <View style={styles.copy}>
        <Pill label={hasIsbn ? 'Live Cover' : 'Cover Preview'} tone="success" dot />

        <Text variant="title" color="onSurface">
          Effortless Cataloging
        </Text>

        <Text variant="body" color="onSurfaceMuted">
          {hasIsbn
            ? 'Cover art is pulled from the ISBN. No match on file? The typographic cover stands in everywhere the book appears.'
            : 'Add an ISBN below and the real cover loads here. Without one, the typographic cover stands in.'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan ISBN barcode"
        accessibilityHint="Camera scanning is not available in this build"
        onPress={onScan}
        style={({ pressed }) => [styles.scan, { opacity: pressed ? 0.85 : 1 }]}>
        <Ionicons name="barcode-outline" size={20} color={Colors.onPrimaryContainer} />
        <Text variant="labelLg" color="onPrimaryContainer">
          Scan ISBN Barcode
        </Text>
      </Pressable>

      <Text variant="caption" color="onSurfaceMuted" style={styles.note}>
        Scanning waits on the camera build — type the ISBN by hand for now.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.gutter,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.x6,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  copy: {
    gap: Spacing.md,
  },
  scan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    minHeight: 52,
    paddingHorizontal: Spacing.x5,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryContainer,
  },
  note: {
    textAlign: 'center',
  },
});
