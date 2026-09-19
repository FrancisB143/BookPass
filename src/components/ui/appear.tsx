import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
  useReducedMotion,
} from 'react-native-reanimated';

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
    <Animated.View
      entering={entering}
      // Rows glide to their new positions when a filter changes rather than
      // snapping, so it stays clear that the list was re-ordered, not replaced.
      layout={reduced ? undefined : LinearTransition.duration(Duration.base)}
      style={style}>
      {children}
    </Animated.View>
  );
}
