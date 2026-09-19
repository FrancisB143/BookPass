import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

const MARK = 80;
const INNER = 46;
const BADGE = 26;

/**
 * The brand mark: an orange disc carrying an open book, with a green
 * "verified shelf" badge clipped to its top-right corner.
 *
 * Hand-rolled rather than built from `<IconTile>` because the disc layers a
 * softened square behind the glyph, which a single tile cannot express.
 */
export function LogoMark() {
  return (
    <View style={styles.root}>
      <View style={styles.disc}>
        <View style={styles.inner} />
        <Ionicons name="book" size={32} color={Colors.onPrimary} />
      </View>

      <View style={styles.badge}>
        <Ionicons name="library" size={13} color={Colors.onPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: MARK,
    height: MARK,
  },
  disc: {
    width: MARK,
    height: MARK,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  inner: {
    position: 'absolute',
    width: INNER,
    height: INNER,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryDark,
    opacity: 0.18,
  },
  badge: {
    position: 'absolute',
    top: -Spacing.xs,
    right: -Spacing.xs,
    width: BADGE,
    height: BADGE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Spacing.xxs,
    borderColor: Colors.background,
    backgroundColor: Colors.success,
  },
});
