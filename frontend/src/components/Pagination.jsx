export default function Pagination({ count, page, pageSize = 20, onChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="muted" style={{ alignSelf: 'center' }}>
            …
          </span>
        ) : (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button className="page-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        ›
      </button>
    </nav>
  );
}
