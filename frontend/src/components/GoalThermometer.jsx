import React, { useCallback } from 'react';
import { HeartPulse } from 'lucide-react';
import { getCampaignStats, LIVE_POLL_MS } from '../api/client.js';
import { useLivePoll } from '../hooks/useLivePoll.js';
import LiveIndicator from './LiveIndicator.jsx';

export default function GoalThermometer() {
  const fetchStats = useCallback(() => getCampaignStats(), []);
  const { data: stats, lastUpdated } = useLivePoll(fetchStats, LIVE_POLL_MS);

  if (!stats) return null;

  const pct = Math.min(100, Math.round((stats.total_collected / stats.goal) * 100));

  return (
    <div className="thermometer">
      <div className="thermometer-head">
        <span className="thermometer-label"><HeartPulse size={15} strokeWidth={2.2} /> Collecté à ce jour</span>
        <span className="thermometer-pct">{pct}%</span>
      </div>
      <div className="thermometer-track">
        <div className="thermometer-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="thermometer-figures">
        <span>{stats.total_collected.toLocaleString('fr-FR')} FCFA</span>
        <span>Objectif : {stats.goal.toLocaleString('fr-FR')} FCFA</span>
      </div>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
        <LiveIndicator lastUpdated={lastUpdated} online={Boolean(lastUpdated)} />
      </div>
    </div>
  );
}
