import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function PartnerLogoGrid({ partners }) {
  return (
    <div className="logo-grid">
      {partners.map((partner) => (
        <div className="logo-frame" key={partner.name} title={partner.name}>
          <div className="logo-frame-img">
            {partner.logo ? (
              <img src={partner.logo} alt={partner.shortName} loading="lazy" />
            ) : (
              <div className="logo-placeholder"><GraduationCap size={28} strokeWidth={1.6} /></div>
            )}
          </div>
          <span>{partner.shortName}</span>
        </div>
      ))}
    </div>
  );
}
