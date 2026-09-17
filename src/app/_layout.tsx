import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { LibraryProvider } from '@/context/library-context';
import { SessionProvider } from '@/context/session-context';

/**
 * Root layout: providers wrap every route.
 *
 * Headers are off by default — the tab screens draw their own, and
 * `book/[id]` opts back in via its own <Stack.Screen>.
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <LibraryProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </LibraryProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
