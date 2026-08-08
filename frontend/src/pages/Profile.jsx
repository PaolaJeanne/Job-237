import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe, changePassword } from '../api/auth';
import { fetchMyCandidateProfile } from '../api/profiles';
import client from '../api/client';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader } from '../components/Feedback';
import { EDUCATION_LEVELS, mediaUrl } from '../constants';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const tabs = user?.role === 'candidate' ? ['Compte', 'Profil candidat'] : ['Compte'];
  const [tab, setTab] = useState(tabs[0]);

  if (!user) return <Loader />;

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Paramètres' }]} />
      <span className="eyebrow">Paramètres</span>
      <h1 style={{ marginTop: 4, fontSize: 28, marginBottom: 24 }}>Mon profil</h1>

      {tabs.length > 1 && (
        <div className="tabs">
          {tabs.map((t) => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} type="button">
              {t}
            </button>
          ))}
        </div>
      )}

      <div>
        {tab === 'Compte' && <AccountTab user={user} refreshUser={refreshUser} />}
        {tab === 'Profil candidat' && <CandidateProfileTab />}
      </div>
    </div>
  );
}

function AccountTab({ user, refreshUser }) {
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '' });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateMe(form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Impossible de mettre à jour le profil.');
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    setPwError('');
    try {
      await changePassword(pwForm);
      setPwSaved(true);
      setPwForm({ old_password: '', new_password: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.response?.data?.old_password?.[0] || 'Impossible de modifier le mot de passe.');
    }
  };

  return (
    <div className="form-row" style={{ alignItems: 'stretch', gap: 20 }}>
      <form onSubmit={submit} className="card card-pad" style={{ flex: 1, minWidth: 0 }}>
        {saved && <div className="alert alert-ok">Profil mis à jour.</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <h3 style={{ fontSize: 16, marginBottom: 16, fontWeight: 600 }}>Informations personnelles</h3>
        <div className="form-row">
          <div className="field">
            <label>Prénom</label>
            <input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Nom</label>
            <input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Email</label>
            <input value={user.email} disabled />
            <p className="hint">Non modifiable.</p>
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+237 6XX XXX XXX" />
          </div>
        </div>
        <button className="btn btn-primary" type="submit">Enregistrer</button>
      </form>

      <form onSubmit={changePw} className="card card-pad" style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, marginBottom: 16, fontWeight: 600 }}>Mot de passe</h3>
        {pwSaved && <div className="alert alert-ok">Mot de passe modifié avec succès.</div>}
        {pwError && <div className="alert alert-error">{pwError}</div>}
        <div className="field">
          <label>Mot de passe actuel</label>
          <input
            type="password"
            required
            value={pwForm.old_password}
            onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))}
          />
        </div>
        <div className="field">
          <label>Nouveau mot de passe</label>
          <input
            type="password"
            required
            minLength={8}
            value={pwForm.new_password}
            onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
          />
        </div>
        <button className="btn btn-primary" type="submit">Modifier le mot de passe</button>
      </form>
    </div>
  );
}

