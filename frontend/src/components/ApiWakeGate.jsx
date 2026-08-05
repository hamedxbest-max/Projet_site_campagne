import React from 'react';
import { useApiWakeUp } from '../hooks/useApiWakeUp.js';

export default function ApiWakeGate({ children }) {
  const { ready, waking, attempt, retry } = useApiWakeUp();

  if (ready && !waking) {
    return children;
  }

  return (
    <div className="server-wake-screen" role="status" aria-live="polite">
      <div className="server-wake-card">
        <div className="server-wake-spinner" aria-hidden="true" />
        <h1 className="server-wake-title">Connexion au serveur en cours…</h1>
        <p className="server-wake-text">
          Le service se réveille (plan gratuit Render). Cela peut prendre jusqu&apos;à
          une minute lors de la première visite.
        </p>
        {attempt > 1 && (
          <p className="server-wake-attempt">Tentative {attempt}…</p>
        )}
        <button type="button" className="btn btn-outline server-wake-retry" onClick={retry}>
          Réessayer
        </button>
      </div>
    </div>
  );
}
