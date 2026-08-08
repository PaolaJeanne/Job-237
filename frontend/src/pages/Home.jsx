import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, fetchCategories } from '../api/jobs';
import { fetchCompanies } from '../api/companies';
import JobCard from '../components/JobCard';
import { Loader } from '../components/Feedback';
import { JOB_TYPES } from '../constants';

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobs, setJobs] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ jobs: null, companies: null });

  useEffect(() => {
    fetchJobs({ ordering: '-created_at', page_size: 6 }).then((d) =>
      setJobs((d.results || d).slice(0, 6))
    );
    fetchCategories().then(setCategories);
    fetchJobs({ page: 1 }).then((d) => setStats((s) => ({ ...s, jobs: d.count })));
    fetchCompanies({ page: 1 }).then((d) => setStats((s) => ({ ...s, companies: d.count })));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (jobType) params.set('job_type', jobType);
    navigate(`/offres?${params.toString()}`);
  };

  return (
    <div>
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">Recrutement — Cameroun</span>
          <h1>Trouvez le poste qui fait avancer votre carrière.</h1>
          <p className="hero-lede">
            Des centaines d'offres vérifiées, publiées directement par les entreprises qui
            recrutent à Douala, Yaoundé et partout au 237.
          </p>

          <form className="search-panel" onSubmit={handleSearch}>
            <input
              placeholder="Titre, mot-clé, entreprise…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="">Tous types de contrat</option>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <button className="btn btn-gold" type="submit">
              Rechercher
            </button>
          </form>

          <div className="hero-stats">
            <div className="ledger on-dark">
              <strong>{stats.jobs ?? '···'}</strong>
              <span>Offres actives</span>
            </div>
            <div className="ledger on-dark">
              <strong>{stats.companies ?? '···'}</strong>
              <span>Entreprises</span>
            </div>
            <div className="ledger on-dark">
              <strong>{categories.length || '···'}</strong>
              <span>Secteurs</span>
            </div>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Explorer</span>
                <h2 style={{ marginTop: 4 }}>Secteurs d'activité</h2>
              </div>
            </div>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className="badge"
                  style={{ fontSize: 13, padding: '9px 16px', cursor: 'pointer' }}
                  onClick={() => navigate(`/offres?category=${c.id}`)}
                  type="button"
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Fraîchement publiées</span>
              <h2 style={{ marginTop: 4 }}>Dernières offres</h2>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/offres')} type="button">
              Voir toutes les offres →
            </button>
          </div>
          {jobs === null ? (
            <Loader />
          ) : (
            <div className="grid grid-jobs">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
