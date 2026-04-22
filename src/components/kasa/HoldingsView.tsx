import { fmt, fmtInt } from '@/lib/portfolio';
import type { Position } from '@/lib/portfolio';

interface Props {
  positions: Position[];
  onAddFirst: () => void;
}

export function HoldingsView({ positions, onAddFirst }: Props) {
  const open = positions.filter(p => p.openQty > 0).sort((a, b) => b.openValue - a.openValue);

  if (open.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-kasa-surface py-16 text-center">
        <p className="text-4xl">∅</p>
        <p className="mt-3 font-semibold text-foreground">Portföyün şu an boş.</p>
        <p className="mt-1 text-xs text-kasa-text2">İlk alışını ekleyerek başla.</p>
        <button
          onClick={onAddFirst}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          + İlk işlemi ekle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {open.map(p => {
        const pnlPct = p.openCost > 0 ? (p.unrealizedPnl / p.openCost * 100) : 0;
        const pnlColor = p.unrealizedPnl >= 0 ? 'text-kasa-green' : 'text-kasa-red';

        return (
          <div key={p.symbol + p.broker} className="rounded-xl border border-border bg-kasa-surface p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{p.symbol}</span>
                  {p.dividend > 0 && (
                    <span className="rounded bg-kasa-green/20 px-1.5 py-0.5 text-[9px] font-semibold text-kasa-green">
                      TEMETTÜ +{fmt(p.dividend)} ₺
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-kasa-text2">{p.broker} · {fmtInt(p.openQty)} adet</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-foreground">{fmt(p.openValue)} ₺</p>
                <p className={`text-xs font-mono ${pnlColor}`}>
                  {p.unrealizedPnl >= 0 ? '+' : ''}{fmt(p.unrealizedPnl)} ₺ ({p.unrealizedPnl >= 0 ? '+' : ''}{fmt(pnlPct)}%)
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-kasa-text2">Ort. Maliyet</p>
                <p className="font-mono text-xs text-foreground">{fmt(p.avgBuy)} ₺</p>
              </div>
              <div>
                <p className="text-[10px] text-kasa-text2">Güncel Fiyat</p>
                <p className="font-mono text-xs text-foreground">{fmt(p.currentPrice)} ₺</p>
              </div>
              <div>
                <p className="text-[10px] text-kasa-text2">Toplam Maliyet</p>
                <p className="font-mono text-xs text-foreground">{fmt(p.openCost)} ₺</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}