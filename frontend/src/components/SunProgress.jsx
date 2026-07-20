import React from 'react';

const ORG_NAME = "Association des Étudiants Ressortissants de l'Est de la FMSP";
const FMSP_DEFINITION = 'FMSP — Faculté de Médecine et des Sciences Pharmaceutiques';

/**
 * En-tête fixe ASSERES : nom de l'association + logo officiel + progression.
 */
export default function SunProgress({ step, total }) {
  return (
    <>
      <div className="progress-rail" style={{ width: `${(step / total) * 100}%` }} />
      <header className="asseres-header" aria-label="ASSERES — en-tête">
        <div className="asseres-header-inner">
          <p className="asseres-org-name">{ORG_NAME}</p>
          <p className="asseres-fmsp-def">{FMSP_DEFINITION}</p>
          <div className="asseres-logo-wrap">
            <img
              src="/images/asseres-logo.png"
              alt="Logo ASSERES"
              className="asseres-logo"
            />
          </div>
          <p className="asseres-subtitle">ASSERES · Doumaintang · BOUAN&apos;O DOUMAINTANG</p>
        </div>
        <div className="sun-progress-label">ÉTAPE {step}/{total}</div>
      </header>
    </>
  );
}
