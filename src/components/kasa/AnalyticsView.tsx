import { fmt } from '@/lib/portfolio';
import type { Position } from '@/lib/portfolio';
import type { MetalGroup } from '@/lib/metals';
import { groupMetalPositions, METAL_SHORT } from '@/lib/metals';
import type { MetalPosition } from '@/lib/metals';

interface Props {
  positions: Position[];
  metalPositions: MetalPosition[];
  onAddFirst?: () => void;
}

const palette = ['#d4ff4d', '#4ade80', '#60a5fa', '#e8b84d', '#f87171', '#c084fc', '#fb923c', '#2dd4bf', '#f472b6', '#a3e635'];
const classPalette = ['#d4ff4d', '#60a5fa'];

interface Segment { label: string; value: number; pct: number; color: string; }

function Donut({ segments, total, size = 240 }: { segments: Segment[]; total: number; size?: number }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.375, rInner = size * 0.25;
  let cumulative = 0;
  const arcs = segments.map((s, i) => {
    const startAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    cumulative += s.value;
    const endAngle = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const x3 = cx + rInner * Math.cos(endAngle);
    const y3 = cy + rInner * Math.sin(endAngle);
    const x4 = cx + rInner * Math.cos(startAngle);
    const y4 = cy + rInner * Math.sin(startAngle);
    const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
    // Full circle edge case (one segment)
    if (segments.length === 1) {
      return (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill={s.color} />
          <circle cx={cx} cy={cy} r={rInner} fill="hsl(var(--background))" />
        </g>
      );
    }
    return (
      <path
        key={i}
        d={`M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} L${x3},${y3} A${rInner},${rInner} 0 ${largeArc} 0 ${x4},${y4} Z`}
        fill={s.color}
      />
    );
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs}
      <text x={cx} y={cy - 8} textAnchor="middle" className="text-[10px] fill-kasa-text2">TOPLAM</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="text-sm font-mono font-bold fill-foreground">{fmt(total)} ₺</text>
    </svg>
  );
}

function Legend({ segments }: { segments: Segment[] }) {
  return (
    <div className="mt-4 space-y-2">
      {segments.map((s) => (
        <div key={s.label} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-mono text-xs text-foreground">{s.label}</span>
          </div>
          <span className="text-xs text-kasa-text2">{fmt(s.pct)}% · {fmt(s.value)} ₺</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, segments, total, size }: { title: string; segments: Segment[]; total: number; size?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-kasa-surface p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">{title}</p>
      <div className="flex justify-center">
        <Donut segments={segments} total={total} size={size} />
      </div>
      <Legend segments={segments} />
    </div>
  );
}

export function AnalyticsView({ positions, metalPositions, onAddFirst }: Props) {
  const openStocks = positions.filter((p) => p.openQty > 0);
  const stocksValue = openStocks.reduce((s, p) => s + p.openValue, 0);

  const metalGroups: MetalGroup[] = groupMetalPositions(metalPositions.filter((p) => p.grams > 0));
  const metalsValue = metalGroups.reduce((s, g) => s + g.currentValue, 0);

  const hasStocks = openStocks.length > 0 && stocksValue > 0;
  const hasMetals = metalGroups.length > 0 && metalsValue > 0;

  if (!hasStocks && !hasMetals) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-kasa-surface py-16 text-center">
        <p className="text-3xl">◇</p>
        <p className="mt-3 px-6 text-sm text-kasa-text2">
          Henüz pozisyon eklemediniz. Sağ alttaki + butonuyla ilk pozisyonunuzu ekleyin.
        </p>
        {onAddFirst && (
          <button
            onClick={onAddFirst}
            className="mt-5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            + Pozisyon Ekle
          </button>
        )}
      </div>
    );
  }

  const stockSegments: Segment[] = openStocks
    .map((p, i) => ({
      label: p.symbol,
      value: p.openValue,
      pct: stocksValue > 0 ? (p.openValue / stocksValue) * 100 : 0,
      color: palette[i % palette.length],
    }))
    .sort((a, b) => b.value - a.value);

  const metalSegments: Segment[] = metalGroups
    .map((g, i) => ({
      label: METAL_SHORT[g.metal_type],
      value: g.currentValue,
      pct: metalsValue > 0 ? (g.currentValue / metalsValue) * 100 : 0,
      color: palette[i % palette.length],
    }))
    .sort((a, b) => b.value - a.value);

  // Both: show class-level pie + two sub-charts
  if (hasStocks && hasMetals) {
    const total = stocksValue + metalsValue;
    const classSegments: Segment[] = [
      { label: 'Hisseler', value: stocksValue, pct: (stocksValue / total) * 100, color: classPalette[0] },
      { label: 'Metaller', value: metalsValue, pct: (metalsValue / total) * 100, color: classPalette[1] },
    ];
    return (
      <div className="space-y-4">
        <ChartCard title="Varlık Sınıfı Dağılımı" segments={classSegments} total={total} size={260} />
        <ChartCard title="Hisse Dağılımı" segments={stockSegments} total={stocksValue} size={220} />
        <ChartCard title="Metal Dağılımı" segments={metalSegments} total={metalsValue} size={220} />
      </div>
    );
  }

  if (hasStocks) {
    return (
      <div className="space-y-4">
        <ChartCard title="Hisse Dağılımı" segments={stockSegments} total={stocksValue} size={260} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Metal Dağılımı" segments={metalSegments} total={metalsValue} size={260} />
    </div>
  );
}
