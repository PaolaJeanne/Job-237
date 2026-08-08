import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyApplicationStats, fetchFavorites } from '../api/jobs';
import { fetchMyCandidateProfile } from '../api/profiles';
import { fetchUnreadMessageCount } from '../api/messaging';
import { fetchNotifications } from '../api/notifications';
import { Loader } from '../components/Feedback';
import DonutChart from '../components/DonutChart';
import HBarChart from '../components/HBarChart';
import DashboardSection from '../components/DashboardSection';
import { useAuth } from '../context/AuthContext';
import { APPLICATION_STATUSES, JOB_TYPES, timeAgo } from '../constants';

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

const PIPELINE_COLORS = {
  pending: '#a855f7',
  reviewed: '#60a5fa',
  shortlisted: '#22d3ee',
  rejected: '#fb7185',
  hired: '#4ade80',
};

const JOB_COLORS = {
  full_time: '#7c3aed',
  part_time: '#64748b',
  internship: '#3b82f6',
  freelance: '#fb7185',
  contract: '#22c55e',
  cdi: '#a855f7',
};

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchMyApplicationStats().then(setStats).catch(() => {});
    fetchFavorites().then((d) => setFavorites(d.results || d)).catch(() => {});
    fetchMyCandidateProfile().then(setProfile).catch(() => {});
    fetchUnreadMessageCount().then((d) => setUnreadMsg(d.unread_count)).catch(() => {});
    fetchNotifications().then((d) => setNotifications(d.results || d)).catch(() => {});
  }, []);

  const profileCompleteness = (() => {
    if (!profile) return null;
    const checks = [
      !!profile.phone,
      !!profile.bio,
      !!profile.location,
      !!profile.cv_file,
      !!profile.photo,
      !!profile.skills?.length,
      !!profile.education_level,
      !!profile.linkedin_url,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  const pendingApps = stats?.by_status?.pending || 0;
  const shortlistedApps = stats?.by_status?.shortlisted || 0;
  const hiredApps = stats?.by_status?.hired || 0;

  const tips = (() => {
    const list = [];
    if (!stats?.total) {
      list.push({ icon: '🚀', title: 'Commencez votre recherche', text: 'Parcourez les offres et postulez à celles qui vous correspondent.' });
    }
    if (pendingApps > 0) {
      list.push({
        icon: '⏳',
        title: 'Relancez vos candidatures',
        text: `${pendingApps} candidature${pendingApps > 1 ? 's' : ''} attend${pendingApps > 1 ? 'ent' : ''} encore une réponse. N'hésitez pas à relancer le recruteur.`,
      });
    }
    if (shortlistedApps > 0) {
      list.push({
        icon: '📋',
        title: 'Préparez vos entretiens',
        text: `${shortlistedApps} offre${shortlistedApps > 1 ? 's' : ''} en présélection. Révisez votre pitch et votre parcours.`,
      });
    }
    if (profile?.availability === false) {
      list.push({ icon: '🔔', title: 'Disponibilité désactivée', text: 'Activez votre disponibilité dans votre profil pour être contacté par les recruteurs.' });
    }
    return list.slice(0, 3);
  })();

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: '#c4b5fd' }}>Tableau de bord</span>
          <h1 style={{ color: 'var(--hero-ink)', marginTop: 4, fontSize: 30 }}>
            Bonjour {user.first_name} 👋
          </h1>
          <p className="dashboard-hero-sub">
            Suivez vos candidatures et gérez votre recherche d'emploi.
          </p>
        </div>
      </header>

      <div className="container" style={{ marginTop: 28 }}>
        <div className="stat-row">
          <StatCard icon="📄" label="Candidatures" value={stats?.total} sub={pendingApps > 0 ? `${pendingApps} en attente` : undefined} linkTo="/mes-candidatures" />
          <StatCard icon="⭐" label="Favoris" value={favorites?.length} linkTo="/favoris" />
          <StatCard icon="📋" label="Présélectionnées" value={shortlistedApps} />
          <StatCard icon="🎉" label="Recruté" value={hiredApps} />
        </div>

        {tips.length > 0 && (
          <DashboardSection label="Conseils" title="Recommandations du jour">
            <div className="tips-strip">
              {tips.map((t) => (
                <div key={t.title} className="tip-card">
                  <span className="tip-icon">{t.icon}</span>
                  <div className="tip-body">
                    <strong>{t.title}</strong>
                    <span>{t.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardSection>
        )}

        <DashboardSection label="Suivi" title="Mes candidatures">
          <div className="dashboard-grid">
            <div className="card card-pad">
              <div className="card-head">
                <h3>Contrats postulés</h3>
              </div>
              {stats === null ? <Loader /> : (
                <HBarChart
                  items={JOB_TYPES.map((t) => ({
                    label: t.label,
                    value: stats.by_job_type?.[t.value] || 0,
                    color: JOB_COLORS[t.value],
                  }))}
                  emptyText="Vous n'avez encore postulé à aucune offre."
                />
              )}
            </div>

            <div className="card card-pad">
              <div className="card-head">
                <h3>Pipeline de candidatures</h3>
                <span className="badge badge-gold">État</span>
              </div>
              {stats === null ? <Loader /> : (
                <DonutChart
                  items={APPLICATION_STATUSES.map((s) => ({
                    label: s.label,
                    value: stats.by_status?.[s.value] || 0,
                    color: PIPELINE_COLORS[s.value] || 'var(--forest)',
                  }))}
                  centerLabel="candidature(s)"
                />
              )}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection label="Profil" title="Mon profil">
          <div className="dashboard-grid">
            <div className="card card-pad">
              <div className="card-head">
                <h3>Profil candidat</h3>
              </div>
              {profileCompleteness !== null && (
                <div style={{ marginBottom: 20 }}>
                  <div className="progress-label">
                    <span>Complétude</span>
                    <strong>{profileCompleteness}%</strong>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${profileCompleteness}%` }} />
                  </div>
                </div>
              )}
              <ul className="profile-check-list">
                <li className={profile?.phone ? 'done' : ''}>
                  {profile?.phone ? '✓' : '○'} Téléphone
                </li>
                <li className={profile?.bio ? 'done' : ''}>
                  {profile?.bio ? '✓' : '○'} Biographie
                </li>
                <li className={profile?.location ? 'done' : ''}>
                  {profile?.location ? '✓' : '○'} Localisation
                </li>
                <li className={profile?.cv_file ? 'done' : ''}>
                  {profile?.cv_file ? '✓' : '○'} CV
                </li>
                <li className={profile?.skills?.length ? 'done' : ''}>
                  {profile?.skills?.length ? '✓' : '○'} Compétences
                </li>
                <li className={profile?.education_level ? 'done' : ''}>
                  {profile?.education_level ? '✓' : '○'} Niveau d'étude
                </li>
              </ul>
              <Link to="/profil" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 12 }}>
                Compléter mon profil
              </Link>
            </div>

            <div className="card card-pad">
              <div className="card-head">
                <h3>Notifications récentes</h3>
                {unreadMsg > 0 && (
                  <span className="badge badge-clay">{unreadMsg} message{unreadMsg > 1 ? 's' : ''} non lu{unreadMsg > 1 ? 's' : ''}</span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="empty" style={{ padding: '24px 16px' }}>
                  <div className="glyph">🔔</div>
                  <p className="muted">Aucune notification pour le moment.</p>
                </div>
              ) : (
                <div className="timeline">
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} className="timeline-item">
                      <div className="timeline-dot" style={{ background: n.is_read ? 'var(--line)' : 'var(--gold-deep)' }} />
                      <div className="timeline-body">
                        <div className="timeline-head">
                          <span className="timeline-title">{n.title}</span>
                          {!n.is_read && <span className="badge badge-gold">Nouveau</span>}
                        </div>
                        <div className="timeline-meta">
                          <span>{n.message}</span>
                          <span>{timeAgo(n.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DashboardSection>

        <DashboardSection label="Raccourcis" title="Actions rapides">
          <div className="quick-actions">
            <Link to="/offres" className="qa-card">
              <span className="qa-icon">🔍</span>
              <strong>Parcourir les offres</strong>
              <span className="muted">Trouvez votre prochain poste</span>
            </Link>
            <Link to="/mes-candidatures" className="qa-card">
              <span className="qa-icon">📄</span>
              <strong>Mes candidatures</strong>
              <span className="muted">{stats?.total || 0} candidature{stats?.total !== 1 ? 's' : ''}</span>
            </Link>
            <Link to="/favoris" className="qa-card">
              <span className="qa-icon">⭐</span>
              <strong>Mes favoris</strong>
              <span className="muted">{favorites?.length || 0} offre{favorites?.length !== 1 ? 's' : ''} sauvegardée{favorites?.length !== 1 ? 's' : ''}</span>
            </Link>
            <Link to="/messagerie" className="qa-card">
              <span className="qa-icon">💬</span>
              <strong>Messagerie</strong>
              <span className="muted">{unreadMsg > 0 ? `${unreadMsg} non lu${unreadMsg > 1 ? 's' : ''}` : 'Conversations privées'}</span>
            </Link>
            <Link to="/profil" className="qa-card">
              <span className="qa-icon">✏️</span>
              <strong>Modifier mon profil</strong>
              <span className="muted">Mettez à jour vos informations</span>
            </Link>
          </div>
        </DashboardSection>
      </div>
    </div>
  );
}
