import { fmt } from '@/lib/portfolio';
import type { Position } from '@/lib/portfolio';

interface Props {
  positions: Position[];
  totalDividend: number;
  hasTransactions: boolean;
  metalsValue?: number;
  metalsPnl?: number;
}

export function SummaryCards({ positions, totalDividend, hasTransactions, metalsValue = 0, metalsPnl = 0 }: Props) {
  const stocksValue = positions.reduce((s, p) => s + p.openValue, 0);
  const totalCost = positions.reduce((s, p) => s + p.openCost, 0);
  const stocksPnl = positions.reduce((s, p) => s + p.unrealizedPnl, 0);
  const totalValue = stocksValue + metalsValue;
  const unrealizedPnl = stocksPnl + metalsPnl;
  const realizedPnl = positions.reduce((s, p) => s + p.realizedPnl, 0);
  const openPositions = positions.filter(p => p.openQty > 0).length;
  const totalPct = totalCost > 0 ? (unrealizedPnl / totalCost * 100) : 0;
  const hasAny = hasTransactions || metalsValue > 0;

  return (
    <div className="space-y-4">
      {/* Main value */}
      <div className="rounded-2xl border border-border bg-kasa-surface p-5">
        <p className="text-xs text-kasa-text2">Toplam Portföy Değeri</p>
        <p className="mt-1 font-mono text-3xl font-bold text-foreground">{fmt(totalValue)}₺</p>
        {!hasAny ? (
          <p className="mt-1 text-xs text-kasa-text2">— henüz işlem yok</p>
        ) : (
          <p className={`mt-1 text-xs font-mono ${unrealizedPnl >= 0 ? 'text-kasa-green' : 'text-kasa-red'}`}>
            {unrealizedPnl >= 0 ? '▲' : '▼'} {fmt(Math.abs(unrealizedPnl))} ₺ ({unrealizedPnl >= 0 ? '+' : '-'}{fmt(Math.abs(totalPct))}%)
          </p>
        )}
      </div>

      {/* Mini cards */}
      <div className="grid grid-cols-2 gap-3">
        <MiniCard label="Potansiyel K/Z" value={unrealizedPnl} isCurrency />
        <MiniCard label="Gerçekleşen K/Z" value={realizedPnl} isCurrency />
        <MiniCard label="Toplam Temettü" value={totalDividend} isCurrency />
        <div className="rounded-xl border border-border bg-kasa-surface p-3">
          <p className="text-[10px] text-kasa-text2">Pozisyon Sayısı</p>
          <p className="mt-0.5 font-mono text-lg font-semibold text-foreground">{openPositions}</p>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ label, value, isCurrency }: { label: string; value: number; isCurrency?: boolean }) {
  const color = value > 0 ? 'text-kasa-green' : value < 0 ? 'text-kasa-red' : 'text-foreground';
  return (
    <div className="rounded-xl border border-border bg-kasa-surface p-3">
      <p className="text-[10px] text-kasa-text2">{label}</p>
      <p className={`mt-0.5 font-mono text-lg font-semibold ${color}`}>
        {value > 0 ? '+' : ''}{fmt(value)}{isCurrency ? ' ₺' : ''}
      </p>
    </div>
  );
}