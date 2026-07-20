export default function LiveIndicator({ lastUpdated, online = true }) {
  if (!lastUpdated) return null;
  const time = lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return (
    <span className={`live-indicator ${online ? 'online' : 'offline'}`} title={`Dernière sync : ${time}`}>
      <span className="live-dot" aria-hidden="true" />
      {online ? 'En direct' : 'Hors ligne'} · {time}
    </span>
  );
}
