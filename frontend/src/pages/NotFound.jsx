import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center', padding: '100px 24px' }}>
      <span className="eyebrow">Erreur 404</span>
      <h1 style={{ fontSize: 40, marginTop: 8 }}>Cette page n'existe pas</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Le lien que vous avez suivi est peut-être incorrect ou la page a été déplacée.
      </p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  );
}
