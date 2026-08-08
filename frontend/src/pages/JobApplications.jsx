import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchApplicationsForJob, updateApplicationStatus } from '../api/jobs';
import { fetchNotes, createNote, updateNote, deleteNote } from '../api/notes';
import { startConversation } from '../api/messaging';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import { APPLICATION_STATUSES, statusBadgeClass, timeAgo, mediaUrl } from '../constants';

export default function JobApplications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [expanded, setExpanded] = useState(null); // id candidature ouverte (notes)

  useEffect(() => {
    fetchApplicationsForJob(jobId).then((d) => setApplications(d.results || d));
  }, [jobId]);

  const handleStatusChange = async (app, status) => {
    setUpdating(app.id);
    try {
      const updated = await updateApplicationStatus(jobId, app.id, status);
      setApplications((list) => list.map((a) => (a.id === app.id ? updated : a)));
    } finally {
      setUpdating(null);
    }
  };

  const handleContact = async (app) => {
    try {
      const conv = await startConversation({ recipient_id: app.candidate_id, application_id: app.id });
      navigate(`/messagerie/${conv.id}`);
    } catch { /* silent */ }
  };

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Candidatures' }]} />
      <h1 style={{ fontSize: 26, marginBottom: 24 }}>
        Candidatures {applications?.[0] ? `— ${applications[0].job_title}` : ''}
      </h1>

      {applications === null && <Loader />}
      {applications?.length === 0 && (
        <EmptyState glyph="📭" title="Aucune candidature reçue" hint="Les candidatures apparaîtront ici dès qu'elles arriveront." />
      )}

      {applications?.length > 0 && (
        <div className="stack" style={{ gap: 14 }}>
          {applications.map((a) => (
            <div key={a.id} className="card card-pad">
              {/* ── En-tête candidat ── */}
              <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15.5 }}>{a.candidate_name}</div>
                  <div className="muted" style={{ fontSize: 13.5 }}>{a.candidate_email}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    Candidature envoyée {timeAgo(a.applied_at)}
                  </div>
                </div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <span className={`badge ${statusBadgeClass(a.status)}`}>
                    {APPLICATION_STATUSES.find((s) => s.value === a.status)?.label}
                  </span>
                  {a.cv_file && (
                    <a
                      href={mediaUrl(a.cv_file)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📄 Voir CV
                    </a>
                  )}
                  {a.candidate_id && (
                    <Link
                      to={`/candidats/${a.candidate_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                    >
                      👤 Profil
                    </Link>
                  )}
                  {a.candidate_id && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleContact(a)}
                    >
                      💬 Contacter
                    </button>
                  )}
                </div>
              </div>

              {/* ── Lettre de motivation ── */}
              {a.cover_letter && (
                <p className="muted" style={{ marginTop: 12, fontSize: 14, lineHeight: 1.6 }}>
                  {a.cover_letter}
                </p>
              )}

              {/* ── Boutons de statut ── */}
              <div className="row" style={{ gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                {APPLICATION_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    className={`btn btn-sm ${a.status === s.value ? 'btn-primary' : 'btn-outline'}`}
                    disabled={updating === a.id}
                    onClick={() => handleStatusChange(a, s.value)}
                    type="button"
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  style={{ marginLeft: 'auto', color: 'var(--forest)' }}
                  onClick={() => setExpanded((p) => (p === a.id ? null : a.id))}
                >
                  📝 Notes {expanded === a.id ? '▲' : '▼'}
                </button>
              </div>

              {/* ── Section Notes (accordéon) ── */}
              {expanded === a.id && (
                <NotesPanel applicationId={a.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Panel notes recruteur ─── */
function NotesPanel({ applicationId }) {
  const [notes, setNotes] = useState(null);
  const [body, setBody] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editBody, setEditBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes(applicationId).then(setNotes).catch(() => setNotes([]));
  }, [applicationId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const note = await createNote(applicationId, body.trim());
      setNotes((prev) => [note, ...(prev || [])]);
      setBody('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (noteId) => {
    if (!editBody.trim()) return;
    const updated = await updateNote(noteId, editBody.trim());
    setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
    setEditingId(null);
  };

  const handleDelete = async (noteId) => {
    await deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 16 }}>
      <h4 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12, color: 'var(--muted)' }}>
        Notes privées (visibles uniquement par vous)
      </h4>

      {/* Formulaire ajout */}
      <form onSubmit={handleCreate} style={{ marginBottom: 14 }}>
        <div className="row" style={{ gap: 8 }}>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ajouter une note sur ce candidat…"
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-sm" disabled={submitting || !body.trim()} type="submit">
            {submitting ? '…' : 'Ajouter'}
          </button>
        </div>
      </form>

      {/* Liste des notes */}
      {notes === null && <Loader />}
      {notes?.length === 0 && (
        <p className="muted" style={{ fontSize: 13 }}>Aucune note pour le moment.</p>
      )}
      <div className="stack" style={{ gap: 8 }}>
        {notes?.map((n) => (
          <div key={n.id} style={{
            background: 'var(--surface-alt, rgba(0,0,0,0.03))',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            {editingId === n.id ? (
              <div className="row" style={{ gap: 8 }}>
                <input
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  style={{ flex: 1 }}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={() => handleUpdate(n.id)} type="button">
                  Sauvegarder
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)} type="button">
                  Annuler
                </button>
              </div>
            ) : (
              <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                <p style={{ fontSize: 13.5, margin: 0, flex: 1 }}>{n.body}</p>
                <div className="row" style={{ gap: 6, flexShrink: 0 }}>
                  <span className="muted" style={{ fontSize: 11 }}>{timeAgo(n.created_at)}</span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => { setEditingId(n.id); setEditBody(n.body); }}
                    type="button"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--clay)' }}
                    onClick={() => handleDelete(n.id)}
                    type="button"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
