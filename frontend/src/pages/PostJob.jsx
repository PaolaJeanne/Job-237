import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createJob, fetchCategories } from '../api/jobs';
import { fetchMyCompanies } from '../api/companies';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../constants';

const empty = {
  title: '', description: '', requirements: '', location: '', is_remote: false,
  job_type: 'full_time', experience_level: '', salary_min: '', salary_max: '',
  deadline: '', company: '', category: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyCompanies()
      .then((d) => {
        const list = d.results || d;
        setCompanies(list);
        if (list.length === 1) setForm((f) => ({ ...f, company: list[0].id }));
      })
      .catch(() => setCompanies([]));
    fetchCategories()
      .then((d) => setCategories(d.results || d))
      .catch(() => {});
  }, []);

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min || null,
        salary_max: form.salary_max || null,
        deadline: form.deadline || null,
        category: form.category || null,
      };
      await createJob(payload);
      navigate('/tableau-de-bord');
    } catch (err) {
      const d = err.response?.data;
      const firstError = d && Object.values(d)[0];
      setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Impossible de publier l\'offre.');
    } finally {
      setSubmitting(false);
    }
  };

  if (companies === null) return <Loader />;

  if (companies.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          glyph="🏢"
          title="Créez d'abord votre entreprise"
          hint="Vous devez avoir une entreprise enregistrée pour publier une offre."
          action={<Link to="/recruteur/entreprises/nouvelle" className="btn btn-primary btn-sm">Créer mon entreprise</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Publier une offre' }]} />
      <span className="eyebrow">Espace recruteur</span>
      <h1 style={{ marginTop: 4, fontSize: 26, marginBottom: 24 }}>Publier une offre</h1>

      <form onSubmit={submit} className="card card-pad">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Entreprise</label>
          <select required value={form.company} onChange={update('company')}>
            <option value="">Sélectionner…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Titre du poste</label>
          <input required value={form.title} onChange={update('title')} placeholder="Ex : Développeur Backend Django" />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea required value={form.description} onChange={update('description')} />
        </div>
        <div className="field">
          <label>Exigences</label>
          <textarea value={form.requirements} onChange={update('requirements')} />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Type de contrat</label>
            <select value={form.job_type} onChange={update('job_type')}>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Niveau d'expérience</label>
            <select value={form.experience_level} onChange={update('experience_level')}>
              <option value="">—</option>
              {EXPERIENCE_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Lieu</label>
            <input required value={form.location} onChange={update('location')} placeholder="Douala, Cameroun" />
          </div>
          <div className="field">
            <label>Catégorie</label>
            <select value={form.category} onChange={update('category')}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Salaire min (FCFA)</label>
            <input type="number" min="0" value={form.salary_min} onChange={update('salary_min')} />
          </div>
          <div className="field">
            <label>Salaire max (FCFA)</label>
            <input type="number" min="0" value={form.salary_max} onChange={update('salary_max')} />
          </div>
        </div>
        <div className="field">
          <label>Date limite de candidature</label>
          <input type="date" value={form.deadline} onChange={update('deadline')} />
        </div>
        <div className="field check-row">
          <input type="checkbox" id="is_remote" checked={form.is_remote} onChange={update('is_remote')} />
          <label htmlFor="is_remote" style={{ marginBottom: 0 }}>Télétravail possible</label>
        </div>
        <button className="btn btn-primary" disabled={submitting} type="submit">
          {submitting ? 'Publication…' : 'Publier l\'offre'}
        </button>
      </form>
    </div>
  );
}
