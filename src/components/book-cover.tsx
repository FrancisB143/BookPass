import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { OPEN_LIBRARY_COVERS_URL } from '@/config';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type BookCoverProps = {
  title: string;
  author: string;
  /** Without an ISBN — or when Open Library has no image — the fallback renders. */
  isbn?: string | null;
  /** An explicit image URL wins over the ISBN lookup. */
  coverUrl?: string | null;
  width?: number;
  height?: number;
  radius?: number;
};

/**
 * `default=false` makes Open Library 404 on a missing cover instead of serving
 * a blank placeholder, which is what lets `onError` detect the miss.
 */
function coverUrl(isbn: string, width: number): string {
  const size = width > 120 ? 'L' : 'M';
  return `${OPEN_LIBRARY_COVERS_URL}/${encodeURIComponent(isbn)}-${size}.jpg?default=false`;
}

/** Stable per-title tint, so a book keeps the same fallback colour everywhere. */
const TINTS = [
  Colors.primaryContainer,
  Colors.successContainer,
  Colors.surfaceDim,
  Colors.surfaceSubtle,
] as const;

function tintFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = (hash * 31 + title.charCodeAt(i)) % 997;
  }
  return TINTS[hash % TINTS.length];
}

export function BookCover({
  title,
  author,
  isbn,
  coverUrl: explicitUrl,
  width = 56,
  height = 72,
  radius = Radius.xs,
}: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const source = explicitUrl ?? (isbn ? coverUrl(isbn, width) : null);
  const showImage = source !== null && !failed;

  return (
    <View
      accessible
      accessibilityLabel={`Cover of ${title} by ${author}`}
      style={[
        styles.frame,
        { width, height, borderRadius: radius, backgroundColor: tintFor(title) },
      ]}>
      {showImage ? (
        <Image
          source={{ uri: source as string }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={180}
          onError={() => setFailed(true)}
        />
      ) : (
        <View style={styles.fallback}>
          <Text variant="label" color="onSurface" numberOfLines={3}>
            {title}
          </Text>
          <Text variant="micro" color="onSurfaceMuted" numberOfLines={1}>
            {author}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
  },
  fallback: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: Spacing.xxs,
    padding: Spacing.md,
  },
});
