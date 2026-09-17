/**
 * Design tokens for BookPass.
 *
 * Every colour is defined for both light and dark mode so `useTheme()` can hand
 * a screen the right palette without the screen knowing which mode is active.
 * Adding a colour means adding it to BOTH objects — `ThemeColor` is the
 * intersection of their keys, so a one-sided addition is a type error.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#60646C',
    background: '#FFFFFF',
    backgroundElement: '#F4F5F7',
    backgroundSelected: '#E0E1E6',
    border: '#E1E3E8',
    accent: '#2F6F4F',
    accentText: '#FFFFFF',
    danger: '#B3261E',
    warning: '#8A5A00',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#0E1112',
    backgroundElement: '#1C1F21',
    backgroundSelected: '#2E3135',
    border: '#2A2E31',
    accent: '#6FBF95',
    accentText: '#08120D',
    danger: '#F2B8B5',
    warning: '#E7C08B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Spacing steps. Use these instead of raw numbers so rhythm stays consistent. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  small: 6,
  medium: 12,
  large: 20,
  pill: 999,
} as const;

export const MaxContentWidth = 800;
