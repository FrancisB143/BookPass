import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';

export type ScreenProps = ViewProps & {
  /**
   * Pad around the notch and home indicator. Needed on screens with no
   * navigation header — a header or the tab bar already reserves that space.
   */
  safe?: boolean;
  /** Screens that sit on white instead of the tinted canvas. */
  surface?: boolean;
};

export function Screen({ safe = false, surface = false, style, ...rest }: ScreenProps) {
  const Container = safe ? SafeAreaView : View;
  const background = surface ? Colors.surface : Colors.background;

  return <Container style={[styles.root, { backgroundColor: background }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
