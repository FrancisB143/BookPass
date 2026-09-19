import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { Field } from '@/components/ui/field';
import { Colors, Spacing } from '@/constants/theme';

const FILTER_ICON = 20;

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

/**
 * `Field` owns the pill, the leading glyph and the type ramp; the filter mark
 * is laid over its trailing edge, which is where the frame puts it.
 */
export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View>
      <Field
        icon="search-outline"
        placeholder="Title, ISBN, author, or neighbour…"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      <View style={styles.filter} pointerEvents="none">
        <Ionicons
          accessibilityLabel="Filters"
          name="options-outline"
          size={FILTER_ICON}
          color={Colors.onSurfaceVariant}
        />
      </View>
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
});
