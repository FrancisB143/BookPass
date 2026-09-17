import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { daysUntilDue, isOverdue } from '@/services/loans';
import type { Book, Loan } from '@/types';

export type LoanCardProps = {
  loan: Loan;
  /** `undefined` if the catalogue no longer lists the borrowed book. */
  book: Book | undefined;
  onReturn: () => void;
  returning?: boolean;
};

/** Plain-language due date, plus the colour it should be shown in. */
function describeDueDate(loan: Loan): { text: string; color: ThemeColor } {
  if (loan.returnedAt) {
    return { text: 'Returned', color: 'textSecondary' };
  }

  const days = daysUntilDue(loan);

  if (isOverdue(loan)) {
    const overdueBy = Math.abs(days);
    return {
      text: `Overdue by ${overdueBy} ${overdueBy === 1 ? 'day' : 'days'}`,
      color: 'danger',
    };
  }
  if (days === 0) {
    return { text: 'Due today', color: 'warning' };
  }
  if (days <= 3) {
    return { text: `Due in ${days} ${days === 1 ? 'day' : 'days'}`, color: 'warning' };
  }
  return { text: `Due in ${days} days`, color: 'textSecondary' };
}

export function LoanCard({ loan, book, onReturn, returning = false }: LoanCardProps) {
  const theme = useTheme();
  const due = describeDueDate(loan);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <View style={styles.row}>
        <View style={[styles.cover, { backgroundColor: theme.background }]}>
          <ThemedText style={styles.coverGlyph}>{book?.cover ?? '📕'}</ThemedText>
        </View>

        <View style={styles.details}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {book?.title ?? 'Unknown title'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
            {book?.author ?? 'Unknown author'}
          </ThemedText>
          <ThemedText type="small" themeColor={due.color}>
            {due.text}
          </ThemedText>
        </View>
      </View>

      <Button label="Return" variant="secondary" onPress={onReturn} busy={returning} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cover: {
    width: 56,
    height: 72,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverGlyph: {
    fontSize: 28,
    lineHeight: 34,
  },
  details: {
    flex: 1,
    gap: Spacing.half,
  },
});
