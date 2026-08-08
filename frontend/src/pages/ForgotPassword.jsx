import { useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await client.post('/auth/password-reset/', { email });
      setSubmitted(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-shell">
        <div className="card card-pad auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
          <h1 style={{ fontSize: 22 }}>Vérifiez votre boîte mail</h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            Si un compte est associé à <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous peu.
          </p>
          <Link to="/connexion" className="btn btn-primary btn-block">Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="card card-pad auth-card">
        <span className="eyebrow">Job237</span>
        <h1>Mot de passe oublié ?</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
          <Link to="/connexion" style={{ color: 'var(--forest)' }}>← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}
