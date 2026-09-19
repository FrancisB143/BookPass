import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PRESS_SCALE, SPRING_PRESS, SPRING_RELEASE } from '@/constants/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks while held. */
  scaleTo?: number;
  /** Dim while held, on top of the scale. */
  dimTo?: number;
};

/**
 * A Pressable that shrinks slightly under the finger.
 *
 * The scale runs on Reanimated's UI thread, so it keeps responding while the
 * JS thread is busy fetching — which is exactly when a tap most needs to feel
 * acknowledged.
 *
 * Press feedback is *not* skipped under Reduce Motion: it is a direct response
 * to touch rather than the kind of travel that causes motion sickness, and
 * removing it would make the app feel broken to the people who asked for less
 * motion, not calmer.
 */
export function PressableScale({
  style,
  scaleTo = PRESS_SCALE,
  dimTo = 0.9,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const pressed = useSharedValue(0);
  const reduced = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => {
    const target = 1 - pressed.value * (1 - scaleTo);
    return {
      // Under Reduce Motion the size holds still and only the dim conveys the press.
      transform: reduced ? [] : [{ scale: target }],
      opacity: 1 - pressed.value * (1 - dimTo),
    };
  });

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event) => {
        pressed.value = withSpring(1, SPRING_PRESS);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(0, SPRING_RELEASE);
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}
      {...rest}
    />
  );
}
