import { useEffect, useState } from 'react';
import { fetchUsers, updateUser } from '../api/admin';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader } from '../components/Feedback';
import { formatDate } from '../constants';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'candidate', label: 'Candidat' },
  { value: 'recruiter', label: 'Recruteur' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers().then(setData).catch(() => setData({ count: 0, counts: {}, results: [] }));
  }, []);

  const handleToggleActive = async (u) => {
    setUpdating(u.id);
    setError('');
    try {
      const updated = await updateUser(u.id, { is_active: !u.is_active });
      setData((d) => ({
        ...d,
        results: d.results.map((x) => (x.id === u.id ? updated : x)),
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Impossible de modifier cet utilisateur.');
    } finally {
      setUpdating(null);
    }
  };

  const handleRoleChange = async (u, role) => {
    if (role === u.role) return;
    setUpdating(u.id);
    setError('');
    try {
      const updated = await updateUser(u.id, { role });
      setData((d) => ({
        ...d,
        results: d.results.map((x) => (x.id === u.id ? updated : x)),
        counts: recalcCounts(d.results.map((x) => (x.id === u.id ? updated : x))),
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Impossible de modifier le rôle.');
    } finally {
      setUpdating(null);
    }
  };

  const handleVerify = async (u) => {
    setUpdating(u.id);
    setError('');
    try {
      const updated = await updateUser(u.id, { is_verified: !u.is_verified });
      setData((d) => ({
        ...d,
        results: d.results.map((x) => (x.id === u.id ? updated : x)),
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Impossible de modifier la vérification.');
    } finally {
      setUpdating(null);
    }
  };

  function recalcCounts(users) {
    return {
      total: users.length,
      candidates: users.filter((u) => u.role === 'candidate').length,
      recruiters: users.filter((u) => u.role === 'recruiter').length,
      admins: users.filter((u) => u.role === 'admin').length,
    };
  }

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Utilisateurs' }]} />
      <span className="eyebrow">Administration</span>
      <h1 style={{ marginTop: 4, fontSize: 28, marginBottom: 24 }}>Gestion des utilisateurs</h1>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      {data && (
        <div className="stat-row" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-card-icon">👥</div>
            <div className="stat-card-body">
              <strong>{data.counts?.total || 0}</strong>
              <span>Total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🙋</div>
            <div className="stat-card-body">
              <strong>{data.counts?.candidates || 0}</strong>
              <span>Candidats</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🏢</div>
            <div className="stat-card-body">
              <strong>{data.counts?.recruiters || 0}</strong>
              <span>Recruteurs</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">⚙️</div>
            <div className="stat-card-body">
              <strong>{data.counts?.admins || 0}</strong>
              <span>Administrateurs</span>
            </div>
          </div>
        </div>
      )}

      {!data ? <Loader /> : (
        <div className="card card-pad" style={{ overflowX: 'auto' }}>
          <table className="table-list">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Vérifié</th>
                <th>Statut</th>
                <th>Inscrit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((u) => (
                <tr key={u.id} style={{ opacity: u.is_active ? 1 : 0.6 }}>
                  <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.id === me?.id ? (
                      /* Ne pas permettre à l'admin de changer son propre rôle via le tableau */
                      <span className="badge badge-gold">Admin (vous)</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={updating === u.id}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        style={{ fontSize: 13, padding: '2px 6px', borderRadius: 4 }}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${u.is_verified ? 'badge-ok' : 'badge-clay'}`}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                      title={u.is_verified ? 'Cliquer pour retirer la vérification' : 'Cliquer pour vérifier'}
                      disabled={updating === u.id}
                      onClick={() => handleVerify(u)}
                    >
                      {u.is_verified ? '✓ Vérifié' : '✕ Non vérifié'}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-ok' : 'badge-clay'}`}>
                      {u.is_active ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="muted">{formatDate(u.created_at)}</td>
                  <td>
                    {u.id !== me?.id && (
                      <button
                        type="button"
                        className={`btn btn-sm ${u.is_active ? 'btn-outline' : 'btn-primary'}`}
                        style={u.is_active ? { color: 'var(--clay)' } : {}}
                        disabled={updating === u.id}
                        onClick={() => handleToggleActive(u)}
                      >
                        {updating === u.id ? '…' : u.is_active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
