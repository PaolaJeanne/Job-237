import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications';
import { fetchUnreadMessageCount } from '../api/messaging';
import { timeAgo } from '../constants';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const poll = async () => {
      try {
        const [notifData, msgData] = await Promise.all([
          fetchUnreadCount(),
          fetchUnreadMessageCount(),
        ]);
        if (active) {
          setUnread(notifData.unread_count);
          setUnreadMsg(msgData.unread_count);
        }
      } catch { /* silent */ }
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => { active = false; clearInterval(id); };
  }, [user]);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const openNotifs = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const data = await fetchNotifications();
      setNotifs(data.results || data);
    }
  };

  const handleNotifClick = async (n) => {
    if (!n.is_read) {
      await markNotificationRead(n.id);
      setUnread((u) => Math.max(0, u - 1));
      setNotifs((list) => list.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setUnread(0);
    setNotifs((list) => list.map((x) => ({ ...x, is_read: true })));
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          Job<span className="mark">237</span>
        </Link>

        <nav className="nav-links">
          {user?.role === 'admin' ? (
            <>
              <NavLink to="/tableau-de-bord" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Tableau de bord
              </NavLink>
              <NavLink to="/admin/utilisateurs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Utilisateurs
              </NavLink>
              <NavLink to="/offres" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Offres
              </NavLink>
              <NavLink to="/entreprises" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Entreprises
              </NavLink>
              <NavLink to="/messagerie" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ position: 'relative' }}>
                Messages
                {unreadMsg > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -10,
                    background: 'var(--clay)', color: '#fff',
                    borderRadius: 100, fontSize: 10, fontWeight: 700,
                    padding: '1px 5px', lineHeight: 1.4,
                  }}>{unreadMsg}</span>
                )}
              </NavLink>
            </>
          ) : (
            <>
              {user && (
                <NavLink to="/tableau-de-bord" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Tableau de bord
                </NavLink>
              )}
              <NavLink to="/offres" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Offres
              </NavLink>
              <NavLink to="/entreprises" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Entreprises
              </NavLink>
              {user?.role === 'recruiter' && (
                <NavLink to="/recruteur/offres/nouvelle" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  Publier une offre
                </NavLink>
              )}
              {user && (
                <NavLink to="/messagerie" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  style={{ position: 'relative' }}>
                  Messages
                  {unreadMsg > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -10,
                      background: 'var(--clay)', color: '#fff',
                      borderRadius: 100, fontSize: 10, fontWeight: 700,
                      padding: '1px 5px', lineHeight: 1.4,
                    }}>{unreadMsg}</span>
                  )}
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="nav-right" ref={boxRef}>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Changer de thème"
            type="button"
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user ? (
            <>
              <div className="dropdown">
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--ink)', position: 'relative' }}
                  onClick={openNotifs}
                  aria-label="Notifications"
                  type="button"
                >
                  🔔
                  {unread > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: 'linear-gradient(135deg, var(--forest-deep), var(--gold-deep))',
                        color: '#ffffff',
                        borderRadius: 100,
                        fontSize: 10,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '1px 5px',
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </button>
                {open && (
                  <div className="dropdown-panel">
                    <div className="row" style={{ justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--line)' }}>
                      <strong style={{ fontSize: 13.5 }}>Notifications</strong>
                      <button className="btn btn-ghost btn-sm" onClick={handleMarkAll} type="button">
                        Tout marquer lu
                      </button>
                    </div>
                    {notifs.length === 0 && (
                      <div className="muted" style={{ padding: 18, fontSize: 13.5, textAlign: 'center' }}>
                        Aucune notification.
                      </div>
                    )}
                    {notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`notif-item ${n.is_read ? '' : 'unread'}`}
                        onClick={() => handleNotifClick(n)}
                      >
                        <strong>{n.title}</strong>
                        <div className="muted">{n.message}</div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                          {timeAgo(n.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="dropdown">
                <button
                  className="row"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', gap: 8 }}
                  onClick={() => setMenuOpen((m) => !m)}
                  type="button"
                >
                  <span className="avatar">{user.first_name?.[0] || 'U'}</span>
                </button>
                {menuOpen && (
                  <div className="dropdown-panel dropdown-menu">
                    <div style={{ padding: 14, borderBottom: '1px solid var(--line)' }}>
                      <strong style={{ display: 'block', fontSize: 14 }}>{user.full_name}</strong>
                      <span className="muted" style={{ fontSize: 12.5 }}>
                        {user.role === 'recruiter' ? 'Recruteur' : user.role === 'admin' ? 'Administrateur' : 'Candidat'}
                      </span>
                    </div>
                    <Link to="/profil" className="dropdown-menu-item" onClick={() => setMenuOpen(false)}>
                      Paramètres
                    </Link>
                    {user.role === 'candidate' && (
                      <Link to="/mes-candidatures" className="dropdown-menu-item" onClick={() => setMenuOpen(false)}>
                        Mes candidatures
                      </Link>
                    )}
                    {user.role === 'candidate' && (
                      <Link to="/favoris" className="dropdown-menu-item" onClick={() => setMenuOpen(false)}>
                        Mes favoris
                      </Link>
                    )}
                    {user.role === 'recruiter' && (
                      <Link to="/recruteur/entreprises" className="dropdown-menu-item" onClick={() => setMenuOpen(false)}>
                        Mes entreprises
                      </Link>
                    )}
                    {user.role === 'recruiter' && (
                      <Link to="/recruteur/offres/nouvelle" className="dropdown-menu-item" onClick={() => setMenuOpen(false)}>
                        Publier une offre
                      </Link>
                    )}
                    <Link to="/messagerie" className="dropdown-menu-item" onClick={() => setMenuOpen(false)}>
                      💬 Messagerie{unreadMsg > 0 && <span style={{ marginLeft: 6, background: 'var(--clay)', color: '#fff', borderRadius: 100, fontSize: 10, fontWeight: 700, padding: '1px 5px' }}>{unreadMsg}</span>}
                    </Link>
                    <button
                      className="dropdown-menu-item danger"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        navigate('/');
                      }}
                      type="button"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn btn-ghost btn-sm" style={{ color: 'var(--ink)' }}>
                Connexion
              </Link>
              <Link to="/inscription" className="btn btn-gold btn-sm">
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
