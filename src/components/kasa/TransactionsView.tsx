import { useState } from 'react';
import { fmt, fmtInt } from '@/lib/portfolio';
import type { Transaction } from '@/lib/portfolio';
import type { MetalTransaction } from '@/lib/metals';
import { METAL_SHORT, realizedPnlForSell, fmtGrams } from '@/lib/metals';

interface Props {
  transactions: Transaction[];
  metalTxs: MetalTransaction[];
  onEdit: (id: string) => void;
  onEditMetal: (id: string) => void;
}

type SubTab = 'stocks' | 'metals';

export function TransactionsView({ transactions, metalTxs, onEdit, onEditMetal }: Props) {
  const [sub, setSub] = useState<SubTab>('stocks');

  const subClass = (t: SubTab) =>
    `flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${sub === t ? 'bg-primary text-primary-foreground' : 'text-kasa-text2'}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-kasa-surface2 p-1">
        <button className={subClass('stocks')} onClick={() => setSub('stocks')}>Hisseler</button>
        <button className={subClass('metals')} onClick={() => setSub('metals')}>Metaller</button>
      </div>

      {sub === 'stocks' ? (
        <StockList transactions={transactions} onEdit={onEdit} />
      ) : (
        <MetalList txs={metalTxs} onEdit={onEditMetal} />
      )}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-kasa-surface py-16 text-center">
      <p className="text-3xl">○</p>
      <p className="mt-3 text-sm text-kasa-text2">{msg}</p>
    </div>
  );
}

function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  const out: Record<string, T[]> = {};
  for (const t of sorted) {
    if (!out[t.date]) out[t.date] = [];
    out[t.date].push(t);
  }
  return out;
}

function fmtDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function StockList({ transactions, onEdit }: { transactions: Transaction[]; onEdit: (id: string) => void }) {
  if (transactions.length === 0) return <EmptyState msg="Henüz hisse işlem kaydın yok." />;
  const grouped = groupByDate(transactions);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-semibold text-kasa-text2">{fmtDate(date)}</p>
          <div className="space-y-2">
            {txs.map((t) => {
              let badge: string, amount: string, detail: string;
              if (t.type === 'div') {
                badge = 'TMT';
                const net = (t.gross_amount || 0) * (1 - (t.tax_pct || 0) / 100);
                amount = `+${fmt(net)} ₺`;
                detail = `brüt ${fmt(t.gross_amount || 0)} ₺ · stopaj %${t.tax_pct || 0}`;
              } else {
                badge = t.type === 'buy' ? 'AL' : 'SAT';
                amount = `${fmt((t.qty || 0) * (t.price || 0))} ₺`;
                detail = `${fmtInt(t.qty || 0)} × ${fmt(t.price || 0)}`;
              }
              const badgeColor = t.type === 'buy' ? 'bg-kasa-green/20 text-kasa-green'
                : t.type === 'sell' ? 'bg-kasa-red/20 text-kasa-red'
                : 'bg-primary/20 text-primary';

              return (
                <button
                  key={t.id}
                  onClick={() => onEdit(t.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-kasa-surface p-3 text-left transition-colors hover:bg-kasa-surface2"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>{badge}</span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-foreground">{t.symbol}</p>
                      <p className="text-[10px] text-kasa-text2">{t.type === 'div' ? 'Temettü' : t.broker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-foreground">{amount}</p>
                    <p className="text-[10px] text-kasa-text2">{detail}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MetalList({ txs, onEdit }: { txs: MetalTransaction[]; onEdit: (id: string) => void }) {
  if (txs.length === 0) return <EmptyState msg="Henüz metal işlem kaydın yok." />;
  const grouped = groupByDate(txs);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-semibold text-kasa-text2">{fmtDate(date)}</p>
          <div className="space-y-2">
            {items.map((t) => {
              const badge = t.type === 'buy' ? 'AL' : 'SAT';
              const badgeColor = t.type === 'buy'
                ? 'bg-kasa-green/20 text-kasa-green'
                : 'bg-kasa-red/20 text-kasa-red';
              const amount = `${fmt(t.grams * t.price_per_gram)} ₺`;
              const detail = `${fmtGrams(t.grams)} gr × ${fmt(t.price_per_gram)} ₺/gr`;
              const realized = t.type === 'sell' ? realizedPnlForSell(t, txs) : 0;

              return (
                <button
                  key={t.id}
                  onClick={() => onEdit(t.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-kasa-surface p-3 text-left transition-colors hover:bg-kasa-surface2"
                >
                  <div className="flex items-center gap-3">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>{badge}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{METAL_SHORT[t.metal_type]}</p>
                      <p className="text-[10px] text-kasa-text2">{t.source || '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-foreground">{amount}</p>
                    <p className="text-[10px] text-kasa-text2">{detail}</p>
                    {t.type === 'sell' && (
                      <p className={`mt-0.5 font-mono text-[10px] ${realized >= 0 ? 'text-kasa-green' : 'text-kasa-red'}`}>
                        {realized >= 0 ? '+' : ''}{fmt(realized)} ₺ K/Z
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
