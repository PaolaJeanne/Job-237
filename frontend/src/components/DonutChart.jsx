export default function DonutChart({ items, size = 150, thickness = 20, centerLabel = '' }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) return null;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const toXY = (angle) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
  };
  let acc = 0;
  const arcs = items.filter((i) => i.value > 0).map((i) => {
    const start = (acc * 360) / total;
    acc += i.value;
    const end = (acc * 360) / total;
    const gapDeg = 2;
    const a1 = start + gapDeg;
    const a2 = Math.max(end - gapDeg, a1 + 0.01);
    const [x1, y1] = toXY(a1);
    const [x2, y2] = toXY(a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    return { ...i, d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}` };
  });

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} />
          {arcs.map((a) => (
            <path key={a.label} d={a.d} fill="none" stroke={a.color} strokeWidth={thickness} />
          ))}
        </svg>
        <div className="donut-center">
          <strong>{total}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="donut-legend">
        {items.filter((i) => i.value > 0).map((i) => (
          <div key={i.label} className="donut-legend-item">
            <span className="donut-swatch" style={{ background: i.color }} />
            <span className="donut-legend-label">{i.label}</span>
            <strong className="donut-legend-value">{i.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
