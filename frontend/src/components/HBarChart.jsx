export default function HBarChart({ items, emptyText = 'Aucune donnée disponible.' }) {
  const active = items.filter((i) => i.value > 0);
  if (!active.length) {
    return (
      <div className="empty" style={{ padding: '24px 16px' }}>
        <p className="muted">{emptyText}</p>
      </div>
    );
  }
  const maxVal = Math.max(...active.map((i) => i.value), 1);

  return (
    <div className="hbar-chart">
      {active.map((i) => (
        <div key={i.label} className="hbar-row">
          <span className="hbar-label">{i.label}</span>
          <div className="hbar-bar-track">
            <div
              className="hbar-bar-fill"
              style={{
                width: `${(i.value / maxVal) * 100}%`,
                ...(i.color ? { background: i.color } : {}),
              }}
            />
          </div>
          <span className="hbar-value">{i.value}</span>
        </div>
      ))}
      <div className="hbar-axis">
        <span className="hbar-axis-spacer" />
        <div className="hbar-axis-line">
          <span className="hbar-axis-tick" style={{ left: '0%' }}>0</span>
          <span className="hbar-axis-tick" style={{ left: '50%' }}>{Math.round(maxVal / 2)}</span>
          <span className="hbar-axis-tick" style={{ left: '100%' }}>{maxVal}</span>
        </div>
        <span className="hbar-axis-value" />
      </div>
    </div>
  );
}
