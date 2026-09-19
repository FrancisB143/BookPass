/**
 * Motion tokens.
 *
 * The design is editorial and calm, so motion here is meant to be felt rather
 * than noticed: short durations, no overshoot on anything large, and travel
 * measured in a few pixels. Anything longer than `slow` reads as lag.
 *
 * Every value lives here so a screen cannot invent its own timing, the same way
 * it cannot invent its own colour.
 */

import { Easing } from 'react-native-reanimated';

export const Duration = {
  /** Press feedback and colour cross-fades. */
  fast: 140,
  /** The default for anything entering or leaving. */
  base: 200,
  /** Larger surfaces — sheets, screen-level fades. */
  slow: 280,
} as const;

/** Decelerating: quick to start, settling at the end. Right for entrances. */
export const EASE_OUT = Easing.bezier(0.22, 1, 0.36, 1);

/** Symmetric, for things that move between two states. */
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/**
 * Press springs, tuned to settle without wobble — `damping` high enough that
 * the button does not bounce back past its resting size.
 */
export const SPRING_PRESS = { damping: 22, stiffness: 420, mass: 0.6 } as const;
export const SPRING_RELEASE = { damping: 18, stiffness: 320, mass: 0.7 } as const;

/** How far a row travels as it fades in. Small on purpose. */
export const ENTER_RISE = 12;

/**
 * Per-item delay in a staggered list.
 *
 * Capped by `STAGGER_LIMIT` items: beyond that the last row would wait long
 * enough to look broken, so everything after it enters together.
 */
export const STAGGER_STEP = 40;
export const STAGGER_LIMIT = 8;

export function staggerDelay(index: number): number {
  return Math.min(index, STAGGER_LIMIT) * STAGGER_STEP;
}

/** How much a tappable shrinks while held. */
export const PRESS_SCALE = 0.97;
