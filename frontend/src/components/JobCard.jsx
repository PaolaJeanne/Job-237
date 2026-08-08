import { useNavigate } from 'react-router-dom';
import { formatSalary, labelFor, JOB_TYPES, timeAgo, mediaUrl } from '../constants';

export default function JobCard({ job, favorited, onToggleFavorite }) {
  const salary = formatSalary(job.salary_min, job.salary_max);
  const navigate = useNavigate();

  return (
    <article
      className="card job-card"
      onClick={() => navigate(`/offres/${job.slug}`)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/offres/${job.slug}`)}
    >
      <div className="job-card-top">
        <div className="logo-tile">
          {job.company_logo ? (
            <img src={mediaUrl(job.company_logo)} alt="" />
          ) : (
            (job.company_name || '?').slice(0, 1).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: 2 }}>{job.title}</h3>
          <div className="company">{job.company_name}</div>
        </div>
        {onToggleFavorite && (
          <button
            className={`fav-btn ${favorited ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // empêche la navigation
              onToggleFavorite(job);
            }}
            aria-label={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            type="button"
          >
            {favorited ? '♥' : '♡'}
          </button>
        )}
      </div>

      <div className="job-card-tags">
        <span className="badge badge-forest">{labelFor(JOB_TYPES, job.job_type)}</span>
        {job.is_remote && <span className="badge badge-gold">Télétravail</span>}
        <span className="badge">{job.location}</span>
        {job.is_premium && <span className="badge badge-gold">★ Premium</span>}
      </div>

      <div className="job-card-foot">
        <span className="salary">{salary || 'Salaire non précisé'}</span>
        <span className="muted" style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)' }}>
          {timeAgo(job.created_at)}
        </span>
      </div>
    </article>
  );
}
