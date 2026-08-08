import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMyApplications } from '../api/jobs';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import { Loader, EmptyState } from '../components/Feedback';
import { APPLICATION_STATUSES, statusBadgeClass, labelFor, JOB_TYPES, formatDate, timeAgo } from '../constants';

export default function MyApplications() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const page = Number(params.get('page') || 1);
  const statusFilter = params.get('status') || '';

  useEffect(() => {
    setLoading(true);
    fetchMyApplications({ page, ...(statusFilter && { status: statusFilter }) })
      .then((d) => {
        // L'API retourne soit un objet paginé soit une liste directe
        if (Array.isArray(d)) {
          // Filtrer côté client si la liste n'est pas paginée
          const filtered = statusFilter ? d.filter((a) => a.status === statusFilter) : d;
          setData({ count: filtered.length, results: filtered });
        } else {
          setData(d);
        }
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Mes candidatures' }]} />
      <div className="section-head">
        <div>
          <span className="eyebrow">Espace candidat</span>
          <h1 style={{ marginTop: 4, fontSize: 28 }}>Mes candidatures</h1>
        </div>
        {data && (
          <div className="ledger">
            <strong>{data.count}</strong>
            <span>candidature{data.count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Filtre par statut */}
      <div className="filters-bar" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setParam('status', '')}
        >
          Toutes
        </button>
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`btn btn-sm ${statusFilter === s.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setParam('status', s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading && <Loader />}

      {!loading && data?.results.length === 0 && (
        <EmptyState
          glyph="📭"
          title="Aucune candidature"
          hint={statusFilter ? 'Aucune candidature avec ce statut.' : "Vous n'avez pas encore postulé à une offre."}
          action={<Link to="/offres" className="btn btn-primary btn-sm">Parcourir les offres</Link>}
        />
      )}

      {!loading && data && data.results.length > 0 && (
        <>
          <div className="stack" style={{ gap: 12 }}>
            {data.results.map((a) => (
              <div key={a.id} className="card card-pad">
                <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/offres/${a.job_slug}`}
                      style={{ fontWeight: 600, fontSize: 15.5, color: 'inherit', textDecoration: 'none' }}
                      onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
                      onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
                    >
                      {a.job_title}
                    </Link>
                    <div className="muted" style={{ fontSize: 13.5, marginTop: 2 }}>
                      {a.company_name}
                      {a.job_type && (
                        <span style={{ marginLeft: 8 }}>
                          · {labelFor(JOB_TYPES, a.job_type)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
                    <span className={`badge ${statusBadgeClass(a.status)}`}>
                      {labelFor(APPLICATION_STATUSES, a.status)}
                    </span>
                  </div>
                </div>

                {a.cover_letter && (
                  <p className="muted" style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5 }}>
                    {a.cover_letter.length > 200 ? a.cover_letter.slice(0, 200) + '…' : a.cover_letter}
                  </p>
                )}

                <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
                  Envoyée {timeAgo(a.applied_at)}
                  {a.updated_at !== a.applied_at && (
                    <span> · Mise à jour {formatDate(a.updated_at)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination count={data.count} page={page} onChange={(p) => setParam('page', p)} />
        </>
      )}
    </div>
  );
}
