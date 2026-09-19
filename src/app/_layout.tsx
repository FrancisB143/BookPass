// Imported per weight, not from the package root: the root index re-exports
// every weight and italic, which drags ~1.4MB of unused TTFs into the bundle.
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { Newsreader_600SemiBold_Italic } from '@expo-google-fonts/newsreader/600SemiBold_Italic';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { LibraryProvider } from '@/context/library-context';
import { SessionProvider } from '@/context/session-context';

SplashScreen.preventAutoHideAsync();

/**
 * Root layout: loads the two brand fonts, then mounts the app.
 *
 * The splash screen is held until fonts resolve, otherwise the first frame
 * renders in the system font and visibly reflows. A font *error* also releases
 * it — a missing font should degrade to the system face, not hang on a splash
 * screen forever.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Newsreader_500Medium,
    Newsreader_600SemiBold,
    Newsreader_600SemiBold_Italic,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <SessionProvider>
      <LibraryProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        />
        <StatusBar style="dark" />
      </LibraryProvider>
    </SessionProvider>
  );
}
