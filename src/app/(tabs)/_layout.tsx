import { Tabs } from 'expo-router';

import { AppTabBar } from '@/components/app-tab-bar';

/**
 * Four tabs with a raised "add book" FAB between them. The FAB is not a route,
 * so the bar is drawn by hand — see `AppTabBar`.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="my-books" options={{ title: 'My Books' }} />
      <Tabs.Screen name="exchange" options={{ title: 'Exchange' }} />
      <Tabs.Screen name="borrowed" options={{ title: 'Borrowed' }} />
    </Tabs>
  );
}
