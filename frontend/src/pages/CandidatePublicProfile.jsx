import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPublicCandidateProfile } from '../api/profiles';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader } from '../components/Feedback';
import { labelFor, EDUCATION_LEVELS } from '../constants';

export default function CandidatePublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicCandidateProfile(id)
      .then(setProfile)
      .catch(() => setError('Profil introuvable.'));
  }, [id]);

  if (error) {
    return (
      <div className="container section">
        <div className="alert alert-error">{error}</div>
        <Link to="/offres" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>Retour aux offres</Link>
      </div>
    );
  }

  if (!profile) return <Loader />;

  return (
    <div className="container section" style={{ maxWidth: 760 }}>
      <Breadcrumbs crumbs={[{ label: 'Candidats' }, { label: profile.user_full_name }]} />

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div className="row" style={{ gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Avatar initial */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--forest)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {profile.user_full_name?.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, marginBottom: 4 }}>{profile.user_full_name}</h1>
            {profile.location && (
              <div className="muted" style={{ fontSize: 14 }}>📍 {profile.location}</div>
            )}
            <div className="row" style={{ gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {profile.availability ? (
                <span className="badge badge-ok">Disponible</span>
              ) : (
                <span className="badge badge-clay">Non disponible</span>
              )}
              {profile.education_level && (
                <span className="badge">{labelFor(EDUCATION_LEVELS, profile.education_level)}</span>
              )}
              {profile.experience_years > 0 && (
                <span className="badge badge-forest">
                  {profile.experience_years} an{profile.experience_years > 1 ? 's' : ''} d'expérience
                </span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              À propos
            </h3>
            <p style={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>{profile.bio}</p>
          </div>
        )}
      </div>

      {profile.skills && profile.skills.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Compétences
          </h3>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {profile.skills.map((s, i) => (
              <span key={i} className="badge badge-forest">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="card card-pad">
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Informations
        </h3>
        <div className="form-row" style={{ gap: 12 }}>
          {profile.education_level && (
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 2 }}>Niveau d'étude</div>
              <div style={{ fontWeight: 500 }}>{labelFor(EDUCATION_LEVELS, profile.education_level)}</div>
            </div>
          )}
          {profile.experience_years !== undefined && (
            <div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 2 }}>Expérience</div>
              <div style={{ fontWeight: 500 }}>
                {profile.experience_years} an{profile.experience_years > 1 ? 's' : ''}
              </div>
            </div>
          )}
          <div>
            <div className="muted" style={{ fontSize: 12, marginBottom: 2 }}>Disponibilité</div>
            <div style={{ fontWeight: 500 }}>{profile.availability ? 'Immédiate' : 'Non disponible'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
