import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../api/jobs';
import { fetchAdminStats } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Feedback';
import TrendChart from '../components/TrendChart';
import DonutChart from '../components/DonutChart';
import HBarChart from '../components/HBarChart';
import { JOB_TYPES, MEDIA_BASE } from '../constants';
import DashboardSection from '../components/DashboardSection';

const JOB_COLORS = {
  full_time: '#7c3aed',
  part_time: '#64748b',
  internship: '#3b82f6',
  freelance: '#fb7185',
  contract: '#22c55e',
  cdi: '#a855f7',
};

const ROLE_COLORS = {
  candidate: '#a855f7',
  recruiter: '#22d3ee',
  admin: '#fb7185',
};

function StatCard({ icon, label, value, linkTo }) {
  const content = (
    <div className="stat-card" style={{ cursor: linkTo ? 'pointer' : undefined }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <strong>{value ?? '···'}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}

function seriesToTrend(series) {
  return (series || []).map((row) => ({
    label: new Date(`${row.month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    value: row.count,
  }));
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAdminStats().then(setStats).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const jobTypes = JOB_TYPES.map((t) => ({
    label: t.label,
    value: stats?.jobs?.by_type?.[t.value] || 0,
    color: JOB_COLORS[t.value],
  }));

  const roleItems = [
    { label: 'Candidats', value: stats?.users?.by_role?.candidate || 0, color: ROLE_COLORS.candidate },
    { label: 'Recruteurs', value: stats?.users?.by_role?.recruiter || 0, color: ROLE_COLORS.recruiter },
    { label: 'Admins', value: stats?.users?.by_role?.admin || 0, color: ROLE_COLORS.admin },
  ];

  const jobsTrend = seriesToTrend(stats?.jobs?.per_month);
  const usersTrend = seriesToTrend(stats?.users?.per_month);

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: '#c4b5fd' }}>Administration</span>
          <h1 style={{ color: 'var(--hero-ink)', marginTop: 4, fontSize: 30 }}>
            Bonjour {user.first_name} 👋
          </h1>
          <p className="dashboard-hero-sub">
            Vue d'ensemble de la plateforme Job237.
          </p>
        </div>
      </header>

      <div className="container" style={{ marginTop: 28 }}>
        <div className="stat-row">
          <StatCard icon="📋" label="Offres totales" value={stats?.jobs?.total} linkTo="/offres" />
          <StatCard icon="🏢" label="Entreprises" value={stats?.companies?.total} linkTo="/entreprises" />
          <StatCard icon="📂" label="Secteurs" value={stats === null ? undefined : categories.length} linkTo="/offres" />
          <StatCard icon="👥" label="Utilisateurs" value={stats?.users?.total} linkTo="/admin/utilisateurs" />
        </div>

        <DashboardSection label="Statistiques" title="Données de la plateforme">
          <div className="dashboard-grid">
            <div className="card card-pad">
              <div className="card-head">
                <h3>Offres par type de contrat</h3>
                {stats?.jobs?.total > 0 && <span className="badge badge-gold">{stats.jobs.total} offres</span>}
              </div>
              {!stats ? <Loader /> : <HBarChart items={jobTypes} emptyText="Aucune offre publiée." />}
            </div>

            <div className="card card-pad">
              <div className="card-head">
                <h3>Comptes par rôle</h3>
                {stats?.users?.total > 0 && <span className="badge badge-gold">{stats.users.total} comptes</span>}
              </div>
              {!stats ? <Loader /> : <DonutChart items={roleItems} centerLabel="comptes" />}
            </div>
          </div>

          <div className="dashboard-grid dashboard-grid-3" style={{ marginTop: 24 }}>
            <div className="card card-pad">
              <div className="card-head">
                <h3>Nouvelles offres / mois</h3>
              </div>
              {!stats ? (
                <Loader />
              ) : jobsTrend.length === 0 ? (
                <div className="empty" style={{ padding: '24px 16px' }}>
                  <div className="glyph">📈</div>
                  <p className="muted">Aucune offre publiée récemment.</p>
                </div>
              ) : (
                <TrendChart data={jobsTrend} label="Nouvelles offres publiées sur 6 mois" />
              )}
            </div>

            <div className="card card-pad">
              <div className="card-head">
                <h3>Nouvelles inscriptions / mois</h3>
              </div>
              {!stats ? (
                <Loader />
              ) : usersTrend.length === 0 ? (
                <div className="empty" style={{ padding: '24px 16px' }}>
                  <div className="glyph">👥</div>
                  <p className="muted">Aucune inscription récente.</p>
                </div>
              ) : (
                <TrendChart data={usersTrend} label="Nouvelles inscriptions sur 6 mois" />
              )}
            </div>

            <div className="card card-pad">
              <div className="card-head">
                <h3>Secteurs d'activité</h3>
                <span className="badge badge-gold">{categories.length} secteurs</span>
              </div>
              {categories.length === 0 ? (
                <p className="muted">Aucune catégorie.</p>
              ) : (
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  {categories.map((c) => (
                    <Link key={c.id} to={`/offres?category=${c.id}`} className="badge" style={{ fontSize: 13, padding: '8px 14px' }}>
                      {c.icon} {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection label="Raccourcis" title="Actions rapides">
          <div className="quick-actions">
            <Link to="/admin/utilisateurs" className="qa-card">
              <span className="qa-icon">👥</span>
              <strong>Gérer les utilisateurs</strong>
              <span className="muted">{stats?.users?.total || 0} inscrit(s)</span>
            </Link>
            <Link to="/recruteur/offres/nouvelle" className="qa-card">
              <span className="qa-icon">➕</span>
              <strong>Publier une offre</strong>
              <span className="muted">Créer une nouvelle annonce</span>
            </Link>
            <Link to="/recruteur/entreprises/nouvelle" className="qa-card">
              <span className="qa-icon">🏢</span>
              <strong>Créer une entreprise</strong>
              <span className="muted">Ajouter une société</span>
            </Link>
            <a href={`${MEDIA_BASE}/admin/`} target="_blank" rel="noreferrer" className="qa-card">
              <span className="qa-icon">⚙️</span>
              <strong>Django Admin</strong>
              <span className="muted">Gérer utilisateurs et données</span>
            </a>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
