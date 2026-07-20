import React from 'react';
import { CAMPAIGN_PARTNERS } from '../data/campaignPartners.js';

export default function PartnerOrganizationsGrid() {
  return (
    <div className="partners-org-grid">
      {CAMPAIGN_PARTNERS.map((partner) => (
        <div className="partners-org-card" key={partner.shortName} title={partner.name}>
          <div className="partners-org-logo">
            <img src={partner.logo} alt={partner.name} loading="lazy" />
          </div>
          <span>{partner.shortName}</span>
        </div>
      ))}
    </div>
  );
}
