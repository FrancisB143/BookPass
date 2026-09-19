import { Redirect, router } from 'expo-router';

import { SplashHero } from '@/components/splash/splash-hero';
import { useSession } from '@/context/session-context';

/**
 * Welcome screen and entry gate.
 *
 * The Figma frame ends in a Get Started / Sign In stack, so this is a screen
 * the reader taps through rather than a timed splash — an auto-redirect would
 * make those controls unreachable. Members who are already signed in never see
 * it; they go straight to the dashboard.
 */
export default function Index() {
  const { user } = useSession();

  if (user) {
    return <Redirect href="/home" />;
  }

  return (
    <SplashHero
      onGetStarted={() => router.push('/sign-in?mode=register')}
      onSignIn={() => router.push('/sign-in')}
    />
  );
}
