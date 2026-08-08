import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchJob, applyToJob, toggleFavorite } from '../api/jobs';
import { fetchComments, postComment, deleteComment } from '../api/comments';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader, EmptyState } from '../components/Feedback';
import {
  formatSalary,
  formatDate,
  labelFor,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  mediaUrl,
  timeAgo,
} from '../constants';

export default function JobDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  useEffect(() => {
    fetchJob(slug)
      .then((data) => {
        setJob(data);
        setFavorited(data.is_favorited);
        fetchComments(data.id).then(setComments).finally(() => setCommentsLoaded(true));
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="container section">
        <EmptyState glyph="✕" title="Offre introuvable" hint="Cette offre a peut-être été retirée." />
      </div>
    );
  }
  if (!job) return <Loader />;

  const salary = formatSalary(job.salary_min, job.salary_max);
  const isOwner = user && user.role === 'recruiter';

  const handleFavorite = async () => {
    if (!user) return navigate('/connexion');
    await toggleFavorite(job.id);
    setFavorited((f) => !f);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('cover_letter', coverLetter);
      if (cvFile) formData.append('cv_file', cvFile);
      await applyToJob(job.id, formData);
      setSuccess('Votre candidature a bien été envoyée.');
      setApplying(false);
      setJob((j) => ({ ...j, has_applied: true }));
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || "Impossible d'envoyer la candidature.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section">
      <Breadcrumbs crumbs={[{ label: 'Offres', path: '/offres' }, { label: job?.title || '…' }]} />
      {job && (<div className="grid grid-2">
        <div>
          <div className="row" style={{ gap: 16, marginBottom: 20 }}>
            <div className="logo-tile" style={{ width: 64, height: 64, fontSize: 22 }}>
              {job.company.logo ? (
                <img src={mediaUrl(job.company.logo)} alt="" />
              ) : (
                job.company.name.slice(0, 1)
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 28, marginBottom: 4 }}>{job.title}</h1>
              <Link to={`/entreprises/${job.company.slug}`} className="muted" style={{ fontWeight: 600 }}>
                {job.company.name}
              </Link>
            </div>
          </div>

          <div className="job-card-tags" style={{ marginBottom: 24 }}>
            <span className="badge badge-forest">{labelFor(JOB_TYPES, job.job_type)}</span>
            {job.experience_level && (
              <span className="badge">{labelFor(EXPERIENCE_LEVELS, job.experience_level)}</span>
            )}
            {job.is_remote && <span className="badge badge-gold">Télétravail</span>}
            <span className="badge">{job.location}</span>
            {job.is_premium && <span className="badge badge-gold">★ Premium</span>}
          </div>

          {success && <div className="alert alert-ok">{success}</div>}

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3>Description du poste</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{job.description}</p>
            {job.requirements && (
              <>
                <h3 style={{ marginTop: 20 }}>Exigences</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{job.requirements}</p>
              </>
            )}
          </div>

          {user && user.role === 'candidate' && (
            <div className="card card-pad">
              {job.has_applied ? (
                <div className="alert alert-ok" style={{ margin: 0 }}>
                  Vous avez déjà postulé à cette offre.
                </div>
              ) : applying ? (
                <form onSubmit={handleApply}>
                  <h3>Votre candidature</h3>
                  {error && <div className="alert alert-error">{error}</div>}
                  <div className="field">
                    <label>Lettre de motivation</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Expliquez pourquoi vous êtes fait(e) pour ce poste…"
                    />
                  </div>
                  <div className="field">
                    <label>CV (PDF, Word…)</label>
                    <input type="file" onChange={(e) => setCvFile(e.target.files[0])} />
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <button className="btn btn-primary" disabled={submitting} type="submit">
                      {submitting ? 'Envoi…' : 'Envoyer ma candidature'}
                    </button>
                    <button className="btn btn-outline" type="button" onClick={() => setApplying(false)}>
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <button className="btn btn-primary" onClick={() => setApplying(true)} type="button">
                  Postuler à cette offre
                </button>
              )}
            </div>
          )}

          {!user && (
            <div className="card card-pad row" style={{ justifyContent: 'space-between' }}>
              <span>Connectez-vous pour postuler à cette offre.</span>
              <Link to="/connexion" className="btn btn-primary btn-sm">
                Se connecter
              </Link>
            </div>
          )}

          {isOwner && (
            <div className="card card-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span className="muted">Vous consultez cette offre en tant que recruteur.</span>
              <Link to={`/recruteur/offres/${job.id}/candidatures`} className="btn btn-primary btn-sm">
                Voir les candidatures
              </Link>
            </div>
          )}
        </div>

        <aside className="stack" style={{ gap: 16 }}>
          <div className="card card-pad">
            <button
              className={`btn btn-block ${favorited ? 'btn-gold' : 'btn-outline'}`}
              onClick={handleFavorite}
              type="button"
            >
              {favorited ? '♥ Dans vos favoris' : '♡ Ajouter aux favoris'}
            </button>
          </div>

          <div className="card card-pad stack" style={{ gap: 14 }}>
            <h3 style={{ marginBottom: 0 }}>Détails de l'offre</h3>
            <Detail label="Salaire" value={salary || 'Non précisé'} />
            <Detail label="Date limite" value={job.deadline ? formatDate(job.deadline) : 'Non précisée'} />
            <Detail label="Publiée" value={timeAgo(job.created_at)} />
            <Detail label="Candidatures reçues" value={job.applications_count} />
            <Detail label="Vues" value={job.views_count} />
          </div>

          <div className="card card-pad">
            <h3>À propos de {job.company.name}</h3>
            <p className="muted" style={{ fontSize: 14 }}>{job.company.description}</p>
            <Link to={`/entreprises/${job.company.slug}`} className="btn btn-outline btn-sm btn-block">
              Voir le profil entreprise
            </Link>
          </div>
        </aside>
      </div>)}

      {/* Section commentaires */}
      {job && (
        <CommentsSection
          jobId={job.id}
          comments={comments}
          setComments={setComments}
          loaded={commentsLoaded}
        />
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <span className="muted" style={{ fontSize: 13.5 }}>{label}</span>
      <strong style={{ fontSize: 13.5 }}>{value}</strong>
    </div>
  );
}

/* ─── Section commentaires ─── */

function CommentsSection({ jobId, comments, setComments, loaded }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null); // { id, author_name }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      const payload = { job: jobId, body: body.trim() };
      if (replyTo) payload.parent = replyTo.id;
      const created = await postComment(payload);
      if (replyTo) {
        // Insérer la réponse dans le bon commentaire parent
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...(c.replies || []), created] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, { ...created, replies: [] }]);
      }
      setBody('');
      setReplyTo(null);
    } catch {
      setError('Impossible de poster le commentaire.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId, parentId) => {
    await deleteComment(commentId);
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const startReply = (comment) => {
    setReplyTo({ id: comment.id, author_name: comment.author_name });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const totalCount = comments.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);

  return (
    <div style={{ marginTop: 32 }}>
      <h2 style={{ fontSize: 18, marginBottom: 20 }}>
        Commentaires{totalCount > 0 && <span className="muted" style={{ fontSize: 14, marginLeft: 8 }}>({totalCount})</span>}
      </h2>

      {!loaded && <Loader />}

      {loaded && comments.length === 0 && (
        <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>Aucun commentaire pour le moment. Soyez le premier à réagir.</p>
      )}

      <div className="stack" style={{ gap: 12, marginBottom: 24 }}>
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            onReply={startReply}
            onDelete={(id) => handleDelete(id, null)}
            onDeleteReply={(id) => handleDelete(id, c.id)}
          />
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="card card-pad">
          {replyTo && (
            <div className="row" style={{ gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <span className="muted" style={{ fontSize: 13 }}>
                ↩ Répondre à <strong>{replyTo.author_name}</strong>
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
          {error && <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>}
          <div className="field" style={{ marginBottom: 10 }}>
            <textarea
              ref={inputRef}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={replyTo ? `Répondre à ${replyTo.author_name}…` : 'Posez une question ou partagez votre avis sur cette offre…'}
            />
          </div>
          <button className="btn btn-primary btn-sm" disabled={submitting || !body.trim()} type="submit">
            {submitting ? 'Envoi…' : replyTo ? 'Répondre' : 'Commenter'}
          </button>
        </form>
      ) : (
        <div className="card card-pad row" style={{ justifyContent: 'space-between' }}>
          <span className="muted">Connectez-vous pour laisser un commentaire.</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/connexion')} type="button">
            Se connecter
          </button>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, onReply, onDelete, onDeleteReply }) {
  return (
    <div className="card card-pad" style={{ paddingBottom: 12 }}>
      <CommentRow comment={comment} onReply={onReply} onDelete={onDelete} showReply />
      {comment.replies?.length > 0 && (
        <div style={{ marginLeft: 24, marginTop: 12, borderLeft: '2px solid var(--line)', paddingLeft: 14 }}>
          <div className="stack" style={{ gap: 10 }}>
            {comment.replies.map((r) => (
              <CommentRow key={r.id} comment={r} onDelete={onDeleteReply} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentRow({ comment, onReply, onDelete, showReply }) {
  const { user } = useAuth();
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--forest)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}
          >
            {comment.author_name?.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong style={{ fontSize: 13.5 }}>{comment.author_name}</strong>
            {comment.author_role && (
              <span className="muted" style={{ fontSize: 12, marginLeft: 6 }}>
                {comment.author_role === 'recruiter' ? '· Recruteur' : comment.author_role === 'candidate' ? '· Candidat' : ''}
              </span>
            )}
          </div>
          <span className="muted" style={{ fontSize: 11 }}>{timeAgo(comment.created_at)}</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {showReply && user && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onReply(comment)}>
              ↩ Répondre
            </button>
          )}
          {comment.is_own && (
            <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--clay)' }} onClick={() => onDelete(comment.id)}>
              Supprimer
            </button>
          )}
        </div>
      </div>
      <p style={{ margin: '8px 0 0 38px', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {comment.body}
      </p>
    </div>
  );
}
