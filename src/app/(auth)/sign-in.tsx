import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session-context';
import { useTheme } from '@/hooks/use-theme';

/**
 * Placeholder sign-in. Any well-formed email works and the password is ignored
 * — the point is that the navigation shape is right when real auth lands.
 */
export default function SignInScreen() {
  const theme = useTheme();
  const { signIn } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signIn(email);
      router.replace('/browse');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
  ];

  return (
    <Screen safe>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}>
        <View style={styles.content}>
          <ThemedText style={styles.logo}>📚</ThemedText>
          <ThemedText type="subtitle">BookPass</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
            Borrow from the library, carry your pass.
          </ThemedText>

          <View style={styles.form}>
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@uic.edu.ph"
              placeholderTextColor={theme.textSecondary}
              style={inputStyle}
              value={email}
            />
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={inputStyle}
              value={password}
            />

            {error ? (
              <ThemedText type="small" themeColor="danger">
                {error}
              </ThemedText>
            ) : null}

            <Button label="Sign in" onPress={handleSignIn} busy={busy} />

            <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
              Demo sign-in — any valid email address is accepted.
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  logo: {
    fontSize: 48,
    lineHeight: 56,
  },
  tagline: {
    marginTop: Spacing.one,
  },
  form: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
  },
  note: {
    textAlign: 'center',
  },
});
