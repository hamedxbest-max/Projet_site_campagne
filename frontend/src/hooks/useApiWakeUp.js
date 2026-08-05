import { useCallback, useEffect, useState } from 'react';
import { checkApiHealth } from '../api/client.js';

const WAKE_ATTEMPTS = 15;
const WAKE_RETRY_MS = 5000;
const HEALTH_TIMEOUT_MS = 90000;

function isLocalApi() {
  const raw = import.meta.env.VITE_API_BASE_URL || '';
  return !raw || /localhost|127\.0\.0\.1/i.test(raw);
}

/** Ping /api/health/ on load to wake a cold Render instance before forms run. */
export function useApiWakeUp() {
  const skipWake = import.meta.env.DEV || isLocalApi();
  const [ready, setReady] = useState(skipWake);
  const [waking, setWaking] = useState(!skipWake);
  const [attempt, setAttempt] = useState(0);

  const wake = useCallback(async () => {
    if (skipWake) {
      setReady(true);
      setWaking(false);
      return;
    }

    setWaking(true);
    setReady(false);

    for (let i = 1; i <= WAKE_ATTEMPTS; i += 1) {
      setAttempt(i);
      try {
        await checkApiHealth({ timeoutMs: HEALTH_TIMEOUT_MS });
        setReady(true);
        setWaking(false);
        return;
      } catch {
        if (i < WAKE_ATTEMPTS) {
          await new Promise((resolve) => {
            setTimeout(resolve, WAKE_RETRY_MS);
          });
        }
      }
    }

    setReady(true);
    setWaking(false);
  }, [skipWake]);

  useEffect(() => {
    wake();
  }, [wake]);

  return { ready, waking, attempt, retry: wake };
}
