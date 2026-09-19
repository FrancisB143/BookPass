import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Colors, Elevation, Radius, Spacing } from '@/constants/theme';

type IconPair = { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap };

const ICONS: Record<string, IconPair> = {
  home: { active: 'book', idle: 'book-outline' },
  'my-books': { active: 'bookmarks', idle: 'bookmarks-outline' },
  exchange: { active: 'swap-horizontal', idle: 'swap-horizontal-outline' },
  borrowed: { active: 'calendar', idle: 'calendar-outline' },
};

const FAB_SIZE = 60;

/**
 * The design puts a raised "add book" FAB in the middle of a four-tab bar.
 * A tab navigator cannot express that, so the bar is drawn by hand: two tabs,
 * the FAB, two tabs. The FAB is not a route — it pushes the create screen.
 */
export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  function renderTab(route: (typeof state.routes)[number], index: number) {
    const focused = state.index === index;
    const { options } = descriptors[route.key];
    const label = typeof options.title === 'string' ? options.title : route.name;
    const icon = ICONS[route.name] ?? { active: 'ellipse', idle: 'ellipse-outline' };
    const tint = focused ? Colors.primary : Colors.onSurface;

    function onPress() {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    }

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        onPress={onPress}
        style={styles.tab}>
        <Ionicons name={focused ? icon.active : icon.idle} size={22} color={tint} />
        <Text variant="micro" style={{ color: tint }} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    );
  }

  const half = Math.ceil(state.routes.length / 2);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
      <View style={styles.side}>{state.routes.slice(0, half).map(renderTab)}</View>

      <View style={styles.fabSlot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a book"
          onPress={() => router.push('/add-book')}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.9 : 1 }]}>
          <Ionicons name="add" size={30} color={Colors.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.side}>
        {state.routes.slice(half).map((route, offset) => renderTab(route, half + offset))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: Spacing.xl,
    backgroundColor: Colors.surfaceBright,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.outline,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fabSlot: {
    width: FAB_SIZE + Spacing.gutter,
    alignItems: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    // Lifts the button above the bar, as in the design.
    marginTop: -(FAB_SIZE / 2) - Spacing.xs,
    ...Elevation.floating,
  },
});
