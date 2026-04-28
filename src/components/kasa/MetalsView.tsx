import { fmt } from '@/lib/portfolio';
import { fmtGrams, METAL_SHORT } from '@/lib/metals';
import type { MetalGroup } from '@/lib/metals';
import { Mask } from '@/components/PrivacyProvider';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  groups: MetalGroup[];
  pricesStale: boolean;
  onAddFirst: () => void;
  lastUpdated?: Date | null;
}

export function MetalsView({ groups, pricesStale, onAddFirst, lastUpdated }: Props) {
  const openGroups = groups.filter((g) => g.totalGrams > 0);
  const totalValue = openGroups.reduce((s, g) => s + g.currentValue, 0);
  const totalCost = openGroups.reduce((s, g) => s + g.totalCost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  if (openGroups.length === 0) {
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
      <div className="rounded-2xl border border-border bg-kasa-surface p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-kasa-text2">Toplam Metal Değeri</p>
          {pricesStale && (
            <span title="Fiyat güncellenemedi" className="text-xs text-kasa-red">⚠ fiyat güncellenemedi</span>
          )}
        </div>
        <p className="mt-1 font-mono text-3xl font-bold text-foreground"><Mask>{fmt(totalValue)}</Mask> ₺</p>
        <p className={`mt-1 font-mono text-xs ${totalPnl >= 0 ? 'text-kasa-green' : 'text-kasa-red'}`}>
          {totalPnl >= 0 ? '▲' : '▼'} <Mask>{fmt(Math.abs(totalPnl))}</Mask> ₺ ({totalPnl >= 0 ? '+' : '-'}{fmt(Math.abs(totalPct))}%)
        </p>
      </div>

      {openGroups
        .slice()
        .sort((a, b) => b.currentValue - a.currentValue)
        .map((g) => {
          const pnlColor = g.pnl >= 0 ? 'text-kasa-green' : 'text-kasa-red';
          const dayColor = g.dailyChange >= 0 ? 'text-kasa-green' : 'text-kasa-red';
          return (
            <div key={g.metal_type} className="rounded-xl border border-border bg-kasa-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{METAL_SHORT[g.metal_type]}</span>
                    {!g.hasPrice && (
                      <span title="Fiyat güncellenemedi" className="text-xs text-kasa-red">⚠</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-kasa-text2"><Mask>{fmtGrams(g.totalGrams)}</Mask> gr</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-foreground"><Mask>{fmt(g.currentValue)}</Mask> ₺</p>
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
                    {g.pnl >= 0 ? '+' : ''}<Mask>{fmt(g.pnl)}</Mask> ₺
                  </p>
                </div>
              </div>
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
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Fiyat kaynağı hakkında bilgi"
              className="ml-1.5 inline-flex translate-y-[1px] items-center text-kasa-text2/70 transition-colors hover:text-kasa-text2 focus:outline-none focus-visible:text-foreground"
            >
              <Info className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={6}
            className="max-w-[280px] p-3 text-xs leading-relaxed"
          >
            Fiyatlar Kapalıçarşı serbest piyasa referansıdır. Banka alım/satım fiyatları (ör Kuveyt Türk, Garanti, İş Bankası) %1-3 oranında farklılık gösterebilir.
          </PopoverContent>
        </Popover>
      </p>
    </div>
  );
}
