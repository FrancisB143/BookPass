import { Text as RNText, type TextProps } from 'react-native';

import { Colors, Typography, type ThemeColor, type TypographyVariant } from '@/constants/theme';

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: ThemeColor;
};

/**
 * Every piece of text in the app goes through here, so the type scale stays in
 * `Typography` and no screen hand-rolls a font size.
 *
 * Weight comes from `fontFamily`, never `fontWeight` — Android ignores
 * synthetic weights on custom fonts and silently renders regular instead.
 */
export function Text({
  variant = 'body',
  color = 'onSurfaceVariant',
  style,
  ...rest
}: AppTextProps) {
  return <RNText style={[Typography[variant], { color: Colors[color] }, style]} {...rest} />;
}

/** Small-caps eyebrow, e.g. "ACTIVE PROPOSAL". Uppercases its own content. */
export function Overline({ children, color = 'onSurfaceMuted', ...rest }: AppTextProps) {
  return (
    <Text variant="overline" color={color} {...rest}>
      {typeof children === 'string' ? children.toUpperCase() : children}
    </Text>
  );
}
