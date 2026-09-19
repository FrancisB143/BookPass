import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Field } from '@/components/ui/field';
import { Colors, Radius, Spacing } from '@/constants/theme';

const FILTER_ICON = 20;

export type ExchangeSearchProps = {
  value: string;
  onChangeText: (value: string) => void;
  /**
   * Bumped by the app bar's search action. It remounts the field with
   * `autoFocus`, which is the only way to hand it focus — `Field` owns its
   * `TextInput` and forwards no ref.
   */
  focusToken: number;
  /** Draws the dot on the glyph while the feed is narrowed. */
  filtered: boolean;
  onFilter: () => void;
};

/**
 * `Field` owns the pill, the leading glyph and the type ramp; the filter mark
 * is laid over its trailing edge, which is where the frame puts it. Unlike the
 * dashboard's, this one is live — it opens the same three filters the chips do.
 */
export function ExchangeSearch({
  value,
  onChangeText,
  focusToken,
  filtered,
  onFilter,
}: ExchangeSearchProps) {
  return (
    <View>
      <Field
        key={focusToken}
        autoFocus={focusToken > 0}
        icon="search"
        placeholder="Search title, author, or book wishlist…"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Search the exchange"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Filter the exchange"
        hitSlop={Spacing.md}
        onPress={onFilter}
        style={({ pressed }) => [styles.filter, { opacity: pressed ? 0.6 : 1 }]}>
        <Ionicons name="options-outline" size={FILTER_ICON} color={Colors.onSurfaceVariant} />
        {filtered ? <View style={styles.dot} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  filter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: Spacing.gutter,
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: Spacing.gutter,
    right: -Spacing.xxs,
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
});
