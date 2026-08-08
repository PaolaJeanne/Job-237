import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchJobs, fetchCategories, fetchFavorites, toggleFavorite } from '../api/jobs';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../constants';

export default function JobsList() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const search = params.get('search') || '';
  const jobType = params.get('job_type') || '';
  const experience = params.get('experience_level') || '';
  const remote = params.get('is_remote') || '';
  const category = params.get('category') || '';
  const ordering = params.get('ordering') || '-created_at';
  const page = Number(params.get('page') || 1);

  const load = useCallback(() => {
    setLoading(true);
    const query = {
      page,
      ordering,
      ...(search && { search }),
      ...(jobType && { job_type: jobType }),
      ...(experience && { experience_level: experience }),
      ...(remote && { is_remote: remote }),
      ...(category && { category }),
    };
    fetchJobs(query)
      .then(setData)
      .finally(() => setLoading(false));
  }, [search, jobType, experience, remote, category, ordering, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites()
        .then((d) => {
          const list = d.results || d;
          setFavoriteIds(new Set(list.map((f) => f.job)));
        })
        .catch(() => setFavoriteIds(new Set()));
    } else {
      setFavoriteIds(new Set());
    }
  }, [user]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const handleToggleFavorite = async (job) => {
    if (!user) return;
    await toggleFavorite(job.id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(job.id)) next.delete(job.id);
      else next.add(job.id);
      return next;
    });
  };

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Offres d\'emploi' }]} />
      <div className="section-head">
        <div>
          <span className="eyebrow">Recherche</span>
          <h1 style={{ marginTop: 4, fontSize: 30 }}>Offres d'emploi</h1>
        </div>
        <div className="row" style={{ gap: 10 }}>
          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <Link to="/recruteur/offres/nouvelle" className="btn btn-primary btn-sm">+ Publier une offre</Link>
          )}
          <div className="ledger">
            <strong>{data?.count ?? '···'}</strong>
            <span>Résultats</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          placeholder="Rechercher un poste, une entreprise…"
          defaultValue={search}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('search', e.target.value)}
          onBlur={(e) => updateParam('search', e.target.value)}
        />
        <select value={jobType} onChange={(e) => updateParam('job_type', e.target.value)}>
          <option value="">Type de contrat</option>
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select value={experience} onChange={(e) => updateParam('experience_level', e.target.value)}>
          <option value="">Niveau d'expérience</option>
          {EXPERIENCE_LEVELS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={remote} onChange={(e) => updateParam('is_remote', e.target.value)}>
          <option value="">Sur site ou distance</option>
          <option value="true">Télétravail uniquement</option>
        </select>
        <select value={ordering} onChange={(e) => updateParam('ordering', e.target.value)}>
          <option value="-created_at">Plus récentes</option>
          <option value="-salary_min">Salaire décroissant</option>
          <option value="-views_count">Plus consultées</option>
        </select>
      </div>

      {loading && <Loader />}

      {!loading && data && data.results.length === 0 && (
        <EmptyState glyph="🔍" title="Aucune offre ne correspond" hint="Essayez d'élargir vos critères de recherche." />
      )}

      {!loading && data && data.results.length > 0 && (
        <>
          <div className="grid grid-jobs">
            {data.results.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                favorited={favoriteIds.has(job.id)}
                onToggleFavorite={user ? handleToggleFavorite : undefined}
              />
            ))}
          </div>
          <Pagination count={data.count} page={page} onChange={(p) => updateParam('page', p)} />
        </>
      )}
    </div>
  );
}
