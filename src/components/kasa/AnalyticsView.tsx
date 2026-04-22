import { fmt } from '@/lib/portfolio';
import type { Position } from '@/lib/portfolio';

interface Props {
  positions: Position[];
}

const palette = ['#d4ff4d', '#4ade80', '#60a5fa', '#e8b84d', '#f87171', '#c084fc', '#fb923c', '#2dd4bf', '#f472b6', '#a3e635'];

export function AnalyticsView({ positions }: Props) {
  const open = positions.filter(p => p.openQty > 0);

  if (open.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-kasa-surface py-16 text-center">
        <p className="text-3xl">◇</p>
        <p className="mt-3 text-sm text-kasa-text2">Analizlerini görmek için önce portföyüne hisse ekle.</p>
      </div>
    );
  }

  const totalValue = open.reduce((s, p) => s + p.openValue, 0);
  const segments = open.map((p, i) => ({
    symbol: p.symbol,
    value: p.openValue,
    pct: totalValue > 0 ? (p.openValue / totalValue) * 100 : 0,
    color: palette[i % palette.length],
  })).sort((a, b) => b.value - a.value);

  // Donut SVG
  const cx = 120, cy = 120, r = 90, rInner = 60;
  let cumulative = 0;
  const arcs = segments.map((s, i) => {
    const startAngle = (cumulative / totalValue) * Math.PI * 2 - Math.PI / 2;
    cumulative += s.value;
    const endAngle = (cumulative / totalValue) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const x3 = cx + rInner * Math.cos(endAngle);
    const y3 = cy + rInner * Math.sin(endAngle);
    const x4 = cx + rInner * Math.cos(startAngle);
    const y4 = cy + rInner * Math.sin(startAngle);
    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
    return (
      <path
        key={i}
        d={`M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 ${largeArc} 0 ${x4},${y4} Z`}
        fill={s.color}
      />
    );
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-kasa-surface p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Portföy Dağılımı</p>
        <div className="flex justify-center">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {arcs}
            <text x="120" y="112" textAnchor="middle" className="text-[10px] fill-kasa-text2">TOPLAM</text>
            <text x="120" y="132" textAnchor="middle" className="text-sm font-mono font-bold fill-foreground">{fmt(totalValue)} ₺</text>
          </svg>
        </div>
        <div className="mt-4 space-y-2">
          {segments.map(s => (
            <div key={s.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-mono text-xs text-foreground">{s.symbol}</span>
              </div>
              <span className="text-xs text-kasa-text2">{fmt(s.pct)}% · {fmt(s.value)} ₺</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}