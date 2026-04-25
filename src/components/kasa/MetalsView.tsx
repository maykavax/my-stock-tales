import { useState } from 'react';
import { fmt } from '@/lib/portfolio';
import { fmtGrams, METAL_SHORT, groupMetalPositions } from '@/lib/metals';
import type { MetalPosition } from '@/lib/metals';

interface Props {
  positions: MetalPosition[];
  pricesStale: boolean;
  onAddFirst: () => void;
  onEdit: (id: string) => void;
  lastUpdated?: Date | null;
}

export function MetalsView({ positions, pricesStale, onAddFirst, onEdit, lastUpdated }: Props) {
  const groups = groupMetalPositions(positions);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
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

      {/* Grouped holdings */}
      {groups
        .slice()
        .sort((a, b) => b.currentValue - a.currentValue)
        .map((g) => {
          const pnlColor = g.pnl >= 0 ? 'text-kasa-green' : 'text-kasa-red';
          const dayColor = g.dailyChange >= 0 ? 'text-kasa-green' : 'text-kasa-red';
          const isOpen = !!expanded[g.metal_type];
          return (
            <div
              key={g.metal_type}
              className="rounded-xl border border-border bg-kasa-surface"
            >
              <button
                onClick={() => setExpanded((s) => ({ ...s, [g.metal_type]: !isOpen }))}
                className="w-full p-4 text-left transition-colors hover:bg-kasa-surface2 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{METAL_SHORT[g.metal_type]}</span>
                      {!g.hasPrice && (
                        <span title="Fiyat güncellenemedi" className="text-xs text-kasa-red">⚠</span>
                      )}
                      <span className="text-[10px] text-kasa-text2">
                        {g.lots.length} alım · {isOpen ? '▴' : '▾'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-kasa-text2">
                      {fmtGrams(g.totalGrams)} gr
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-foreground">{fmt(g.currentValue)} ₺</p>
                    <p className={`text-xs font-mono ${dayColor}`}>
                      {g.dailyChange >= 0 ? '+' : ''}{fmt(g.dailyChange)}% bugün
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[10px] text-kasa-text2">Ort. Maliyet</p>
                    <p className="font-mono text-xs text-foreground">{fmt(g.weightedAvgCost)} ₺</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-kasa-text2">Güncel Fiyat</p>
                    <p className="font-mono text-xs text-foreground">{fmt(g.currentPrice)} ₺</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-kasa-text2">K/Z</p>
                    <p className={`font-mono text-xs ${pnlColor}`}>
                      {g.pnl >= 0 ? '+' : ''}{fmt(g.pnl)} ₺
                    </p>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-border px-4 py-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-wide text-kasa-text2">Bireysel Alımlar</p>
                  {g.lots.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onEdit(l.id)}
                      className="w-full rounded-lg bg-kasa-surface2 p-3 text-left transition-colors hover:bg-kasa-surface"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono text-xs text-foreground">{fmtGrams(l.grams)} gr</p>
                          {l.source && (
                            <p className="mt-0.5 text-[10px] text-kasa-text2">{l.source}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-foreground">{fmt(l.avgCost)} ₺/gr</p>
                          <p className={`text-[10px] font-mono ${l.pnl >= 0 ? 'text-kasa-green' : 'text-kasa-red'}`}>
                            {l.pnl >= 0 ? '+' : ''}{fmt(l.pnl)} ₺
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      <p className="px-1 pt-1 text-[10px] text-kasa-text2">
        Veri kaynağı: finans.truncgil.com
        {lastUpdated && (
          <span className="ml-2 opacity-70">
            · Son güncelleme: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </p>
    </div>
  );
}