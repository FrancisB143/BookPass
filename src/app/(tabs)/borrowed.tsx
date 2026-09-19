import { ScrollView, StyleSheet } from 'react-native';

import { Screen } from '@/components/screen';
import { LoadingState } from '@/components/screen-states';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';

/** Placeholder shell — the designed screen lands in the next wave. */
export default function BorrowedScreen() {
  const { isLoading, stats } = useLibrary();

  if (isLoading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="display" color="onSurface">
          Borrowed
        </Text>
        <Text variant="body" color="onSurfaceMuted">
          {stats.owned} owned · {stats.borrowed} borrowed · {stats.lent} lent · {stats.pending} pending
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.gutter,
    gap: Spacing.xl,
  },
});
