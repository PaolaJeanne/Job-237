import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFavorites, toggleFavorite } from '../api/jobs';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { timeAgo } from '../constants';

export default function Favorites() {
  const [favorites, setFavorites] = useState(null);

  useEffect(() => {
    fetchFavorites().then((d) => setFavorites(d.results || d));
  }, []);

  const remove = async (jobId) => {
    await toggleFavorite(jobId);
    setFavorites((list) => list.filter((f) => f.job !== jobId));
  };

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Mes favoris' }]} />
      <span className="eyebrow">Mes favoris</span>
      <h1 style={{ marginTop: 4, fontSize: 28, marginBottom: 28 }}>Offres sauvegardées</h1>

      {favorites === null && <Loader />}
      {favorites && favorites.length === 0 && (
        <EmptyState
          glyph="♡"
          title="Aucun favori pour le moment"
          hint="Ajoutez des offres à vos favoris pour les retrouver ici."
          action={<Link to="/offres" className="btn btn-primary btn-sm">Parcourir les offres</Link>}
        />
      )}
      {favorites && favorites.length > 0 && (
        <div className="stack" style={{ gap: 12 }}>
          {favorites.map((f) => (
            <div key={f.id} className="card card-pad row" style={{ justifyContent: 'space-between' }}>
              <div>
                <Link to={`/offres/${f.job_slug}`} style={{ fontWeight: 600, fontSize: 15.5 }}>
                  {f.job_title}
                </Link>
                <div className="muted" style={{ fontSize: 13.5 }}>
                  {f.company_name} · ajouté {timeAgo(f.created_at)}
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => remove(f.job)} type="button">
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
