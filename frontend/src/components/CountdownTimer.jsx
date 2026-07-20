import React, { useEffect, useState } from 'react';

const CAMPAIGN_START = new Date('2026-08-16T07:00:00+01:00').getTime();

function getRemaining() {
  const diff = Math.max(0, CAMPAIGN_START - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  };
}

export default function CountdownTimer() {
  const [t, setT] = useState(getRemaining());

  useEffect(() => {
    const id = setInterval(() => setT(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  if (t.done) {
    return <div className="countdown-live">La campagne est en cours sur le terrain !</div>;
  }

  return (
    <div className="countdown">
      {[
        ['Jours', t.days],
        ['Heures', t.hours],
        ['Min', t.minutes],
        ['Sec', t.seconds],
      ].map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <span className="countdown-value">{String(value).padStart(2, '0')}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
