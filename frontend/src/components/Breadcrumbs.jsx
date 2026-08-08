import { Link } from 'react-router-dom';

export default function Breadcrumbs({ crumbs }) {
  return (
    <nav className="breadcrumbs">
      <Link to="/" className="crumb-home">🏠</Link>
      {crumbs.map((c, i) => (
        <span key={i} className="crumb-row">
          <span className="crumb-sep">›</span>
          {c.path ? (
            <Link to={c.path} className="crumb-link">{c.label}</Link>
          ) : (
            <span className="crumb-current">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
