import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = ViewProps & {
  /**
   * Pad around the notch and home indicator. Needed only on screens with no
   * navigation header — a header or tab bar already reserves that space.
   */
  safe?: boolean;
};

export function Screen({ safe = false, style, ...rest }: ScreenProps) {
  const theme = useTheme();
  const Container = safe ? SafeAreaView : View;

  return <Container style={[styles.root, { backgroundColor: theme.background }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
