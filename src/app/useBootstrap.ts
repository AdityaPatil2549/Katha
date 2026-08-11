import { useEffect, useState } from 'react';
import { bootstrapApp } from '@/app/bootstrap';

export function useBootstrap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await bootstrapApp();
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e as Error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error };
}
