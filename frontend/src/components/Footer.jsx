import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MEDIA_BASE } from '../constants';

export default function Footer() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === 'admin';
  const isRecruiter = role === 'recruiter';
  const isCandidate = role === 'candidate';

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              Job<span className="mark">237</span>
            </div>
            <p style={{ maxWidth: 320, lineHeight: 1.6 }}>
              La plateforme qui connecte les talents camerounais aux entreprises qui recrutent,
              de Douala à Yaoundé et au-delà.
            </p>
          </div>

          <div>
            <h4>{isAdmin ? 'Administration' : isRecruiter ? 'Recrutement' : isCandidate ? 'Candidats' : 'La plateforme'}</h4>
            <ul>
              {isAdmin ? (
                <>
                  <li><Link to="/tableau-de-bord">Tableau de bord</Link></li>
                  <li><Link to="/admin/utilisateurs">Utilisateurs</Link></li>
                  <li><Link to="/offres">Offres</Link></li>
                  <li><Link to="/entreprises">Entreprises</Link></li>
                </>
              ) : isRecruiter ? (
                <>
                  <li><Link to="/recruteur/offres/nouvelle">Publier une offre</Link></li>
                  <li><Link to="/recruteur/entreprises">Mes entreprises</Link></li>
                  <li><Link to="/recruteur/entreprises/nouvelle">Créer une entreprise</Link></li>
                </>
              ) : isCandidate ? (
                <>
                  <li><Link to="/offres">Parcourir les offres</Link></li>
                  <li><Link to="/entreprises">Explorer les entreprises</Link></li>
                  <li><Link to="/mes-candidatures">Mes candidatures</Link></li>
                  <li><Link to="/favoris">Mes favoris</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/offres">Nos offres</Link></li>
                  <li><Link to="/entreprises">Entreprises</Link></li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4>Mon compte</h4>
            <ul>
              {isAdmin ? (
                <>
                  <li><Link to="/profil">Mon profil</Link></li>
                  <li><Link to="/messagerie">Messagerie</Link></li>
                  <li>
                    <a href={`${MEDIA_BASE}/admin/`} target="_blank" rel="noopener noreferrer">Django Admin</a>
                  </li>
                </>
              ) : isRecruiter ? (
                <>
                  <li><Link to="/tableau-de-bord">Tableau de bord</Link></li>
                  <li><Link to="/profil">Mon profil</Link></li>
                  <li><Link to="/messagerie">Messagerie</Link></li>
                </>
              ) : isCandidate ? (
                <>
                  <li><Link to="/tableau-de-bord">Tableau de bord</Link></li>
                  <li><Link to="/profil">Mon profil</Link></li>
                  <li><Link to="/messagerie">Messagerie</Link></li>
                  <li><Link to="/mot-de-passe-oublie">Mot de passe oublié</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/connexion">Se connecter</Link></li>
                  <li><Link to="/inscription">Créer un compte</Link></li>
                  <li><Link to="/mot-de-passe-oublie">Mot de passe oublié</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Job237. Tous droits réservés.</span>
          <span>Fait avec soin pour l'emploi au Cameroun 🇨🇲</span>
        </div>
      </div>
    </footer>
  );
}
