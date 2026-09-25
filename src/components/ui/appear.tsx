import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';

import { Duration, ENTER_RISE, staggerDelay } from '@/constants/motion';

export type AppearProps = {
  children: ReactNode;
  /** Position in a list. Drives the stagger; omit for a standalone element. */
  index?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Fades a row in and lifts it into place, staggered by its position.
 *
 * Under Reduce Motion the rise is dropped and the row simply fades, which
 * removes the vestibular trigger without making content appear abruptly.
 * Wrapping list rows in this rather than animating inside each card keeps the
 * cards themselves ignorant of how they arrived.
 */
export function Appear({ children, index = 0, style }: AppearProps) {
  const reduced = useReducedMotion();

  const entering = reduced
    ? FadeIn.duration(Duration.base)
    : FadeInDown.duration(Duration.base).delay(staggerDelay(index)).withInitialValues({
        transform: [{ translateY: ENTER_RISE }],
      });

  return (
    // Deliberately no `layout` animation.
    //
    // Reanimated positions a view absolutely while a layout transition runs.
    // Inside a FlatList that makes the cell measure as near-zero height, so the
    // list underestimates its content, puts ListFooterComponent far too high,
    // and the rows then render over it.
    //
    // `entering` is safe by contrast: it only touches opacity and transform,
    // neither of which affects layout. Animating reorder inside a virtualised
    // list needs `itemLayoutAnimation` on Animated.FlatList instead.
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}
