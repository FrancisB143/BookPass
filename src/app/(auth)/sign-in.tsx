import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Field, Segmented } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Card, IconTile } from '@/components/ui/surface';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useSession } from '@/context/session-context';

type Mode = 'sign-in' | 'register';

/** Placeholder sign-in — any well-formed email is accepted. */
export default function SignInScreen() {
  const { signIn } = useSession();

  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      await signIn(email);
      router.replace('/home');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen safe>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <IconTile name="book" tone="primary" size={76} />
            <Pill label="Neighbourhood Literary Commons" tone="accent" />
            <Text variant="display" color="onSurface" style={styles.centred}>
              Welcome back, Reader
            </Text>
            <Text variant="body" color="onSurfaceMuted" style={styles.centred}>
              Sign in to reach your shelf and the community book exchange.
            </Text>
          </View>

          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            options={[
              { value: 'sign-in', label: 'Sign In', icon: 'log-in-outline' },
              { value: 'register', label: 'Create Account', icon: 'person-add-outline' },
            ]}
          />

          <Card style={styles.form}>
            <Field
              label="Email Address"
              hint="Uni or Personal"
              icon="mail-outline"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@uic.edu.ph"
              value={email}
              valid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
            />
            <Field
              label="Password"
              icon="lock-closed-outline"
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Your password"
              secure
              value={password}
              error={error ?? undefined}
            />
            <Button
              label={mode === 'sign-in' ? 'Sign In to BookPass' : 'Create Account'}
              icon="book-outline"
              onPress={handleSubmit}
              busy={busy}
              block
            />
            <Text variant="caption" color="onSurfaceMuted" style={styles.centred}>
              Demo sign-in — any valid email address works.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.x6,
    padding: Spacing.x5,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  centred: {
    textAlign: 'center',
  },
  form: {
    gap: Spacing.x5,
  },
});
