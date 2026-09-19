import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Checkbox, PillLink, TextLink } from '@/components/auth/auth-controls';
import { DividerLabel, IconCircle, SsoRow } from '@/components/auth/auth-rows';
import { LogoMark } from '@/components/auth/logo-mark';
import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { Field, Segmented } from '@/components/ui/field';
import { Pill } from '@/components/ui/pill';
import { Card, IconTile } from '@/components/ui/surface';
import { Overline, Text } from '@/components/ui/text';
import { Colors, Spacing } from '@/constants/theme';
import { useSession } from '@/context/session-context';

type Mode = 'sign-in' | 'register';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The identity providers are presentational until a real backend lands. */
function noop() {}

/**
 * Sign in and register, one screen: the segmented toggle swaps the form rather
 * than the route, so the furniture above and below it never reflows.
 *
 * Authentication is still the placeholder in `session-context` — any
 * well-formed email is accepted.
 */
export default function SignInScreen() {
  const { signIn } = useSession();
  // The welcome screen's "Get Started" arrives with ?mode=register.
  const { mode: requestedMode } = useLocalSearchParams<{ mode?: string }>();

  const [mode, setMode] = useState<Mode>(
    requestedMode === 'register' ? 'register' : 'sign-in'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const registering = mode === 'register';
  const mismatch = registering && confirm.length > 0 && confirm !== password;

  function handleMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit() {
    if (mismatch) {
      return;
    }

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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <LogoMark />
            <View style={styles.eyebrow}>
              <Pill label="NEIGHBORHOOD LITERARY COMMONS" tone="accent" dot />
            </View>
            <Text variant="display" color="onSurface" style={styles.centred}>
              {registering ? 'Join the commons' : 'Welcome back, Reader'}
            </Text>
            <Text variant="body" color="onSurfaceMuted" style={styles.centred}>
              {registering
                ? 'Create an account to open your shelf to the neighborhood book exchange.'
                : 'Sign in to access your personal shelf and communal book exchange network.'}
            </Text>
          </View>

          <Segmented<Mode>
            value={mode}
            onChange={handleMode}
            options={[
              { value: 'sign-in', label: 'Sign In', icon: 'log-in-outline' },
              { value: 'register', label: 'Create Account', icon: 'person-add-outline' },
            ]}
          />

          <Card style={styles.form}>
            {registering ? (
              <Field
                label="Full Name"
                hint="How neighbors see you"
                icon="person-outline"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Alexa Read"
                value={name}
                valid={name.trim().length > 2}
              />
            ) : null}

            <Field
              label="Email Address"
              hint="Uni or Personal"
              icon="mail-outline"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="alexa.read@university.edu"
              value={email}
              valid={EMAIL.test(email.trim())}
            />

            <Field
              label="Password"
              icon="lock-closed-outline"
              autoCapitalize="none"
              autoComplete={registering ? 'new-password' : 'current-password'}
              error={error ?? undefined}
              onChangeText={setPassword}
              placeholder="Your password"
              secure
              value={password}
            />

            {registering ? (
              <Field
                label="Confirm Password"
                icon="lock-closed-outline"
                autoCapitalize="none"
                autoComplete="new-password"
                error={mismatch ? 'Both passwords need to match.' : undefined}
                onChangeText={setConfirm}
                placeholder="Repeat your password"
                secure
                value={confirm}
              />
            ) : null}

            <View style={styles.formOptions}>
              <Checkbox
                label="Keep me signed in"
                checked={keepSignedIn}
                onChange={setKeepSignedIn}
              />
              <TextLink label="Forgot password?" onPress={noop} />
            </View>

            <Button
              label={registering ? 'Create My Account' : 'Sign In to BookPass'}
              icon="book-outline"
              size="lg"
              onPress={handleSubmit}
              busy={busy}
              block
            />
          </Card>

          <DividerLabel label="Or continue with" />

          <View style={styles.providers}>
            <SsoRow
              label="Campus Student / Faculty ID"
              tile={<IconTile name="school" tone="success" size={40} />}
              badge="Fast Track"
              onPress={noop}
            />

            <View style={styles.providerPair}>
              <SsoRow
                label="Google Account"
                icon="logo-google"
                iconColor="onPrimaryContainer"
                style={styles.grow}
                onPress={noop}
              />
              <SsoRow
                label="Apple ID"
                icon="logo-apple"
                iconColor="onSurface"
                style={styles.grow}
                onPress={noop}
              />
            </View>
          </View>

          <Card tone="flat" style={styles.guest}>
            <View style={styles.guestCopy}>
              <IconCircle name="compass-outline" />
              <View style={styles.guestText}>
                <Text variant="title" color="onSurface">
                  Curious about shelves?
                </Text>
                <Text variant="body" color="onSurfaceMuted">
                  Explore 1,420+ books nearby right now
                </Text>
              </View>
            </View>
            <View style={styles.guestAction}>
              <PillLink label="Guest Pass" onPress={noop} />
            </View>
          </Card>

          <Card style={styles.pulse}>
            <View style={styles.pulseHead}>
              <Overline>Community Pulse</Overline>
              <View style={styles.pulseStatus}>
                <View style={styles.statusDot} />
                <Text variant="label" color="success">
                  38 Swaps Today
                </Text>
              </View>
            </View>

            <Text variant="quote" color="onSurface">
              &ldquo;Books are a uniquely portable magic.&rdquo;
            </Text>

            <View style={styles.pulseFoot}>
              <Text variant="caption" color="onSurfaceMuted">
                — Stephen King
              </Text>
              <View style={styles.pulseSource}>
                <Ionicons name="library-outline" size={14} color={Colors.primary} />
                <Text variant="label" color="onSurfaceVariant" numberOfLines={1}>
                  BookPass Little Free Shelves #104
                </Text>
              </View>
            </View>
          </Card>

          <Text variant="caption" color="onSurfaceMuted" style={styles.centred}>
            By continuing, you agree to BookPass&rsquo;s{' '}
            <Text variant="caption" color="onSurfaceVariant" style={styles.legalLink} onPress={noop}>
              Lending Trust Code
            </Text>
            ,{' '}
            <Text variant="caption" color="onSurfaceVariant" style={styles.legalLink} onPress={noop}>
              Community Guidelines
            </Text>
            , and{' '}
            <Text variant="caption" color="onSurfaceVariant" style={styles.legalLink} onPress={noop}>
              Privacy Policy
            </Text>
            .
          </Text>
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
    gap: Spacing.x6,
    paddingHorizontal: Spacing.x5,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.x8,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  eyebrow: {
    alignItems: 'center',
  },
  centred: {
    textAlign: 'center',
  },
  form: {
    padding: Spacing.x5,
    gap: Spacing.x5,
  },
  formOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  providers: {
    gap: Spacing.lg,
  },
  providerPair: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  grow: {
    flex: 1,
  },
  guest: {
    gap: Spacing.xl,
  },
  guestCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  guestText: {
    flex: 1,
    gap: Spacing.xxs,
  },
  guestAction: {
    alignItems: 'flex-end',
  },
  pulse: {
    gap: Spacing.xl,
  },
  pulseHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xl,
  },
  pulseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.success,
  },
  pulseFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.lg,
  },
  pulseSource: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexShrink: 1,
  },
  legalLink: {
    textDecorationLine: 'underline',
  },
});
