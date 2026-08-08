export function Loader({ label = 'Chargement…' }) {
  return <div className="loader">{label}</div>;
}

export function EmptyState({ glyph = '—', title, hint, action }) {
  return (
    <div className="empty">
      <div className="glyph">{glyph}</div>
      <h3 style={{ marginBottom: 6 }}>{title}</h3>
      {hint && <p className="muted">{hint}</p>}
      {action}
    </div>
  );
}
