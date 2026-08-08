import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCompany, updateCompany, fetchCompany } from '../api/companies';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader } from '../components/Feedback';
import { COMPANY_SIZES } from '../constants';

const empty = {
  name: '', slug: '', description: '', website: '', email: '', phone: '',
  location: '', industry: '', size: '', founded_year: '',
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CompanyForm() {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetchCompany(slug).then((c) => {
        setForm({ ...empty, ...c, founded_year: c.founded_year || '' });
        setLoading(false);
      });
    }
  }, [slug, isEdit]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateName = (e) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') data.append(k, v);
      });
      if (logoFile) data.append('logo', logoFile);

      const company = isEdit ? await updateCompany(slug, data) : await createCompany(data);
      navigate(isEdit ? `/entreprises/${company.slug}` : '/recruteur/offres/nouvelle');
    } catch (err) {
      const d = err.response?.data;
      const firstError = d && Object.values(d)[0];
      setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Impossible d\'enregistrer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <Breadcrumbs crumbs={[{ label: 'Mes entreprises', path: '/recruteur/entreprises' }, { label: isEdit ? 'Modifier' : 'Nouvelle' }]} />
      <span className="eyebrow">Espace recruteur</span>
      <h1 style={{ marginTop: 4, fontSize: 26, marginBottom: 24 }}>
        {isEdit ? 'Modifier l\'entreprise' : 'Créer une entreprise'}
      </h1>

      <form onSubmit={submit} className="card card-pad">
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label>Nom de l'entreprise</label>
          <input required value={form.name} onChange={updateName} />
        </div>
        <div className="field">
          <label>Identifiant (slug)</label>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update('slug')(e);
            }}
          />
          <p className="hint">Utilisé dans l'URL : /entreprises/{form.slug || '…'}</p>
        </div>
        <div className="field">
          <label>Description</label>
          <textarea required value={form.description} onChange={update('description')} />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Secteur d'activité</label>
            <input required value={form.industry} onChange={update('industry')} />
          </div>
          <div className="field">
            <label>Taille</label>
            <select value={form.size} onChange={update('size')}>
              <option value="">—</option>
              {COMPANY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Localisation</label>
            <input required value={form.location} onChange={update('location')} placeholder="Douala, Cameroun" />
          </div>
          <div className="field">
            <label>Année de fondation</label>
            <input type="number" value={form.founded_year} onChange={update('founded_year')} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Email de contact</label>
            <input type="email" required value={form.email} onChange={update('email')} />
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={form.phone} onChange={update('phone')} />
          </div>
        </div>
        <div className="field">
          <label>Site web</label>
          <input value={form.website} onChange={update('website')} placeholder="https://…" />
        </div>
        <div className="field">
          <label>Logo</label>
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
        </div>
        <button className="btn btn-primary" disabled={submitting} type="submit">
          {submitting ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Créer l\'entreprise'}
        </button>
      </form>
    </div>
  );
}
