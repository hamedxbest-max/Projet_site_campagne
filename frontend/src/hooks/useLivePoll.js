import { useCallback, useEffect, useRef, useState } from 'react';

/** Rafraîchit des données API automatiquement (sync live). */
export function useLivePoll(fetchFn, intervalMs = 10000, enabled = true) {
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);
  const fetchRef = useRef(fetchFn);
  fetchRef.current = fetchFn;

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await fetchRef.current();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh(false);
    const id = setInterval(() => refresh(true), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, refresh]);

  return { data, lastUpdated, loading, error, refresh };
}
