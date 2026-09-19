/**
 * Design tokens, taken from the Figma file rather than eyeballed.
 *
 * The palette follows Material 3 colour roles — the design's error pair
 * (#BA1A1A / #FFDAD6) is M3's default, so the rest is named to match.
 *
 * The app is light-only: the design specifies no dark mode, and app.json pins
 * `userInterfaceStyle` to light so a phone in dark mode cannot half-apply one.
 * If dark is ever added, this file is the only place that has to grow.
 */

import '@/global.css';

export const Colors = {
  /** Brand orange — FAB, primary buttons, active tab. */
  primary: '#D97736',
  onPrimary: '#FFFFFF',
  /** Peach — icon tiles, the Swap Match bar, eyebrow pills. */
  primaryContainer: '#FFDBC9',
  onPrimaryContainer: '#994703',
  /** Deeper browns for text sitting on peach. */
  primaryDark: '#753400',
  primaryDarkest: '#321200',

  /** Green — "On Shelf", "Available for Exchange", verified states. */
  success: '#306949',
  successAlt: '#356E4D',
  onSuccess: '#FFFFFF',
  successContainer: '#B1EDC5',
  onSuccessContainer: '#155133',

  /** Muted rose — "Lent Out", soft warnings. */
  warning: '#8F4955',

  error: '#BA1A1A',
  onError: '#FFFFFF',
  errorContainer: '#FFDAD6',

  /** App canvas — a cool lavender-grey. */
  background: '#F1F3FC',
  /** Cards. */
  surface: '#FFFFFF',
  /** Inputs, inactive segment tracks, chips. */
  surfaceVariant: '#EBEEF6',
  surfaceDim: '#E5E8F0',
  surfaceBright: '#F8F9FF',
  surfaceSubtle: '#EEF1F9',

  outline: '#DFE2EB',

  /** Headings — near-black. */
  onSurface: '#181C22',
  /** Body — deliberately warm brown against the cool surfaces. */
  onSurfaceVariant: '#554339',
  /** Meta and captions. */
  onSurfaceMuted: '#887367',

  /** The black "All" chip and other inverted pills. */
  inverseSurface: '#181C22',
  onInverseSurface: '#FFFFFF',

  scrim: 'rgba(0, 0, 0, 0.6)',
} as const;

export type ThemeColor = keyof typeof Colors;

/**
 * Font families, keyed by the postscript names registered in the root layout.
 * Newsreader is the editorial serif; Plus Jakarta Sans carries the interface.
 */
export const Fonts = {
  serif: 'Newsreader_600SemiBold',
  serifMedium: 'Newsreader_500Medium',
  serifItalic: 'Newsreader_600SemiBold_Italic',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
} as const;

/**
 * The type scale as measured in Figma. `weight` is carried by `fontFamily`,
 * never by `fontWeight` — custom fonts on Android ignore synthetic weights and
 * silently fall back to regular.
 */
export const Typography = {
  /** "What are we reading today?" */
  display: { fontFamily: Fonts.serif, fontSize: 28, lineHeight: 36, letterSpacing: -0.7 },
  /** Section and screen titles. */
  titleLg: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  title: { fontFamily: Fonts.serif, fontSize: 18, lineHeight: 24 },
  /** Book titles in lists. */
  titleBook: { fontFamily: Fonts.serifMedium, fontSize: 18, lineHeight: 23 },
  quote: { fontFamily: Fonts.serifItalic, fontSize: 18, lineHeight: 24 },

  /** Buttons and emphasised rows. */
  labelLg: { fontFamily: Fonts.sansSemiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  body: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 18 },
  label: { fontFamily: Fonts.sansSemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  caption: { fontFamily: Fonts.sans, fontSize: 12, lineHeight: 16 },
  /** Small-caps eyebrows: "ACTIVE PROPOSAL", "COMMUNITY PULSE". */
  overline: { fontFamily: Fonts.sansBold, fontSize: 10, lineHeight: 12, letterSpacing: 0.4 },
  overlineSoft: { fontFamily: Fonts.sansSemiBold, fontSize: 10, lineHeight: 12, letterSpacing: 0.4 },
  micro: { fontFamily: Fonts.sansMedium, fontSize: 10, lineHeight: 12, letterSpacing: 0.4 },
} as const;

export type TypographyVariant = keyof typeof Typography;

/** 2px-based scale. Figma's dominant padding is 16. */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
  /** Default screen and card padding. */
  gutter: 16,
  x5: 20,
  x6: 24,
  x8: 32,
} as const;

export const Radius = {
  xs: 6,
  sm: 12,
  md: 16,
  lg: 24,
  /** Pills dominate the design — 231 nodes use a full round. */
  pill: 9999,
} as const;

/** Cards sit on a tinted canvas with a soft, low-contrast lift. */
export const Elevation = {
  card: {
    shadowColor: '#1B1F3B',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#7A3B12',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
} as const;

/** Frames are drawn at 390pt wide. */
export const DesignWidth = 390;
