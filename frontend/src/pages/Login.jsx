import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const successMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || '/tableau-de-bord', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Email ou mot de passe incorrect."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="card card-pad auth-card">
        <span className="eyebrow">Job237</span>
        <h1>Content de vous revoir</h1>
        <p className="muted" style={{ marginBottom: 24 }}>
          Connectez-vous pour gérer vos candidatures et vos offres.
        </p>
        {successMessage && <div className="alert alert-ok">{successMessage}</div>}
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
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 20, textAlign: 'center' }}>
          Pas encore de compte ? <Link to="/inscription" style={{ color: 'var(--forest)', fontWeight: 600 }}>Inscrivez-vous</Link>
        </p>
        <p className="muted" style={{ marginTop: 8, textAlign: 'center' }}>
          <Link to="/mot-de-passe-oublie" style={{ color: 'var(--forest)' }}>Mot de passe oublié ?</Link>
        </p>
      </div>
    </div>
  );
}
