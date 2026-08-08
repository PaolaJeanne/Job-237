import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCompanies } from '../api/companies';
import CompanyCard from '../components/CompanyCard';
import Pagination from '../components/Pagination';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';
import { COMPANY_SIZES } from '../constants';

export default function CompaniesList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = params.get('search') || '';
  const industry = params.get('industry') || '';
  const size = params.get('size') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    setLoading(true);
    fetchCompanies({
      page,
      ...(search && { search }),
      ...(industry && { industry }),
      ...(size && { size }),
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, industry, size, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const clearFilters = () => {
    setParams({});
  };

  const hasFilters = search || industry || size;

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Entreprises' }]} />
      <div className="section-head">
        <div>
          <span className="eyebrow">Annuaire</span>
          <h1 style={{ marginTop: 4, fontSize: 30 }}>Entreprises qui recrutent</h1>
        </div>
        <div className="row" style={{ gap: 10 }}>
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <Link to="/recruteur/entreprises/nouvelle" className="btn btn-primary btn-sm">+ Créer une entreprise</Link>
          )}
          <div className="ledger">
            <strong>{data?.count ?? '···'}</strong>
            <span>Entreprises</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          placeholder="Nom, secteur, description…"
          defaultValue={search}
          key={search} // force reset when cleared
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
          onBlur={(e) => updateParam('search', e.target.value)}
        />
        <input
          placeholder="Secteur d'activité (ex : Technologie)"
          defaultValue={industry}
          key={`ind-${industry}`}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('industry', e.target.value)}
          onBlur={(e) => updateParam('industry', e.target.value)}
        />
        <select
          value={size}
          onChange={(e) => updateParam('size', e.target.value)}
        >
          <option value="">Toutes les tailles</option>
          {COMPANY_SIZES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button type="button" className="btn btn-outline btn-sm" onClick={clearFilters}>
            Effacer les filtres
          </button>
        )}
      </div>

      {loading && <Loader />}
      {!loading && data?.results.length === 0 && (
        <EmptyState glyph="🏢" title="Aucune entreprise trouvée" hint="Modifiez vos filtres de recherche." />
      )}
      {!loading && data && data.results.length > 0 && (
        <>
          <div className="grid grid-jobs">
            {data.results.map((c) => (
              <CompanyCard key={c.id} company={c} />
            ))}
          </div>
          <Pagination count={data.count} page={page} onChange={(p) => updateParam('page', p)} />
        </>
      )}
    </div>
  );
}
