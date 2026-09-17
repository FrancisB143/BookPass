/**
 * Runs an async task and reports loading / success / error as one value.
 *
 * The task must be stable — wrap it in `useCallback` at the call site, or the
 * effect will re-run on every render.
 */

import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };

const LOADING: AsyncState<never> = { status: 'loading', data: null, error: null };

export function useAsync<T>(task: () => Promise<T>): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState(LOADING);

    task()
      .then((data) => {
        if (!cancelled) {
          setState({ status: 'success', data, error: null });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setState({
            status: 'error',
            data: null,
            error: cause instanceof Error ? cause.message : 'Something went wrong.',
          });
        }
      });

    // Prevents a slow response from overwriting a newer one.
    return () => {
      cancelled = true;
    };
  }, [task, attempt]);

  const reload = useCallback(() => setAttempt((previous) => previous + 1), []);

  return { ...state, reload };
}
