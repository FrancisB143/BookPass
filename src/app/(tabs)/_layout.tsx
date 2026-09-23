import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';

/**
 * Two tabs with a raised "add book" FAB between them. The FAB is not a route,
 * so the bar is drawn by hand — see `AppTabBar`.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Library' }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover' }} />
    </Tabs>
  );
}
