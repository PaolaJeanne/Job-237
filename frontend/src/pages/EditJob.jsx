import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobForEdit, updateJob, deleteJob } from '../api/jobs';
import { fetchCategories } from '../api/jobs';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader } from '../components/Feedback';
import { JOB_TYPES, EXPERIENCE_LEVELS } from '../constants';

export default function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchJobForEdit(jobId)
      .then((d) => {
        setForm({
          title: d.title || '',
          description: d.description || '',
          requirements: d.requirements || '',
          location: d.location || '',
          is_remote: d.is_remote || false,
          job_type: d.job_type || 'full_time',
          experience_level: d.experience_level || '',
          salary_min: d.salary_min || '',
          salary_max: d.salary_max || '',
          deadline: d.deadline || '',
          category: d.category || '',
          is_active: d.is_active !== undefined ? d.is_active : true,
        });
      })
      .catch(() => setError("Impossible de charger l'offre."));
    fetchCategories().then((d) => setCategories(d.results || d)).catch(() => {});
  }, [jobId]);

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
      await updateJob(jobId, payload);
      navigate('/tableau-de-bord');
    } catch (err) {
      const d = err.response?.data;
      const firstError = d && Object.values(d)[0];
      setError(Array.isArray(firstError) ? firstError[0] : firstError || "Impossible de modifier l'offre.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteJob(jobId);
      navigate('/tableau-de-bord');
    } catch {
      setError("Impossible de supprimer l'offre.");
      setDeleting(false);
    }
  };

  if (!form) return error ? (
    <div className="container section"><div className="alert alert-error">{error}</div></div>
  ) : <Loader />;

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <Breadcrumbs crumbs={[
        { label: 'Tableau de bord', path: '/tableau-de-bord' },
        { label: "Modifier l'offre" },
      ]} />
      <span className="eyebrow">Espace recruteur</span>
      <h1 style={{ marginTop: 4, fontSize: 26, marginBottom: 24 }}>Modifier l'offre</h1>

      <form onSubmit={submit} className="card card-pad">
        {error && <div className="alert alert-error">{error}</div>}

        {/* Statut actif/inactif */}
        <div className="field check-row" style={{ marginBottom: 16 }}>
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={update('is_active')}
          />
          <label htmlFor="is_active" style={{ marginBottom: 0 }}>
            Offre active{' '}
            <span className={`badge ${form.is_active ? 'badge-ok' : 'badge-clay'}`} style={{ marginLeft: 6 }}>
              {form.is_active ? 'Publiée' : 'Désactivée'}
            </span>
          </label>
        </div>

        <div className="field">
          <label>Titre du poste</label>
          <input required value={form.title} onChange={update('title')} />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea required value={form.description} onChange={update('description')} rows={6} />
        </div>
        <div className="field">
          <label>Exigences</label>
          <textarea value={form.requirements} onChange={update('requirements')} rows={4} />
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
            <input required value={form.location} onChange={update('location')} />
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

        <div className="row" style={{ gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary" disabled={submitting} type="submit">
            {submitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
          <button
            type="button"
            className={`btn ${confirmDelete ? 'btn-danger' : 'btn-outline'}`}
            style={{ marginLeft: 'auto' }}
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? 'Suppression…' : confirmDelete ? '⚠️ Confirmer la suppression' : 'Supprimer l\'offre'}
          </button>
          {confirmDelete && (
            <button type="button" className="btn btn-outline" onClick={() => setConfirmDelete(false)}>
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
