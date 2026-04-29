import { useState } from 'react';
import { fmt, fmtInt, formatCompanyName } from '@/lib/portfolio';
import type { Position, StockName } from '@/lib/portfolio';
import { Mask } from '@/components/PrivacyProvider';

interface Props {
  positions: Position[];
  stockNames?: Record<string, StockName>;
  onAddFirst: () => void;
}

interface SymbolGroup {
  symbol: string;
  brokers: Position[];
  openQty: number;
  openCost: number;
  openValue: number;
  weightedAvg: number;
  currentPrice: number;
  unrealizedPnl: number;
  pnlPct: number;
  dividend: number;
}

function groupBySymbol(positions: Position[]): SymbolGroup[] {
  const map = new Map<string, Position[]>();
  for (const p of positions) {
    const arr = map.get(p.symbol) ?? [];
    arr.push(p);
    map.set(p.symbol, arr);
  }
  const groups: SymbolGroup[] = [];
  map.forEach((brokers, symbol) => {
    const openQty = brokers.reduce((s, p) => s + p.openQty, 0);
    const openCost = brokers.reduce((s, p) => s + p.openCost, 0);
    const openValue = brokers.reduce((s, p) => s + p.openValue, 0);
    const dividend = brokers.reduce((s, p) => s + p.dividend, 0);
    const weightedAvg = openQty > 0 ? openCost / openQty : 0;
    const currentPrice = brokers[0]?.currentPrice ?? 0;
    const unrealizedPnl = openValue - openCost;
    const pnlPct = openCost > 0 ? (unrealizedPnl / openCost) * 100 : 0;
    groups.push({
      symbol, brokers: brokers.slice().sort((a, b) => b.openValue - a.openValue),
      openQty, openCost, openValue, weightedAvg, currentPrice, unrealizedPnl, pnlPct, dividend,
    });
  });
  return groups.sort((a, b) => b.openValue - a.openValue);
}

export function HoldingsView({ positions, stockNames, onAddFirst }: Props) {
  const open = positions.filter((p) => p.openQty > 0);
  const groups = groupBySymbol(open);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (groups.length === 0) {
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
      {groups.map((g) => {
        const pnlColor = g.unrealizedPnl >= 0 ? 'text-kasa-green' : 'text-kasa-red';
        const company = formatCompanyName(stockNames?.[g.symbol]);
        const isOpen = !!expanded[g.symbol];
        const multi = g.brokers.length > 1;

        return (
          <div key={g.symbol} className="rounded-xl border border-border bg-kasa-surface p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{g.symbol}</span>
                  {company && (
                    <span className="max-w-[160px] truncate text-xs text-kasa-text2">{company}</span>
                  )}
                  {g.dividend > 0 && (
                    <span className="rounded bg-kasa-green/20 px-1.5 py-0.5 text-[9px] font-semibold text-kasa-green">
                      TEMETTÜ +<Mask>{fmt(g.dividend)}</Mask> ₺
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-kasa-text2">
                  <Mask>{fmtInt(g.openQty)}</Mask> adet
                  {multi && (
                    <button
                      onClick={() => setExpanded((s) => ({ ...s, [g.symbol]: !s[g.symbol] }))}
                      className="ml-2 inline-flex items-center gap-0.5 rounded bg-kasa-surface2 px-1.5 py-0.5 text-[10px] font-semibold text-kasa-text2 transition-colors hover:text-foreground"
                      aria-expanded={isOpen}
                    >
                      {g.brokers.length} alım <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-foreground"><Mask>{fmt(g.openValue)}</Mask> ₺</p>
                <p className={`font-mono text-xs ${pnlColor}`}>
                  {g.unrealizedPnl >= 0 ? '+' : ''}<Mask>{fmt(g.unrealizedPnl)}</Mask> ₺ ({g.unrealizedPnl >= 0 ? '+' : ''}{fmt(g.pnlPct)}%)
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-kasa-text2">Ort. Maliyet</p>
                <p className="font-mono text-xs text-foreground">{fmt(g.weightedAvg)} ₺</p>
              </div>
              <div>
                <p className="text-[10px] text-kasa-text2">Güncel Fiyat</p>
                <p className="font-mono text-xs text-foreground">{fmt(g.currentPrice)} ₺</p>
              </div>
              <div>
                <p className="text-[10px] text-kasa-text2">Toplam Maliyet</p>
                <p className="font-mono text-xs text-foreground"><Mask>{fmt(g.openCost)}</Mask> ₺</p>
              </div>
            </div>

            {multi && isOpen && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-kasa-text2">
                  Bireysel Alımlar
                </p>
                <div className="space-y-2">
                  {g.brokers.map((p) => {
                    const pPnlColor = p.unrealizedPnl >= 0 ? 'text-kasa-green' : 'text-kasa-red';
                    const pPnlPct = p.openCost > 0 ? (p.unrealizedPnl / p.openCost) * 100 : 0;
                    return (
                      <div
                        key={p.broker}
                        className="flex items-center justify-between rounded-lg bg-kasa-surface2 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{p.broker}</p>
                          <p className="mt-0.5 font-mono text-[10px] text-kasa-text2">
                            <Mask>{fmtInt(p.openQty)}</Mask> adet · ort {fmt(p.avgBuy)} ₺
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs text-foreground"><Mask>{fmt(p.openValue)}</Mask> ₺</p>
                          <p className={`font-mono text-[10px] ${pPnlColor}`}>
                            {p.unrealizedPnl >= 0 ? '+' : ''}<Mask>{fmt(p.unrealizedPnl)}</Mask> ₺ ({p.unrealizedPnl >= 0 ? '+' : ''}{fmt(pPnlPct)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}