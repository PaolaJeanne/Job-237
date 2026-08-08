export default function TrendChart({ data, label }) {
  if (!data?.length) return null;

  const W = 360;
  const H = 150;
  const padL = 34;
  const padR = 8;
  const padT = 16;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const steps = 4;
  const n = data.length;
  const slot = plotW / n;
  const barW = Math.min(30, slot * 0.55);
  const ticks = Array.from({ length: steps + 1 }, (_, i) => Math.round((maxVal * i) / steps));

  return (
    <svg
      className="trend-chart"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--forest)" />
          <stop offset="100%" stopColor="var(--gold-deep)" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = padT + plotH - (t / maxVal) * plotH;
        return (
          <g key={t}>
            <line className="trend-grid" x1={padL} y1={y} x2={W - padR} y2={y} />
            <text className="trend-y" x={padL - 9} y={y + 3}>{t}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padL + slot * i + slot / 2;
        const h = (d.value / maxVal) * plotH;
        const y = padT + plotH - h;
        return (
          <g key={i}>
            <rect className="trend-col" x={x - barW / 2} y={y} width={barW} height={Math.max(h, 3)} rx={barW / 2} />
            {d.value > 0 && <text className="trend-val" x={x} y={y - 6} textAnchor="middle">{d.value}</text>}
            <text className="trend-x" x={x} y={H - 8} textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
