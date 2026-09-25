import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui/pill';
import { Spacing } from '@/constants/theme';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

export type FilterRailProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * A single scrolling row of filter chips.
 *
 * Wrapping chips onto a second row costs about fifty points of vertical space
 * before any book is visible, and the ragged second line reads as an accident.
 * One row that runs off the edge reads as deliberate and says "there is more
 * this way".
 *
 * The negative margin cancels the parent's gutter so chips bleed to the screen
 * edges; the matching content padding keeps the first and last one aligned
 * with everything else.
 */
export function FilterRail<T extends string>({ options, value, onChange }: FilterRailProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rail}
      contentContainerStyle={styles.content}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.count === undefined ? option.label : `${option.label} ${option.count}`}
          selected={option.value === value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginHorizontal: -Spacing.gutter,
  },
  content: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
  },
});
