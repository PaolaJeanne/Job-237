import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyCompanies, deleteCompany } from '../api/companies';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { mediaUrl } from '../constants';

export default function MyCompanies() {
  const [companies, setCompanies] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmSlug, setConfirmSlug] = useState(null);

  useEffect(() => {
    fetchMyCompanies().then((d) => setCompanies(d.results || d));
  }, []);

  const handleDelete = async (slug) => {
    if (confirmSlug !== slug) {
      setConfirmSlug(slug);
      return;
    }
    setDeleting(slug);
    try {
      await deleteCompany(slug);
      setCompanies((list) => list.filter((c) => c.slug !== slug));
      setConfirmSlug(null);
    } catch {
      // ignore — company may have active jobs
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Mes entreprises' }]} />
      <div className="section-head">
        <div>
          <span className="eyebrow">Espace recruteur</span>
          <h1 style={{ marginTop: 4, fontSize: 28 }}>Mes entreprises</h1>
        </div>
        <Link to="/recruteur/entreprises/nouvelle" className="btn btn-primary btn-sm">
          + Nouvelle entreprise
        </Link>
      </div>

      {companies === null && <Loader />}
      {companies && companies.length === 0 && (
        <EmptyState
          glyph="🏢"
          title="Aucune entreprise enregistrée"
          hint="Créez le profil de votre entreprise pour pouvoir publier des offres."
          action={
            <Link to="/recruteur/entreprises/nouvelle" className="btn btn-primary btn-sm">
              Créer mon entreprise
            </Link>
          }
        />
      )}
      {companies && companies.length > 0 && (
        <div className="stack" style={{ gap: 12 }}>
          {companies.map((c) => (
            <div key={c.id} className="card card-pad row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div className="row" style={{ gap: 14 }}>
                <div className="logo-tile">
                  {c.logo ? <img src={mediaUrl(c.logo)} alt="" /> : c.name.slice(0, 1)}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {c.active_jobs_count} offre(s) active(s) · {c.jobs_count} au total
                  </div>
                </div>
              </div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <Link to={`/entreprises/${c.slug}`} className="btn btn-outline btn-sm">Voir</Link>
                <Link to={`/recruteur/entreprises/${c.slug}/modifier`} className="btn btn-outline btn-sm">Modifier</Link>
                {confirmSlug === c.slug ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deleting === c.slug}
                      onClick={() => handleDelete(c.slug)}
                    >
                      {deleting === c.slug ? 'Suppression…' : '⚠️ Confirmer'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setConfirmSlug(null)}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--clay)' }}
                    onClick={() => handleDelete(c.slug)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
