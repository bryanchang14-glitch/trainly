"use client";

type Pt = { x: number; y: number };

export function ProgressChart({ data, color = "#3f694e" }: { data: Pt[]; color?: string }) {
  if (data.length === 0) {
    return <div className="text-xs text-ink-500 py-8 text-center">No data yet.</div>;
  }
  const W = 320, H = 80, padX = 6, padY = 8;
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const points = data.map((d) => {
    const x = padX + ((d.x - minX) / xRange) * (W - 2 * padX);
    const y = H - padY - ((d.y - minY) / yRange) * (H - 2 * padY);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area = `${path} L${points[points.length - 1][0]},${H} L${points[0][0]},${H} Z`;
  const last = data[data.length - 1];

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <div className="font-display text-2xl font-semibold">{last.y.toFixed(1)}</div>
        <div className="text-xs text-ink-500">latest</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
        <path d={area} fill={color} opacity={0.12} />
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2.5} fill={color} />
        ))}
      </svg>
    </div>
  );
}
