import React, { useCallback } from 'react';
import { GraduationCap, CheckCircle2, Clock } from 'lucide-react';
import { getRegisteredStudents, LIVE_POLL_MS } from '../api/client.js';
import { useLivePoll } from '../hooks/useLivePoll.js';
import LiveIndicator from './LiveIndicator.jsx';

export default function RegisteredStudentsList({ compact = false }) {
  const fetchStudents = useCallback(() => getRegisteredStudents(), []);
  const { data: students, lastUpdated, loading } = useLivePoll(fetchStudents, LIVE_POLL_MS);
  const list = students || [];

  if (loading && list.length === 0) {
    return <p className="students-loading">Chargement des inscrits…</p>;
  }

  if (list.length === 0) {
    return (
      <div className="students-empty">
        <GraduationCap size={28} strokeWidth={1.6} />
        <p>Soyez le premier étudiant inscrit à BOUANE Ô DOUMAINTANG !</p>
        <LiveIndicator lastUpdated={lastUpdated} online={Boolean(lastUpdated)} />
      </div>
    );
  }

  return (
    <div className={`students-panel ${compact ? 'compact' : ''}`}>
      <div className="students-panel-head">
        <GraduationCap size={18} strokeWidth={2} />
        <span>{list.length} étudiant{list.length > 1 ? 's' : ''} inscrit{list.length > 1 ? 's' : ''}</span>
        <LiveIndicator lastUpdated={lastUpdated} online={Boolean(lastUpdated)} />
      </div>
      <ul className="students-list">
        {list.map((s) => (
          <li key={s.id} className="student-row">
            <div className="student-avatar">
              {(s.display_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="student-info">
              <strong>{s.display_name}</strong>
              <span>{s.ecole}</span>
              {s.niveau_label && <span className="student-level">{s.niveau_label}{s.filiere ? ` · ${s.filiere}` : ''}</span>}
            </div>
            <div className={`student-badge ${s.payment_status === 'SUCCESSFUL' ? 'confirmed' : 'pending'}`}>
              {s.payment_status === 'SUCCESSFUL'
                ? <><CheckCircle2 size={13} /> Inscrit</>
                : <><Clock size={13} /> {s.status_label}</>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
