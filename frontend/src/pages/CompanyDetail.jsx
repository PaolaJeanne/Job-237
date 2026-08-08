import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCompany } from '../api/companies';
import { fetchJobs } from '../api/jobs';
import JobCard from '../components/JobCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { COMPANY_SIZES, labelFor, mediaUrl } from '../constants';

export default function CompanyDetail() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCompany(slug).then(setCompany).catch(() => setNotFound(true));
    fetchJobs({ company: slug }).then((d) => setJobs(d.results));
  }, [slug]);

  if (notFound) {
    return (
      <div className="container section">
        <EmptyState glyph="✕" title="Entreprise introuvable" />
      </div>
    );
  }
  if (!company) return <Loader />;

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Entreprises', path: '/entreprises' }, { label: company?.name || '…' }]} />
      <div className="card card-pad row" style={{ gap: 20, marginBottom: 32, alignItems: 'flex-start' }}>
        <div className="logo-tile" style={{ width: 74, height: 74, fontSize: 26 }}>
          {company.logo ? <img src={mediaUrl(company.logo)} alt="" /> : company.name.slice(0, 1)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="row" style={{ gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontSize: 26, margin: 0 }}>{company.name}</h1>
            {company.is_verified && <span className="badge badge-forest">✓ Vérifiée</span>}
          </div>
          <p className="muted" style={{ marginBottom: 10 }}>
            {company.industry} · {company.location}
            {company.size && ` · ${labelFor(COMPANY_SIZES, company.size)}`}
          </p>
          <p style={{ marginBottom: 12 }}>{company.description}</p>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="badge">
                🔗 Site web
              </a>
            )}
            {company.email && <span className="badge">✉ {company.email}</span>}
            {company.phone && <span className="badge">☎ {company.phone}</span>}
            {company.founded_year && <span className="badge">Fondée en {company.founded_year}</span>}
          </div>
        </div>
        <div className="ledger">
          <strong>{company.active_jobs_count}</strong>
          <span>Offres actives</span>
        </div>
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 20 }}>Offres publiées par {company.name}</h2>
      {jobs === null ? (
        <Loader />
      ) : jobs.length === 0 ? (
        <EmptyState glyph="🗂" title="Aucune offre active" hint="Cette entreprise ne recrute pas actuellement." />
      ) : (
        <div className="grid grid-jobs">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}
    </div>
  );
}
