import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SHELF_FILTERS, type ShelfFilter } from '@/components/my-books/shelf-status';
import { Field } from '@/components/ui/field';
import { Chip } from '@/components/ui/pill';
import { Colors, Radius, Spacing } from '@/constants/theme';

export type ShelfToolbarProps = {
  query: string;
  onQueryChange: (query: string) => void;
  /**
   * Bumped by the app bar's search action. It remounts the field with
   * `autoFocus`, which is the only way to hand it focus — `Field` owns its
   * `TextInput` and forwards no ref.
   */
  focusToken: number;
  filter: ShelfFilter;
  onFilterChange: (filter: ShelfFilter) => void;
  /** How many copies sit in each bucket, so the chips can carry their counts. */
  counts: Record<ShelfFilter, number>;
  /** True while anything other than the default sort is applied. */
  sorted: boolean;
  onSort: () => void;
};

/** Search, the sort affordance, and the status chips that narrow the catalog. */
export function ShelfToolbar({
  query,
  onQueryChange,
  focusToken,
  filter,
  onFilterChange,
  counts,
  sorted,
  onSort,
}: ShelfToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Field
            key={focusToken}
            autoFocus={focusToken > 0}
            icon="search"
            placeholder="Search by title, author, genre…"
            value={query}
            onChangeText={onQueryChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            accessibilityLabel="Search your shelf"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sort your shelf"
          onPress={onSort}
          style={({ pressed }) => [styles.sort, { opacity: pressed ? 0.85 : 1 }]}>
          <Ionicons name="options-outline" size={22} color={Colors.onSurfaceVariant} />
          {sorted ? <View style={styles.sortBadge} /> : null}
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={styles.chipRowContent}>
        {SHELF_FILTERS.map((option) => (
          <Chip
            key={option.value}
            label={`${option.label} (${counts[option.value]})`}
            selected={option.value === filter}
            onPress={() => onFilterChange(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    gap: Spacing.gutter,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  search: {
    flex: 1,
  },
  sort: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  sortBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: Spacing.md,
    height: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  // The chips run past both screen edges, so the row undoes the list gutter.
  chipRow: {
    marginHorizontal: -Spacing.gutter,
  },
  chipRowContent: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.gutter,
  },
});