function CandidateProfileTab() {
  const [profile, setProfile] = useState(null);
  const [skillsText, setSkillsText] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const photoRef = useRef(null);
  const cvRef = useRef(null);

  useEffect(() => {
    fetchMyCandidateProfile().then((p) => {
      setProfile(p);
      setSkillsText((p.skills || []).join(', '));
    });
  }, []);

  if (!profile) return <Loader />;

  const update = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('phone', profile.phone || '');
      formData.append('location', profile.location || '');
      formData.append('bio', profile.bio || '');
      formData.append('experience_years', Number(profile.experience_years) || 0);
      formData.append('education_level', profile.education_level || '');
      formData.append('availability', profile.availability ? 'true' : 'false');
      formData.append('linkedin_url', profile.linkedin_url || '');
      formData.append('portfolio_url', profile.portfolio_url || '');
      // Skills: JSON field — envoyer comme chaîne JSON
      const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      formData.append('skills', JSON.stringify(skills));
      if (photoFile) formData.append('photo', photoFile);
      if (cvFile) formData.append('cv_file', cvFile);

      const { data } = await client.patch('/profile/candidate/', formData);
      setProfile(data);
      setSkillsText((data.skills || []).join(', '));
      setPhotoFile(null);
      setCvFile(null);
      if (photoRef.current) photoRef.current.value = '';
      if (cvRef.current) cvRef.current.value = '';
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const detail = err.response?.data;
      console.error('400 body:', JSON.stringify(detail));
      setError(
        detail
          ? Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
          : 'Impossible de mettre à jour le profil candidat.'
      );
    }
  };

  return (
    <form onSubmit={submit} className="card card-pad">
      {saved && <div className="alert alert-ok">Profil candidat mis à jour.</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Photo de profil */}
      <div className="field" style={{ marginBottom: 20 }}>
        <label>Photo de profil</label>
        <div className="row" style={{ gap: 16, alignItems: 'center' }}>
          {profile.photo ? (
            <img
              src={mediaUrl(profile.photo)}
              alt="Photo de profil"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }}
            />
          ) : (
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--forest)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 700, flexShrink: 0,
              }}
            >
              {profile.user_full_name?.slice(0, 1).toUpperCase() || '?'}
            </div>
          )}
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0] || null)}
            style={{ flex: 1 }}
          />
        </div>
        <p className="hint">Format recommandé : JPG ou PNG, carré, max 2 Mo.</p>
      </div>

      <div className="field">
        <label>Bio</label>
        <textarea value={profile.bio || ''} onChange={update('bio')} placeholder="Présentez-vous en quelques lignes…" rows={4} />
      </div>
      <div className="form-row">
        <div className="field">
          <label>Téléphone</label>
          <input value={profile.phone || ''} onChange={update('phone')} />
        </div>
        <div className="field">
          <label>Localisation</label>
          <input value={profile.location || ''} onChange={update('location')} placeholder="Douala, Cameroun" />
        </div>
      </div>
      <div className="field">
        <label>Compétences (séparées par des virgules)</label>
        <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, Django, Gestion de projet" />
      </div>
      <div className="form-row">
        <div className="field">
          <label>Années d'expérience</label>
          <input type="number" min="0" value={profile.experience_years || 0} onChange={update('experience_years')} />
        </div>
        <div className="field">
          <label>Niveau d'étude</label>
          <select value={profile.education_level || ''} onChange={update('education_level')}>
            <option value="">—</option>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>LinkedIn</label>
          <input value={profile.linkedin_url || ''} onChange={update('linkedin_url')} placeholder="https://linkedin.com/in/…" />
        </div>
        <div className="field">
          <label>Portfolio</label>
          <input value={profile.portfolio_url || ''} onChange={update('portfolio_url')} placeholder="https://…" />
        </div>
      </div>

      {/* CV */}
      <div className="field">
        <label>CV (PDF ou Word)</label>
        {profile.cv_file && (
          <div style={{ marginBottom: 8 }}>
            <a href={mediaUrl(profile.cv_file)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
              📄 Voir le CV actuel
            </a>
          </div>
        )}
        <input
          ref={cvRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setCvFile(e.target.files[0] || null)}
        />
        <p className="hint">PDF ou Word, max 5 Mo. Laissez vide pour conserver le CV actuel.</p>
      </div>

      <div className="field check-row">
        <input
          type="checkbox"
          id="availability"
          checked={profile.availability || false}
          onChange={(e) => setProfile((p) => ({ ...p, availability: e.target.checked }))}
        />
        <label htmlFor="availability" style={{ marginBottom: 0 }}>Disponible immédiatement</label>
      </div>
      <button className="btn btn-primary" type="submit">Enregistrer le profil</button>
    </form>
  );
}
