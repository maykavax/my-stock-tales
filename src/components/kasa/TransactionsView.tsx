import { fmt, fmtInt } from '@/lib/portfolio';
import type { Transaction } from '@/lib/portfolio';

interface Props {
  transactions: Transaction[];
  onEdit: (id: string) => void;
}

export function TransactionsView({ transactions, onEdit }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-kasa-surface py-16 text-center">
        <p className="text-3xl">○</p>
        <p className="mt-3 text-sm text-kasa-text2">Henüz işlem kaydın yok.</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const grouped: Record<string, Transaction[]> = {};
  for (const t of sorted) {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, txs]) => {
        const d = new Date(date);
        const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        return (
          <div key={date}>
            <p className="mb-2 text-xs font-semibold text-kasa-text2">{dateStr}</p>
            <div className="space-y-2">
              {txs.map(t => {
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
        );
      })}
    </div>
  );
}