import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'candidate',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const registeredUser = await register(form);
      if (registeredUser.role === 'recruiter') {
        navigate('/recruteur/entreprises/nouvelle', { replace: true });
      } else {
        navigate('/tableau-de-bord', { replace: true });
      }
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && Object.values(data)[0];
      setError(Array.isArray(firstError) ? firstError[0] : firstError || 'Inscription impossible.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card card-pad auth-card">
        <span className="eyebrow">Job237</span>
        <h1>Créez votre compte</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Candidat ou recruteur, rejoignez la communauté Job237.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Je suis…</label>
            <div className="role-select">
              <button
                type="button"
                className={`role-card ${form.role === 'candidate' ? 'active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, role: 'candidate' }))}
              >
                <span className="role-card-icon">👤</span>
                <span className="role-card-body">
                  <strong>Candidat</strong>
                  <small>Je cherche un emploi</small>
                </span>
                <span className="role-card-check">{form.role === 'candidate' ? '✓' : ''}</span>
              </button>
              <button
                type="button"
                className={`role-card ${form.role === 'recruiter' ? 'active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, role: 'recruiter' }))}
              >
                <span className="role-card-icon">🏢</span>
                <span className="role-card-body">
                  <strong>Recruteur</strong>
                  <small>Je publie des offres</small>
                </span>
                <span className="role-card-check">{form.role === 'recruiter' ? '✓' : ''}</span>
              </button>
            </div>
            {form.role === 'recruiter' && (
              <p className="hint" style={{ marginTop: 8 }}>
                Après l'inscription, vous créerez le profil de votre entreprise pour pouvoir publier des offres.
              </p>
            )}
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="first_name">Prénom</label>
              <input id="first_name" required value={form.first_name} onChange={update('first_name')} />
            </div>
            <div className="field">
              <label htmlFor="last_name">Nom</label>
              <input id="last_name" required value={form.last_name} onChange={update('last_name')} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="email">Adresse email</label>
            <input id="email" type="email" required value={form.email} onChange={update('email')} />
          </div>
          <div className="form-row">
            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={update('password')}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="password_confirm">Confirmer</label>
              <div className="input-wrap">
                <input
                  id="password_confirm"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={form.password_confirm}
                  onChange={update('password_confirm')}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
          Déjà inscrit ? <Link to="/connexion" style={{ color: 'var(--forest)', fontWeight: 600 }}>Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
}
