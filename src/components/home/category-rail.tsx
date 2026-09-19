import { ScrollView, StyleSheet } from 'react-native';

import { Chip } from '@/components/ui/pill';
import { Spacing } from '@/constants/theme';

export type CategoryRailProps = {
  genres: string[];
  /** `null` is the "All" chip. */
  selected: string | null;
  onSelect: (genre: string | null) => void;
};

export function CategoryRail({ genres, selected, onSelect }: CategoryRailProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.rail}>
      <Chip label="All" selected={selected === null} onPress={() => onSelect(null)} />
      {genres.map((genre) => (
        <Chip
          key={genre}
          label={genre}
          selected={selected === genre}
          onPress={() => onSelect(genre)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.gutter,
  },
});
