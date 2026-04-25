import { fmt } from '@/lib/portfolio';
import { fmtGrams, METAL_LABELS, METAL_SHORT } from '@/lib/metals';
import type { MetalPosition } from '@/lib/metals';

interface Props {
  positions: MetalPosition[];
  pricesStale: boolean;
  onAddFirst: () => void;
  onEdit: (id: string) => void;
}

export function MetalsView({ positions, pricesStale, onAddFirst, onEdit }: Props) {
  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0);
  const totalCost = positions.reduce((s, p) => s + p.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-kasa-surface py-16 text-center">
        <p className="text-4xl">🪙</p>
        <p className="mt-3 font-semibold text-foreground">Henüz metal pozisyonun yok.</p>
        <p className="mt-1 text-xs text-kasa-text2">Altın, gümüş, platin veya paladyum ekleyebilirsin.</p>
        <button
          onClick={onAddFirst}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          + İlk metali ekle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="rounded-2xl border border-border bg-kasa-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-kasa-text2">Toplam Metal Değeri</p>
          {pricesStale && (
            <span title="Fiyat güncellenemedi" className="text-xs text-kasa-red">⚠ fiyat güncellenemedi</span>
          )}
        </div>
        <p className="mt-1 font-mono text-3xl font-bold text-foreground">{fmt(totalValue)} ₺</p>
        <p className={`mt-1 font-mono text-xs ${totalPnl >= 0 ? 'text-kasa-green' : 'text-kasa-red'}`}>
          {totalPnl >= 0 ? '▲' : '▼'} {fmt(Math.abs(totalPnl))} ₺ ({totalPnl >= 0 ? '+' : '-'}{fmt(Math.abs(totalPct))}%)
        </p>
      </div>

      {/* Holdings */}
      {positions
        .slice()
        .sort((a, b) => b.currentValue - a.currentValue)
        .map((p) => {
          const pnlColor = p.pnl >= 0 ? 'text-kasa-green' : 'text-kasa-red';
          const dayColor = p.dailyChange >= 0 ? 'text-kasa-green' : 'text-kasa-red';
          return (
            <button
              key={p.id}
              onClick={() => onEdit(p.id)}
              className="w-full rounded-xl border border-border bg-kasa-surface p-4 text-left transition-colors hover:bg-kasa-surface2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{METAL_SHORT[p.metal_type]}</span>
                    {!p.hasPrice && (
                      <span title="Fiyat güncellenemedi" className="text-xs text-kasa-red">⚠</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-kasa-text2">
                    {fmtGrams(p.grams)} gr{p.source ? ` · ${p.source}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-foreground">{fmt(p.currentValue)} ₺</p>
                  <p className={`text-xs font-mono ${dayColor}`}>
                    {p.dailyChange >= 0 ? '+' : ''}{fmt(p.dailyChange)}% bugün
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-kasa-text2">Ort. Maliyet</p>
                  <p className="font-mono text-xs text-foreground">{fmt(p.avgCost)} ₺</p>
                </div>
                <div>
                  <p className="text-[10px] text-kasa-text2">Güncel Fiyat</p>
                  <p className="font-mono text-xs text-foreground">{fmt(p.currentPrice)} ₺</p>
                </div>
                <div>
                  <p className="text-[10px] text-kasa-text2">K/Z</p>
                  <p className={`font-mono text-xs ${pnlColor}`}>
                    {p.pnl >= 0 ? '+' : ''}{fmt(p.pnl)} ₺
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      <p className="px-1 pt-1 text-[10px] text-kasa-text2">
        Düzenlemek için bir karta dokun. Veri kaynağı: {METAL_LABELS.gold.toLowerCase().split(' ')[0]} & co. — finans.truncgil.com
      </p>
    </div>
  );
}