import React from 'react';
import { Users, Building2, CalendarDays, Stethoscope } from 'lucide-react';

const STATS = [
  { icon: Users, value: '100+', label: 'Professionnels mobilisés' },
  { icon: Building2, value: '10', label: 'Établissements partenaires' },
  { icon: CalendarDays, value: '7', label: 'Jours de campagne' },
  { icon: Stethoscope, value: '100%', label: 'Consultations gratuites' },
];

export default function StatStrip() {
  return (
    <div className="stat-strip">
      {STATS.map(({ icon: Icon, value, label }) => (
        <div className="stat-chip" key={label}>
          <Icon size={18} strokeWidth={2} />
          <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
