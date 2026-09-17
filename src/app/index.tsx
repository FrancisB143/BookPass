import { Redirect } from 'expo-router';

import { useSession } from '@/context/session-context';

/**
 * Entry gate. Sends signed-in members to the catalogue and everyone else to
 * sign-in. Keeping this decision in one route means no other screen has to
 * check whether a user exists.
 */
export default function Index() {
  const { user } = useSession();

  return <Redirect href={user ? '/browse' : '/sign-in'} />;
}
