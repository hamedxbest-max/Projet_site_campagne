import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function LogoMarquee({ partners }) {
  const loop = [...partners, ...partners];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {loop.map((partner, i) => (
          <div className="marquee-item" key={`${partner.name}-${i}`}>
            <div className="marquee-logo">
              {partner.logo ? (
                <img src={partner.logo} alt={partner.shortName} loading="lazy" />
              ) : (
                <GraduationCap size={22} strokeWidth={1.8} />
              )}
            </div>
            <span>{partner.shortName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
