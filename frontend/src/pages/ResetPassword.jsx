import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const uid = searchParams.get('uid') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Si le token/uid est manquant dans l'URL
  if (!token || !uid) {
    return (
      <div className="auth-shell">
        <div className="card card-pad auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 20 }}>Lien invalide</h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <Link to="/mot-de-passe-oublie" className="btn btn-primary btn-block">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    setSubmitting(true);
    try {
      await client.post('/auth/password-reset/confirm/', { uid, token, new_password: newPassword });
      navigate('/connexion', { state: { message: 'Mot de passe réinitialisé. Connectez-vous.' } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Token invalide ou expiré. Demandez un nouveau lien.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card card-pad auth-card">
        <span className="eyebrow">Job237</span>
        <h1>Nouveau mot de passe</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Choisissez un mot de passe sécurisé (8 caractères minimum).</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="new_password">Nouveau mot de passe</label>
            <div className="input-wrap">
              <input
                id="new_password"
                type={showPwd ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
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
            <label htmlFor="confirm">Confirmer le mot de passe</label>
            <div className="input-wrap">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
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
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
