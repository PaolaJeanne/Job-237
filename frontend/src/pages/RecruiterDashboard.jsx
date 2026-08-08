import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyJobs, fetchRecruiterAppStats } from '../api/jobs';
import { fetchMyCompanies } from '../api/companies';
import { Loader } from '../components/Feedback';
import TrendChart from '../components/TrendChart';
import { useAuth } from '../context/AuthContext';
import { labelFor, JOB_TYPES, timeAgo, APPLICATION_STATUSES } from '../constants';
import { fetchUnreadMessageCount } from '../api/messaging';
import DashboardSection from '../components/DashboardSection';

function StatCard({ icon, label, value, sub, linkTo }) {
  const content = (
    <div className="stat-card" style={{ cursor: linkTo ? 'pointer' : undefined }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <strong>{value ?? '···'}</strong>
        <span>{label}</span>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
}

function MiniBar({ value, max, label, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mini-bar-row">
      <span className="mini-bar-label">{label}</span>
      <div className="mini-bar-track">
        <div className="mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="mini-bar-value">{value}</span>
    </div>
  );
}

function RecruiterTrendChart({ jobs }) {
  if (!jobs?.length) {
    return (
      <div className="empty" style={{ padding: '24px 16px' }}>
        <div className="glyph">📈</div>
        <p className="muted">Aucune publication récente.</p>
      </div>
    );
  }

  const buckets = {};
  jobs.forEach((job) => {
    if (!job.created_at) return;
    const d = new Date(job.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets[key] = (buckets[key] || 0) + 1;
  });

  const visible = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({
      label: new Date(`${month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      value: count,
    }));

  return <TrendChart data={visible} label="Offres publiées sur 6 mois" />;
}

function ApplicationsTrend({ series }) {
  if (!series?.length) {
    return (
      <div className="empty" style={{ padding: '24px 16px' }}>
        <div className="glyph">📄</div>
        <p className="muted">Aucune candidature reçue.</p>
      </div>
    );
  }

  const visible = series.map((row) => ({
    label: new Date(`${row.month}-01T00:00:00`).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
    value: row.count,
  }));

  return <TrendChart data={visible} label="Candidatures reçues sur 6 mois" />;
}

const JOB_COLORS = {
  full_time: '#7c3aed',
  part_time: '#64748b',
  internship: '#3b82f6',
  freelance: '#fb7185',
  contract: '#22c55e',
  cdi: '#a855f7',
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [stats, setStats] = useState(null);
  const [unreadMsg, setUnreadMsg] = useState(0);

  useEffect(() => {
    fetchMyJobs().then((d) => setJobs(d.results || d));
    fetchMyCompanies().then((d) => setCompanies(d.results || d));
    fetchRecruiterAppStats().then(setStats).catch(() => {});
    fetchUnreadMessageCount().then((d) => setUnreadMsg(d.unread_count)).catch(() => {});
  }, []);

  const totalApplications = jobs?.reduce((sum, j) => sum + (j.applications_count || 0), 0) ?? 0;
  const totalViews = jobs?.reduce((sum, j) => sum + (j.views_count || 0), 0) ?? 0;
  const activeJobs = jobs?.filter((j) => j.is_active).length ?? 0;
  const jobsWithoutApps = jobs?.filter((j) => !j.applications_count).length ?? 0;
  const conversionRate = totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0;
  const maxJobType = jobs?.length
    ? Math.max(...JOB_TYPES.map((t) => jobs.filter((j) => j.job_type === t.value).length), 1)
    : 1;

  const recentApps = (() => {
    if (!stats) return [];
    return APPLICATION_STATUSES.filter((s) => (stats.by_status?.[s.value] || 0) > 0).map((s) => ({
      ...s,
      count: stats.by_status[s.value] || 0,
    }));
  })();

  const renderStatusMax = Math.max(...recentApps.map((s) => s.count), 1);
  const strongestJobs = (jobs || []).slice().sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 4);

  const priorities = (() => {
    const list = [];
    const pending = stats?.by_status?.pending || 0;
    if (pending > 0) {
      list.push({
        icon: '📥',
        title: 'Candidatures à traiter',
        text: `${pending} candidature${pending > 1 ? 's' : ''} en attente de réponse. Répondez vite pour fidéliser les candidats.`,
      });
    }
    const inactive = jobs?.filter((j) => !j.is_active).length ?? 0;
    if (inactive > 0) {
      list.push({
        icon: '🔄',
        title: 'Offres inactives',
        text: `${inactive} offre${inactive > 1 ? 's' : ''} inactiv${inactive > 1 ? 'es' : 'e'}. Réactivez les postes toujours ouverts.`,
      });
    }
    if (jobs?.length && totalViews === 0) {
      list.push({
        icon: '📣',
        title: 'Boostez votre visibilité',
        text: 'Vos offres n\'ont pas encore de vues. Partagez-les sur les réseaux sociaux.',
      });
    }
    return list.slice(0, 3);
  })();

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: '#c4b5fd' }}>Espace recruteur</span>
          <h1 style={{ color: 'var(--hero-ink)', marginTop: 4, fontSize: 30 }}>
            Bonjour {user.first_name} 👋
          </h1>
          <p className="dashboard-hero-sub">
            Gérez vos offres d'emploi et suivez vos candidatures.
          </p>
        </div>
      </header>

      <div className="container" style={{ marginTop: 28 }}>
        <div className="stat-row">
          <StatCard icon="🏢" label="Entreprises" value={companies?.length} linkTo="/recruteur/entreprises" />
          <StatCard icon="📋" label="Offres publiées" value={jobs?.length} sub={activeJobs > 0 ? `${activeJobs} active${activeJobs > 1 ? 's' : ''}` : undefined} />
          <StatCard icon="📄" label="Candidatures reçues" value={stats?.total ?? totalApplications} sub={stats?.by_status?.pending > 0 ? `${stats.by_status.pending} à traiter` : undefined} />
          <StatCard icon="👁️" label="Vues totales" value={totalViews} sub={conversionRate > 0 ? `${conversionRate}% converties` : undefined} />
          <StatCard icon="🔍" label="Sans candidature" value={jobsWithoutApps} sub={jobsWithoutApps > 0 ? 'à retravailler' : undefined} linkTo="/offres" />
        </div>

        {priorities.length > 0 && (
          <div className="tips-strip" style={{ marginTop: 24 }}>
            {priorities.map((t) => (
              <div key={t.title} className="tip-card">
                <span className="tip-icon">{t.icon}</span>
                <div className="tip-body">
                  <strong>{t.title}</strong>
                  <span>{t.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {companies && companies.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '40px 24px', marginTop: 34 }}>
            <div className="glyph" style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
            <h3>Créez votre entreprise</h3>
            <p className="muted" style={{ maxWidth: 400, margin: '0 auto 16px' }}>
              Vous devez d'abord créer un profil entreprise avant de pouvoir publier des offres.
            </p>
            <Link to="/recruteur/entreprises" className="btn btn-primary">
              Créer mon entreprise
            </Link>
          </div>
        ) : (
          <>
            <DashboardSection label="Analyse" title="Analyse de mes offres">
              <div className="dashboard-grid">
                <div className="card card-pad">
                  <div className="card-head">
                    <h3>Offres par type</h3>
                  </div>
                  {jobs === null ? <Loader /> : jobs.length === 0 ? (
                    <div className="empty" style={{ padding: '24px 16px' }}>
                      <p className="muted">Aucune offre publiée.</p>
                    </div>
                  ) : (
                    JOB_TYPES.map((t) => {
                      const count = jobs.filter((j) => j.job_type === t.value).length;
                      if (!count) return null;
                      return (
                        <MiniBar
                          key={t.value}
                          label={t.label}
                          value={count}
                          max={maxJobType}
                          color={JOB_COLORS[t.value] || 'var(--forest)'}
                        />
                      );
                    })
                  )}
                  {jobs?.length > 0 && (
                    <Link to="/recruteur/offres/nouvelle" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 12 }}>
                      + Publier une offre
                    </Link>
                  )}
                </div>

                <div className="card card-pad">
                  <div className="card-head">
                    <h3>Candidatures par statut</h3>
                    <span className="badge badge-forest">Pipeline</span>
                  </div>
                  {stats === null ? <Loader /> : recentApps.length === 0 ? (
                    <div className="empty" style={{ padding: '24px 16px' }}>
                      <p className="muted">Aucune candidature reçue.</p>
                    </div>
                  ) : (
                    <div className="mini-bars-stack">
                      {recentApps.map((s) => (
                        <MiniBar
                          key={s.value}
                          label={s.label}
                          value={s.count}
                          max={renderStatusMax}
                          color={s.color || 'var(--forest)'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="dashboard-grid dashboard-grid-3" style={{ marginTop: 24 }}>
                <div className="card card-pad">
                  <div className="card-head">
                    <h3>Évolution des publications</h3>
                    <span className="badge badge-gold">Historique</span>
                  </div>
                  <RecruiterTrendChart jobs={jobs} />
                </div>

                <div className="card card-pad">
                  <div className="card-head">
                    <h3>Candidatures reçues / mois</h3>
                    <span className="badge badge-gold">Flux</span>
                  </div>
                  {stats === null ? <Loader /> : <ApplicationsTrend series={stats.per_month} />}
                </div>

                <div className="card card-pad">
                  <div className="card-head">
                    <h3>Performance des offres</h3>
                    <span className="badge badge-gold">Vues</span>
                  </div>
                  {jobs === null ? <Loader /> : jobs.length === 0 ? (
                    <div className="empty" style={{ padding: '24px 16px' }}>
                      <p className="muted">Aucune donnée disponible.</p>
                    </div>
                  ) : (
                    <div className="mini-bars-stack">
                      {strongestJobs.map((job) => (
                        <MiniBar
                          key={job.id}
                          label={job.title.length > 20 ? `${job.title.slice(0, 20)}…` : job.title}
                          value={job.views_count || 0}
                          max={Math.max(...strongestJobs.map((j) => j.views_count || 0), 1)}
                          color={JOB_COLORS[job.job_type] || 'var(--forest)'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DashboardSection>

            <DashboardSection label="Suivi" title="Mes offres">
              <div className="card card-pad">
                <div className="card-head">
                  <h3>Mes offres publiées</h3>
                  {jobs?.length > 0 && (
                    <Link to="/recruteur/offres/nouvelle" className="btn btn-primary btn-sm">
                      + Publier
                    </Link>
                  )}
                </div>
                {jobs === null ? <Loader /> : jobs.length === 0 ? (
                  <div className="empty" style={{ padding: '24px 16px' }}>
                    <p className="muted">Vous n'avez pas encore publié d'offre.</p>
                  </div>
                ) : (
                  <div className="job-mini-list">
                    {[...jobs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5).map((j) => (
                      <div key={j.id} className="job-mini-item">
                        <div className="job-mini-info">
                          <Link to={`/offres/${j.slug}`} className="job-mini-title">{j.title}</Link>
                          <div className="job-mini-meta">
                            <span className={`badge ${j.is_active ? 'badge-ok' : 'badge-clay'}`}>
                              {j.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span>{labelFor(JOB_TYPES, j.job_type)}</span>
                            <span className="muted">{timeAgo(j.created_at)}</span>
                          </div>
                        </div>
                        <div className="job-mini-stats">
                          <div className="job-mini-stat" title="Candidatures">
                            <strong>{j.applications_count || 0}</strong>
                            <span>candidatures</span>
                          </div>
                          <div className="job-mini-stat" title="Vues">
                            <strong>{j.views_count || 0}</strong>
                            <span>vues</span>
                          </div>
                        </div>
                        <Link to={`/recruteur/offres/${j.id}/candidatures`} className="btn btn-outline btn-sm">
                          Voir
                        </Link>
                        <Link to={`/recruteur/offres/${j.id}/modifier`} className="btn btn-outline btn-sm">
                          Modifier
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DashboardSection>
          </>
        )}

        <DashboardSection label="Raccourcis" title="Actions rapides">
          <div className="quick-actions">
            <Link to="/recruteur/entreprises" className="qa-card">
              <span className="qa-icon">🏢</span>
              <strong>Mes entreprises</strong>
              <span className="muted">{companies?.length || 0} entreprise{companies?.length !== 1 ? 's' : ''}</span>
            </Link>
            <Link to="/recruteur/offres/nouvelle" className="qa-card">
              <span className="qa-icon">➕</span>
              <strong>Nouvelle offre</strong>
              <span className="muted">Publiez une offre d'emploi</span>
            </Link>
            <Link to="/messagerie" className="qa-card">
              <span className="qa-icon">💬</span>
              <strong>Messagerie</strong>
              <span className="muted">{unreadMsg > 0 ? `${unreadMsg} non lu${unreadMsg > 1 ? 's' : ''}` : 'Conversations avec les candidats'}</span>
            </Link>
            <Link to="/profil" className="qa-card">
              <span className="qa-icon">✏️</span>
              <strong>Mon profil</strong>
              <span className="muted">Modifier mes informations</span>
            </Link>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
