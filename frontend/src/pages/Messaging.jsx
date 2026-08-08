import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchConversations, fetchMessages, sendMessage, startConversation, fetchMessagingContacts } from '../api/messaging';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from '../components/Breadcrumbs';
import { Loader } from '../components/Feedback';
import { timeAgo } from '../constants';

export default function Messaging() {
  const { convId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const openedRef = useRef(null);

  const loadConversations = useCallback(() => {
    fetchConversations()
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Quand l'URL change ou quand les conversations chargent → ouvrir la bonne conv.
  // openedRef évite de rouvrir une conversation déjà ouverte quand la liste
  // est re-settée (reset des non-lus) → empêche la boucle de re-fetch / clignotement.
  useEffect(() => {
    if (!conversations) return;
    const id = convId ? Number(convId) : null;
    if (id) {
      const found = conversations.find((c) => c.id === id);
      if (found) {
        if (openedRef.current !== id) {
          openedRef.current = id;
          openConversation(found);
        }
      } else if (conversations.length > 0) {
        navigate(`/messagerie/${conversations[0].id}`, { replace: true });
      }
    } else if (conversations.length > 0) {
      navigate(`/messagerie/${conversations[0].id}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, convId]);

  const openConversation = useCallback((conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    fetchMessages(conv.id)
      .then((msgs) => {
        setMessages(Array.isArray(msgs) ? msgs : msgs.results || []);
        setConversations((prev) =>
          prev?.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
        );
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, []);

  const openPicker = async () => {
    setShowContacts(true);
    setStartError('');
    setContactsLoading(true);
    try {
      const data = await fetchMessagingContacts();
      setContacts(Array.isArray(data) ? data : data.results || []);
    } catch {
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleStart = async (contact) => {
    if (starting) return;
    setStarting(true);
    setStartError('');
    try {
      const conv = await startConversation({
        recipient_id: contact.id,
        application_id: contact.application_id,
      });
      setShowContacts(false);
      setConversations((prev) => [conv, ...(prev || []).filter((c) => c.id !== conv.id)]);
      navigate(`/messagerie/${conv.id}`);
    } catch (err) {
      setStartError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Impossible d\'ouvrir cette conversation.'
      );
    } finally {
      setStarting(false);
    }
  };

  // Scroll vers le dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeConv) return;
    setSending(true);
    try {
      const msg = await sendMessage(activeConv.id, msgInput.trim());
      setMessages((prev) => [...prev, msg]);
      setMsgInput('');
      setConversations((prev) =>
        prev?.map((c) =>
          c.id === activeConv.id
            ? { ...c, last_message: { body: msg.body, sender_name: user?.full_name, created_at: msg.created_at } }
            : c
        )
      );
      inputRef.current?.focus();
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const totalUnread = conversations?.reduce((n, c) => n + (c.unread_count || 0), 0) || 0;

  return (
    <div className="container section msg-page" style={{ paddingBottom: 0 }}>
      <Breadcrumbs crumbs={[{ label: 'Tableau de bord', path: '/tableau-de-bord' }, { label: 'Messagerie' }]} />
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <span className="eyebrow">Privé</span>
          <h1 style={{ marginTop: 4, fontSize: 26 }}>
            Messagerie
            {totalUnread > 0 && (
              <span className="badge badge-clay" style={{ marginLeft: 10, fontSize: 12 }}>
                {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
              </span>
            )}
          </h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={openPicker}>
          + Nouvelle conversation
        </button>
      </div>

      {showContacts && (
        <div className="contact-picker" onClick={() => setShowContacts(false)}>
          <div className="card contact-picker-panel" onClick={(e) => e.stopPropagation()}>
            <div className="contact-picker-head">
              <h3>Nouvelle conversation</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowContacts(false)}>
                Fermer
              </button>
            </div>
            {contactsLoading ? (
              <div style={{ padding: 32 }}>
                <Loader />
              </div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                <p className="muted" style={{ fontSize: 13.5 }}>Aucun contact disponible.</p>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
                  Une conversation s'ouvre entre un candidat et le recruteur d'une offre à laquelle il a postulé.
                </p>
              </div>
            ) : (
              <div className="contact-list">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="contact-item"
                    onClick={() => handleStart(c)}
                    disabled={starting}
                  >
                    <div className="conv-avatar">{c.name?.slice(0, 1).toUpperCase()}</div>
                    <div className="conv-info">
                      <strong style={{ fontSize: 13.5, display: 'block' }}>{c.name}</strong>
                      <span className="muted" style={{ fontSize: 12 }}>
                        {c.role === 'recruiter' ? 'Recruteur' : c.role === 'candidate' ? 'Candidat' : 'Admin'}
                        {' · Re : '}
                        {c.job_slug
                          ? <Link to={`/offres/${c.job_slug}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--forest)' }}>{c.job_title}</Link>
                          : c.job_title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {startError && (
              <p className="badge badge-clay" style={{ margin: '0 20px 16px' }}>{startError}</p>
            )}
          </div>
        </div>
      )}

      {conversations === null ? <Loader /> : (
        <div className="messaging-layout">

          {/* ── Sidebar ── */}
          <div className="conv-list">
            {conversations.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <p className="muted" style={{ fontSize: 14 }}>Aucune conversation.</p>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
                  Cliquez sur « Nouvelle conversation » pour écrire à un recruteur ou un candidat.
                </p>
              </div>
            ) : conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`conv-item${activeConv?.id === c.id ? ' active' : ''}`}
                onClick={() => navigate(`/messagerie/${c.id}`)}
              >
                <div className="conv-avatar">{c.other_name?.slice(0, 1).toUpperCase()}</div>
                <div className="conv-info">
                  <div className="row" style={{ justifyContent: 'space-between', gap: 4 }}>
                    <strong style={{ fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.other_name}
                    </strong>
                    {c.last_message && (
                      <span className="muted" style={{ fontSize: 11, flexShrink: 0 }}>
                        {timeAgo(c.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between', gap: 4 }}>
                    <span className="conv-preview">
                      {c.last_message ? c.last_message.body : 'Aucun message'}
                    </span>
                    {c.unread_count > 0 && (
                      <span style={{
                        background: 'var(--forest)', color: '#fff',
                        borderRadius: 100, fontSize: 10, fontWeight: 700,
                        padding: '1px 6px', flexShrink: 0,
                      }}>
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                  {c.job_title && (
                    <span className="muted" style={{ fontSize: 11 }}>Re : {c.job_title}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* ── Zone messages ── */}
          <div className="conv-messages-pane">
            {!activeConv ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p className="muted">Sélectionnez une conversation.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="conv-header">
                  <div className="conv-avatar" style={{ width: 36, height: 36, fontSize: 15 }}>
                    {activeConv.other_name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <strong style={{ fontSize: 14 }}>{activeConv.other_name}</strong>
                    {activeConv.job_title && (
                      <div className="muted" style={{ fontSize: 12 }}>
                        Re :{' '}
                        {activeConv.job_slug
                          ? <Link to={`/offres/${activeConv.job_slug}`} style={{ color: 'var(--forest)' }}>{activeConv.job_title}</Link>
                          : activeConv.job_title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="conv-messages">
                  {loadingMsgs ? <Loader /> : messages.length === 0 ? (
                    <p className="muted" style={{ textAlign: 'center', marginTop: 48, fontSize: 14 }}>
                      Commencez la conversation…
                    </p>
                  ) : messages.map((m) => (
                    <div key={m.id} className={`msg-bubble${m.is_own ? ' own' : ' other'}`}>
                      {!m.is_own && <div className="msg-sender">{m.sender_name}</div>}
                      <div className="msg-body">{m.body}</div>
                      <div className="msg-time">{timeAgo(m.created_at)}</div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form className="conv-input-bar" onSubmit={handleSend}>
                  <input
                    ref={inputRef}
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="Écrivez votre message…"
                    autoComplete="off"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sending || !msgInput.trim()}
                  >
                    {sending ? '…' : 'Envoyer ↩'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
