import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Search, RefreshCw, Download, LogOut, Users, GraduationCap,
  HeartHandshake, Wallet, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import {
  api,
  getContributions,
  validateContributionPayment,
  rejectContributionPayment,
  getCampaignStats,
  LIVE_POLL_MS,
} from '../api/client.js';
import LiveIndicator from '../components/LiveIndicator.jsx';
import './admin.css';

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'SUCCESSFUL', label: 'Payés' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'etudiant', label: 'Étudiants' },
  { id: 'donateur', label: 'Donateurs' },
];

function formatAmount(n) {
  return `${(n || 0).toLocaleString('fr-FR')} FCFA`;
}

function displayName(row) {
  if (row.display_name) return row.display_name;
  return row.prenom ? `${row.prenom} ${row.nom}` : row.nom;
}

function StatusBadge({ status }) {
  if (status === 'SUCCESSFUL') {
    return <span className="admin-badge success"><CheckCircle2 size={12} /> Payé</span>;
  }
  if (status === 'PENDING') {
    return <span className="admin-badge pending"><Clock size={12} /> En attente</span>;
  }
  if (status === 'FAILED') {
    return <span className="admin-badge failed"><XCircle size={12} /> Échoué</span>;
  }
  return <span className="admin-badge">{status}</span>;
}

function TypeBadge({ type }) {
  if (type === 'etudiant') {
    return <span className="admin-badge type-etudiant"><GraduationCap size={12} /> Étudiant</span>;
  }
  if (type === 'donateur') {
    return <span className="admin-badge type-donateur"><HeartHandshake size={12} /> Donateur</span>;
  }
  return <span className="admin-badge">—</span>;
}

function modeLabel(row) {
  if (row.mode_paiement === 'especes') return 'Espèces';
  if (row.mode_paiement === 'en_ligne') return 'En ligne';
  if (row.methode_preferee === 'orange') return 'Orange Money';
  if (row.methode_preferee === 'mtn') return 'MTN MoMo';
  return row.mode_paiement || '—';
}

