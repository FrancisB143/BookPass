import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Screen } from '@/components/screen';
import { BrandEmblem } from '@/components/splash/brand-emblem';
import { SplashBackdrop } from '@/components/splash/splash-backdrop';
import { Button } from '@/components/ui/button';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Elevation, Radius, Spacing, type ThemeColor } from '@/constants/theme';

/**
 * The launch composition. Presentation only — `src/app/index.tsx` owns where the
 * two calls to action lead, so this file never touches navigation.
 *
 * The Figma frame ends in a Get Started / Sign In stack, so this is a welcome
 * screen the reader taps through rather than a timed splash. The wordmark is
 * rewritten to BookPass per the copy map.
 */

const SIZE = {
  globe: 40,
  globeIcon: 16,
  chipDot: 8,
  avatar: 28,
  avatarRing: 2,
  avatarIcon: 14,
} as const;

/** Entrance: the mark settles in rather than snapping on. */
const ENTRANCE_MS = 420;
const ENTRANCE_RISE = 12;

const TAGLINE = 'ORGANIZE • READ • SHARE';
const QUOTE = '“Books are the bees that carry pollen from one mind to another.”';
const ATTRIBUTION = '— James Russell Lowell';
const VERSION = 'V2.4 • Campus & Community Edition';

const AVATARS: { background: string; foreground: ThemeColor }[] = [
  { background: Colors.primaryContainer, foreground: 'onPrimaryContainer' },
  { background: Colors.successContainer, foreground: 'onSuccessContainer' },
  { background: Colors.surfaceVariant, foreground: 'onSurfaceMuted' },
];

export type SplashHeroProps = {
  /** Opens sign-in with the register tab selected. */
  onGetStarted: () => void;
  onSignIn: () => void;
};

export function SplashHero({ onGetStarted, onSignIn }: SplashHeroProps) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(entrance, {
      toValue: 1,
      duration: ENTRANCE_MS,
      easing: Easing.out(Easing.cubic),
      // react-native-web has no native animated module.
      useNativeDriver: Platform.OS !== 'web',
    });

    animation.start();
    return () => animation.stop();
  }, [entrance]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [ENTRANCE_RISE, 0],
  });

  return (
    // The backdrop sits outside the safe area on purpose: absolutely positioned
    // children are laid out against their parent's padding box, so nesting it
    // inside the SafeAreaView would stop the watermarks bleeding under the
    // status bar and leave a flat band across the top.
    <Screen style={styles.screen}>
      <SplashBackdrop />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.canvas, { opacity: entrance, transform: [{ translateY }] }]}>
          <View style={styles.topBar}>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Overline color="onSurfaceVariant">Neighborhood exchange</Overline>
            </View>
            <View style={styles.globe}>
              <Ionicons
                name="globe-outline"
                size={SIZE.globeIcon}
                color={Colors.onSurfaceVariant}
              />
            </View>
          </View>

          <View style={styles.stage}>
            <BrandEmblem />

            <View style={styles.wordmark}>
              <Text variant="display" color="onSurface">
                Book
              </Text>
              <Text variant="display" color="primary">
                Pass
              </Text>
            </View>

            <Text variant="labelLg" color="onSurfaceVariant" style={styles.tagline}>
              {TAGLINE}
            </Text>

            <View style={styles.quote}>
              <Text variant="caption" color="onSurfaceVariant" style={styles.centred}>
                {QUOTE}
              </Text>
              <Overline color="onSurfaceMuted" style={styles.centred}>
                {ATTRIBUTION}
              </Overline>
            </View>

            <View style={styles.readers}>
              <View style={styles.avatarStack}>
                {AVATARS.map((avatar, index) => (
                  <View
                    key={avatar.background}
                    style={[
                      styles.avatar,
                      { backgroundColor: avatar.background },
                      index > 0 && styles.avatarOverlap,
                    ]}>
                    <Ionicons
                      name="person"
                      size={SIZE.avatarIcon}
                      color={Colors[avatar.foreground]}
                    />
                  </View>
                ))}
              </View>
              <Text variant="caption" color="onSurfaceVariant">
                84 neighbors reading nearby
              </Text>
            </View>
          </View>

          <View style={styles.bottom}>
            <View style={styles.strip}>
              <Stat value="100%" label="Open lending" color="onSurface" />
              <Stat value="Zero" label="Late fines" color="onPrimaryContainer" raised />
              <Stat value="Local" label="Shelf drop" color="success" />
            </View>

            <Button
              label="Get Started"
              icon="arrow-forward"
              iconPosition="trailing"
              size="lg"
              onPress={onGetStarted}
              block
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Already have an account? Sign in"
              onPress={onSignIn}
              style={({ pressed }) => [styles.signInRow, { opacity: pressed ? 0.85 : 1 }]}>
              <Text variant="labelLg" color="onSurface">
                Already have an account?{' '}
                <Text variant="labelLg" color="onPrimaryContainer">
                  Sign In
                </Text>
              </Text>
            </Pressable>

            <Overline color="onSurfaceMuted">{VERSION}</Overline>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Screen>
  );
}

function Stat({
  value,
  label,
  color,
  raised = false,
}: {
  value: string;
  label: string;
  color: ThemeColor;
  /** The middle cell lifts onto a white pill, as in the frame. */
  raised?: boolean;
}) {
  return (
    <View style={[styles.stat, raised && styles.statRaised]}>
      <Text variant="title" color={color}>
        {value}
      </Text>
      <Overline color="onSurfaceVariant">{label}</Overline>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.surfaceBright,
  },
  safe: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    paddingHorizontal: Spacing.x5,
    paddingVertical: Spacing.x6,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
  },
  chipDot: {
    width: SIZE.chipDot,
    height: SIZE.chipDot,
    borderRadius: Radius.pill,
    backgroundColor: Colors.success,
  },
  globe: {
    width: SIZE.globe,
    height: SIZE.globe,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
  },

  /**
   * Flexes so the mark stays optically centred between the chip and the metric
   * strip on any screen height, instead of pinning to the 804pt frame.
   */
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.x6,
  },
  wordmark: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.x6,
  },
  tagline: {
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  quote: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.x6,
    marginHorizontal: Spacing.gutter,
    paddingHorizontal: Spacing.gutter,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    ...Elevation.card,
  },
  centred: {
    textAlign: 'center',
  },
  readers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.gutter,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: SIZE.avatar,
    height: SIZE.avatar,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: SIZE.avatarRing,
    borderColor: Colors.surface,
  },
  avatarOverlap: {
    marginLeft: -Spacing.md,
  },

  signInRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceVariant,
  },
  bottom: {
    alignItems: 'center',
    gap: Spacing.gutter,
  },
  strip: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.background,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xxs,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  statRaised: {
    backgroundColor: Colors.surface,
    ...Elevation.card,
  },
});
