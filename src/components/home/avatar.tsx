import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Colors, Radius } from '@/constants/theme';

/** "Marcus Lim" becomes "ML" — two letters at most, so it fits the circle. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export type AvatarProps = {
  name: string;
  /** Remote photo. Initials render when a member has none. */
  uri?: string;
  size?: number;
};

/** Circular member portrait, with a typographic fallback like `BookCover`. */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  return (
    <View accessible accessibilityLabel={name} style={[styles.frame, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={180}
        />
      ) : (
        <Text variant={size >= 32 ? 'label' : 'micro'} color="onPrimaryContainer">
          {initialsOf(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryContainer,
  },
});