export default function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('bouano_admin_token') || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    let timer = null;
    if (token) {
      fetchContributions();
      timer = setInterval(fetchContributions, LIVE_POLL_MS);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    try {
      const { data } = await api.post('/auth/token/', { username, password });
      localStorage.setItem('bouano_admin_token', data.access);
      setToken(data.access);
    } catch {
      setLoginError('Identifiants incorrects.');
    }
  }

  async function fetchContributions() {
    setLoading(true);
    try {
      const { data } = await api.get('/contributions/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch {
      setRows([]);
    }
    setLoading(false);
  }

  async function downloadExcel() {
    const res = await api.get('/contributions/export_excel/', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contributions_bouano_doumaintang.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function downloadCsv() {
    const res = await api.get('/contributions/export_csv/', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contributions_bouano_doumaintang.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function handleValidateCashPayment(contributionId) {
    setProcessingId(contributionId);
    try {
      const updated = await validateContributionPayment(contributionId, token);
      setRows((currentRows) => currentRows.map((row) => (row.id === updated.id ? updated : row)));
    } catch {
      // ignore error for now; could show toast later
    }
    setProcessingId(null);
  }

  function downloadContributionDetails(row) {
    // Request backend Excel for this contribution
    (async () => {
      try {
        const res = await api.get(`/contributions/${row.id}/export_detail_excel/`, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${displayName(row).replace(/\s+/g, '_')}_details.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        // fallback: download plain text if endpoint not available
        const details = [
          ['Nom complet', displayName(row)],
          ['Téléphone', row.telephone],
          ['Email', row.email || '—'],
          ['École / org.', row.ecole || '—'],
          ['Filière', row.filiere || '—'],
          ['Niveau', row.niveau_academique || '—'],
          ['Prénom', row.prenom || '—'],
          ['Sexe', row.sexe || '—'],
          ['Âge', row.age || '—'],
        ];
        const text = details.map(([label, value]) => `${label}: ${value}`).join('\r\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${displayName(row).replace(/\s+/g, '_')}_details.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    })();
  }

  function logout() {
    localStorage.removeItem('bouano_admin_token');
    setToken('');
    setRows([]);
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'all') {
        if (filter === 'etudiant' || filter === 'donateur') {
          if (r.contributor_type !== filter) return false;
        } else if (r.payment_status !== filter) {
          return false;
        }
      }
      if (!q) return true;
      const haystack = [
        displayName(r), r.telephone, r.email, r.ecole, r.contributor_type, r.payment_status,
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, filter, search]);

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r.payment_status === 'SUCCESSFUL');
    const pending = rows.filter((r) => r.payment_status === 'PENDING');
    const students = rows.filter((r) => r.contributor_type === 'etudiant');
    const donors = rows.filter((r) => r.contributor_type === 'donateur');
    const totalCollected = paid.reduce((sum, r) => sum + (r.amount || 0), 0);
    return { paid, pending, students, donors, totalCollected };
  }, [rows]);

  const goal = 5000000;
  const progressPct = Math.min(100, Math.round((stats.totalCollected / goal) * 100));

  const isLoggedIn = !!token;

  if (!isLoggedIn) {
    return (
      <div className="admin-root">
        <div className="admin-login-wrap">
          <form className="admin-login-box" onSubmit={handleLogin}>
            <img src="/images/asseres-logo.png" alt="ASSERES" className="admin-login-logo" />
            <h1>Espace organisateur</h1>
            <p className="admin-login-sub">BOUANE Ô DOUMAINTANG · Tableau de bord ASSERES</p>

            <div className="admin-field">
              <label htmlFor="username">Nom d&apos;utilisateur</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div className="admin-field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {loginError && <div className="admin-error">{loginError}</div>}

            <button type="submit" className="admin-btn admin-btn-primary">Se connecter</button>

          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <div className="admin-topbar">
          <div className="admin-brand">
            <img src="/images/asseres-logo.png" alt="ASSERES" />
            <div className="admin-brand-text">
              <h1>BOUANE Ô DOUMAINTANG</h1>
              <p>Tableau de bord · Contributions</p>
            </div>
          </div>
          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn-ghost" onClick={fetchContributions}>
              <RefreshCw size={16} /> Actualiser
            </button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={downloadCsv}>
              <Download size={16} /> Exporter CSV
            </button>
            <button type="button" className="admin-btn admin-btn-gold" onClick={downloadExcel}>
              <Download size={16} /> Exporter Excel
            </button>
            <button type="button" className="admin-btn admin-btn-ghost" onClick={logout}>
              <LogOut size={16} /> Quitter
            </button>
          </div>
        </div>


        <div className="admin-stats">
          <StatCard icon={<Wallet size={20} />} tone="gold" value={formatAmount(stats.totalCollected)} label="Montant collecté" />
          <StatCard icon={<CheckCircle2 size={20} />} tone="green" value={stats.paid.length} label="Paiements validés" />
          <StatCard icon={<Clock size={20} />} tone="navy" value={stats.pending.length} label="En attente" />
          <StatCard icon={<GraduationCap size={20} />} tone="green" value={stats.students.length} label="Étudiants inscrits" />
          <StatCard icon={<HeartHandshake size={20} />} tone="gold" value={stats.donors.length} label="Donateurs" />
          <StatCard icon={<Users size={20} />} tone="navy" value={rows.length} label="Total contributions" />
        </div>

        <div className="admin-progress-block">
          <div className="admin-progress-head">
            <span>Objectif de collecte</span>
            <span>{progressPct}% · {formatAmount(stats.totalCollected)} / {formatAmount(goal)}</span>
          </div>
          <div className="admin-progress-track">
            <div className="admin-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Rechercher nom, téléphone, école…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`admin-filter-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-loading">Chargement des contributions…</div>
          ) : filteredRows.length === 0 ? (
            <div className="admin-empty">Aucune contribution ne correspond à votre recherche.</div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    {['', 'Type', 'Nom complet', 'Téléphone', 'Email', 'École / org.', 'Montant', 'Mode', 'Statut', 'Date'].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                <React.Fragment key={r.id}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="admin-detail-toggle"
                        onClick={() => setExpandedRowId(expandedRowId === r.id ? null : r.id)}
                        aria-label="Afficher détails"
                      >
                        {expandedRowId === r.id ? '−' : '+'}
                      </button>
                    </td>
                    <td><TypeBadge type={r.contributor_type} /></td>
                    <td><strong>{displayName(r)}</strong></td>
                    <td>{r.telephone}</td>
                    <td>{r.email || '—'}</td>
                    <td>{r.ecole || '—'}</td>
                    <td>{r.amount ? formatAmount(r.amount) : '—'}</td>
                    <td>{modeLabel(r)}</td>
                    <td><StatusBadge status={r.payment_status} /></td>
                    <td>{new Date(r.created_at).toLocaleString('fr-FR')}</td>
                  </tr>
                  {expandedRowId === r.id && (
                    <tr className="admin-detail-row">
                      <td colSpan={10}>
                        <div className="admin-detail-panel">
                          <div className="admin-detail-header">
                            <div>
                              <strong>Détails du formulaire</strong>
                              <p className="admin-detail-subtitle">Toutes les informations enregistrées pour cette contribution.</p>
                            </div>
                            <div className="admin-detail-status">
                              <span>{r.payment_status === 'SUCCESSFUL' ? 'Payé' : r.payment_status === 'PENDING' ? 'En attente' : r.payment_status === 'FAILED' ? 'Échoué' : r.payment_status}</span>
                            </div>
                          </div>
                          <div className="admin-detail-actions">
                            <button
                              type="button"
                              className="admin-detail-button admin-detail-button-secondary"
                              onClick={() => downloadContributionDetails(r)}
                            >
                              Télécharger les détails
                            </button>
                            {r.payment_status === 'PENDING' && (
                              r.mode_paiement === 'especes' || r.contributor_type === 'donateur'
                            ) && (
                              <button
                                type="button"
                                className="admin-detail-button admin-detail-button-primary"
                                disabled={processingId === r.id}
                                onClick={() => handleValidateCashPayment(r.id)}
                              >
                                {processingId === r.id
                                  ? 'Validation...'
                                  : r.contributor_type === 'donateur'
                                    ? 'Confirmer le don reçu'
                                    : 'Valider paiement en espèces'}
                              </button>
                            )}
                          </div>

                          <div className="admin-detail-section">
                            <h3>Informations personnelles</h3>
                            <div className="admin-detail-grid">
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Prénom</span>
                                <span className="admin-detail-value">{r.prenom || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Sexe</span>
                                <span className="admin-detail-value">{r.sexe || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Âge</span>
                                <span className="admin-detail-value">{r.age || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Téléphone</span>
                                <span className="admin-detail-value">{r.telephone || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Email</span>
                                <span className="admin-detail-value">{r.email || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Carte étudiante</span>
                                <span className="admin-detail-value">{r.numero_carte_etudiant || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="admin-detail-section">
                            <h3>Détails académiques</h3>
                            <div className="admin-detail-grid">
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">École / org.</span>
                                <span className="admin-detail-value">{r.ecole || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Filière</span>
                                <span className="admin-detail-value">{r.filiere || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Niveau</span>
                                <span className="admin-detail-value">{r.niveau_academique || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Ville de résidence</span>
                                <span className="admin-detail-value">{r.ville_residence || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="admin-detail-section">
                            <h3>Préférences campagne</h3>
                            <div className="admin-detail-grid">
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Méthode préférée</span>
                                <span className="admin-detail-value">{r.methode_preferee || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Déjà participé</span>
                                <span className="admin-detail-value">{r.deja_participe_campagne || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Ressortissant Est</span>
                                <span className="admin-detail-value">{r.ressortissant_est || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Parle Maka'a</span>
                                <span className="admin-detail-value">{r.parle_makaa || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Taille T-shirt</span>
                                <span className="admin-detail-value">{r.taille_tshirt || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Allergies / santé</span>
                                <span className="admin-detail-value">{r.allergies_sante || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Attentes campagne</span>
                                <span className="admin-detail-value">{r.attentes_campagne || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="admin-detail-section">
                            <h3>Contact d'urgence</h3>
                            <div className="admin-detail-grid">
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Nom</span>
                                <span className="admin-detail-value">{r.contact_urgence_nom || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Téléphone</span>
                                <span className="admin-detail-value">{r.contact_urgence_telephone || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Ville</span>
                                <span className="admin-detail-value">{r.contact_urgence_ville || '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Lien</span>
                                <span className="admin-detail-value">{r.contact_urgence_lien || '—'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="admin-detail-section">
                            <h3>Paiement</h3>
                            <div className="admin-detail-grid">
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Mode paiement</span>
                                <span className="admin-detail-value">{r.mode_paiement ? (r.mode_paiement === 'especes' ? 'Espèces' : 'En ligne') : '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Référence Campay</span>
                                <span className="admin-detail-value">{r.campay_reference || '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Montant dû</span>
                                <span className="admin-detail-value">{r.fee_total ? formatAmount(r.fee_total) : '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Montant payé</span>
                                <span className="admin-detail-value">{r.amount_paid ? formatAmount(r.amount_paid) : '—'}</span>
                              </div>
                              <div className="admin-detail-item">
                                <span className="admin-detail-label">Reste dû</span>
                                <span className="admin-detail-value">{r.amount_due ? formatAmount(r.amount_due) : '—'}</span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Preuve paiement</span>
                                <span className="admin-detail-value">
                                  {r.payment_proof ? <a className="admin-detail-link" href={r.payment_proof} target="_blank" rel="noreferrer">Voir le fichier</a> : '—'}
                                </span>
                              </div>
                              <div className="admin-detail-item admin-detail-fullwidth">
                                <span className="admin-detail-label">Photo</span>
                                <span className="admin-detail-value">
                                    {r.photo ? (
                                      <>
                                        <a className="admin-detail-link" href={r.photo} target="_blank" rel="noreferrer">Voir la photo</a>
                                        <a className="admin-detail-link admin-detail-link-download" href={r.photo} target="_blank" rel="noreferrer" download> Télécharger</a>
                                      </>
                                    ) : '—'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="admin-footnote">
          {filteredRows.length} ligne{filteredRows.length > 1 ? 's' : ''} affichée{filteredRows.length > 1 ? 's' : ''}
          {search ? ` · recherche « ${search} »` : ''}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, tone, value, label }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${tone}`}>{icon}</div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}
