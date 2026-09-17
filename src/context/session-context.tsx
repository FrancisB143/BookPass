/**
 * Who is signed in.
 *
 * Placeholder authentication: any well-formed email is accepted and the
 * "session" lives in memory only. Replacing this with real auth means changing
 * `signIn`/`signOut` and nothing that consumes them.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { User } from '@/types';

type SessionValue = {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

/** Turns "juan.dela.cruz@uic.edu.ph" into "Juan Dela Cruz". */
function displayNameFromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? email;
  const words = localPart.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) {
    return 'Library Member';
  }
  return words.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(async (email: string) => {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new Error('Enter a valid email address.');
    }

    setUser({
      id: 'current-user',
      name: displayNameFromEmail(trimmed),
      email: trimmed,
      cardNumber: 'BP-2026-0148',
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside a <SessionProvider>.');
  }
  return value;
}
