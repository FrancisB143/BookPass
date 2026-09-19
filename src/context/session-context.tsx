/**
 * Who is signed in.
 *
 * Placeholder authentication: any well-formed email signs you in as the seeded
 * member. Replacing this with real auth means changing `signIn`/`signOut` and
 * nothing that consumes them.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { CURRENT_USER_ID, USERS } from '@/data/seed';
import type { User } from '@/types';

type SessionValue = {
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

const SEEDED_USER = USERS.find((user) => user.id === CURRENT_USER_ID) ?? USERS[0];

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(async (email: string) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('Enter a valid email address.');
    }
    setUser(SEEDED_USER);
  }, []);

  const signOut = useCallback(() => setUser(null), []);

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
