import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, View } from 'react-native';

import { Colors, NON_INTERACTIVE, Radius } from '@/constants/theme';

/**
 * The ambient layer behind the splash: three honeycomb watermarks bleeding off
 * the edges and two soft colour washes.
 *
 * The Figma layer is vector line art, but the project has no `react-native-svg`
 * dependency, so the hexagons come from the Material Community icon font —
 * same silhouette, no new dependency, and it scales without raster artefacts.
 *
 * Everything here is decorative: the layer takes no touches and is hidden from
 * screen readers.
 */

/** Watermark sizes, measured off the 390pt frame. */
const CLUSTER = {
  top: { outer: 320, inner: 224, core: 144 },
  left: { outer: 288, inner: 160 },
  bottom: { outer: 256, inner: 176 },
} as const;

const GLOW = { warm: 320, cool: 240 } as const;

/** Frame offsets. Each cluster is anchored to the edge it bleeds off. */
const OFFSET = {
  topEdge: -64,
  topRight: -64,
  leftEdge: -80,
  leftTop: 241,
  bottomEdge: 40,
  bottomRight: -48,
  warmTop: 181,
  coolTop: 303,
  coolRight: 32,
} as const;

function Hexagon({
  size,
  opacity,
  color,
  filled = false,
}: {
  size: number;
  opacity: number;
  color: string;
  filled?: boolean;
}) {
  return (
    <MaterialCommunityIcons
      name={filled ? 'hexagon' : 'hexagon-outline'}
      size={size}
      color={color}
      style={[styles.hexagon, { opacity }]}
    />
  );
}

export function SplashBackdrop() {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.layer, NON_INTERACTIVE]}>
      <View
        style={[
          styles.glow,
          styles.warmGlow,
          { width: GLOW.warm, height: GLOW.warm, top: OFFSET.warmTop },
        ]}
      />
      <View
        style={[
          styles.glow,
          styles.coolGlow,
          { width: GLOW.cool, height: GLOW.cool, top: OFFSET.coolTop, right: OFFSET.coolRight },
        ]}
      />

      <View
        style={[
          styles.cluster,
          {
            width: CLUSTER.top.outer,
            height: CLUSTER.top.outer,
            top: OFFSET.topEdge,
            right: OFFSET.topRight,
          },
        ]}>
        <Hexagon size={CLUSTER.top.outer} opacity={0.4} color={Colors.primaryContainer} />
        <Hexagon size={CLUSTER.top.inner} opacity={0.3} color={Colors.primaryContainer} />
        <Hexagon size={CLUSTER.top.core} opacity={0.08} color={Colors.primaryContainer} filled />
      </View>

      <View
        style={[
          styles.cluster,
          {
            width: CLUSTER.left.outer,
            height: CLUSTER.left.outer,
            top: OFFSET.leftTop,
            left: OFFSET.leftEdge,
          },
        ]}>
        <Hexagon size={CLUSTER.left.outer} opacity={0.16} color={Colors.onSurfaceMuted} />
        <Hexagon size={CLUSTER.left.inner} opacity={0.14} color={Colors.onSurfaceMuted} />
      </View>

      <View
        style={[
          styles.cluster,
          {
            width: CLUSTER.bottom.outer,
            height: CLUSTER.bottom.outer,
            bottom: OFFSET.bottomEdge,
            right: OFFSET.bottomRight,
          },
        ]}>
        <Hexagon size={CLUSTER.bottom.outer} opacity={0.35} color={Colors.primaryContainer} />
        <Hexagon size={CLUSTER.bottom.inner} opacity={0.25} color={Colors.primaryContainer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: Radius.pill,
  },
  warmGlow: {
    backgroundColor: Colors.primaryContainer,
    opacity: 0.25,
  },
  coolGlow: {
    backgroundColor: Colors.successContainer,
    opacity: 0.2,
  },
  cluster: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagon: {
    position: 'absolute',
  },
});
