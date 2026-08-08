import { Link } from 'react-router-dom';
import { mediaUrl } from '../constants';

export default function CompanyCard({ company }) {
  return (
    <Link to={`/entreprises/${company.slug}`} className="card company-card">
      <div className="logo-tile">
        {company.logo ? <img src={mediaUrl(company.logo)} alt="" /> : company.name.slice(0, 1)}
      </div>
      <h3 style={{ fontSize: 16 }}>{company.name}</h3>
      <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
        {company.industry} · {company.location}
      </p>
      <span className="badge badge-gold">{company.active_jobs_count} offre(s) active(s)</span>
      {company.is_verified && (
        <span className="badge badge-forest" style={{ marginLeft: 6 }}>
          ✓ Vérifiée
        </span>
      )}
    </Link>
  );
}
