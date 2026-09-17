import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useLibrary } from '@/context/library-context';
import { useSession } from '@/context/session-context';
import { useTheme } from '@/hooks/use-theme';
import { BORROW_LIMIT, isActive, isOverdue } from '@/services/loans';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, signOut } = useSession();
  const { loans } = useLibrary();

  const active = loans.filter(isActive);
  const overdue = active.filter((loan) => isOverdue(loan));

  function handleSignOut() {
    signOut();
    router.replace('/sign-in');
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <ThemedText type="subtitle" style={{ color: theme.accentText }}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </ThemedText>
          </View>
          <ThemedText type="smallBold">{user?.name ?? 'Not signed in'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {user?.email ?? '—'}
          </ThemedText>
        </View>

        <View
          style={[
            styles.card,
            styles.stretch,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <Row label="Library card" value={user?.cardNumber ?? '—'} />
          <Row label="Books out" value={`${active.length} of ${BORROW_LIMIT}`} />
          <Row label="Overdue" value={overdue.length === 0 ? 'None' : String(overdue.length)} />
        </View>

        <Button label="Sign out" variant="secondary" onPress={handleSignOut} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.one,
    padding: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stretch: {
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
});
