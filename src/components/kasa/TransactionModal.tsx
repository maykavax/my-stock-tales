import { useState, useEffect } from 'react';
import type { Transaction, StockName } from '@/lib/portfolio';
import { formatCompanyName } from '@/lib/portfolio';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'user_id'>) => void;
  onDelete?: () => void;
  editTx?: Transaction | null;
  stockNames?: Record<string, StockName>;
}

const brokers = ['Akbank', 'İşbankası', 'Yapı Kredi', 'Vakıfbank', 'Şekerbank', 'Garanti', 'Midas', 'Gedik', 'Diğer'];

export function TransactionModal({ open, onClose, onSave, onDelete, editTx, stockNames }: Props) {
  const [type, setType] = useState<'buy' | 'sell' | 'div'>('buy');
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [broker, setBroker] = useState('Midas');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState('');
  const [commission, setCommission] = useState('0.2');
  const [grossAmount, setGrossAmount] = useState('');
  const [taxPct, setTaxPct] = useState('10');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (editTx) {
      setType(editTx.type as 'buy' | 'sell' | 'div');
      setSymbol(editTx.symbol);
      setDate(editTx.date);
      setBroker(editTx.broker || 'Midas');
      setQty(editTx.qty?.toString() || '');
      setPrice(editTx.price?.toString() || '');
      setCommission(editTx.commission?.toString() || '0.2');
      setGrossAmount(editTx.gross_amount?.toString() || '');
      setTaxPct(editTx.tax_pct?.toString() || '10');
    } else {
      setType('buy');
      setSymbol('');
      setDate(new Date().toISOString().split('T')[0]);
      setBroker('Midas');
      setQty('');
      setPrice('');
      setCommission('0.2');
      setGrossAmount('');
      setTaxPct('10');
    }
  }, [editTx, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!symbol || !date) return;
    if (type === 'div') {
      const ga = parseFloat(grossAmount);
      if (!ga || ga <= 0) return;
      onSave({ type, symbol: symbol.toUpperCase(), date, broker: null, qty: null, price: null, commission: null, gross_amount: ga, tax_pct: parseFloat(taxPct) || 0 });
    } else {
      const q = parseFloat(qty);
      const p = parseFloat(price);
      if (!q || !p) return;
      onSave({ type, symbol: symbol.toUpperCase(), date, broker, qty: q, price: p, commission: parseFloat(commission) || 0, gross_amount: null, tax_pct: null });
    }
  };

  const tabClass = (t: string) =>
    `flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${type === t ? 'bg-primary text-primary-foreground' : 'text-kasa-text2'}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-lg rounded-t-2xl border border-border bg-kasa-surface p-5 pb-8" onClick={e => e.stopPropagation()}>
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {editTx ? 'İşlemi Düzenle' : 'Yeni İşlem'}
          </h2>

          <div className="mb-4 flex gap-1 rounded-xl bg-kasa-surface2 p-1">
            <button className={tabClass('buy')} onClick={() => setType('buy')}>Alış</button>
            <button className={tabClass('sell')} onClick={() => setType('sell')}>Satış</button>
            <button className={tabClass('div')} onClick={() => setType('div')}>Temettü</button>
          </div>

          <div className="space-y-3">
            <Field label="Hisse Kodu">
              <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="AKBNK"
                className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono uppercase" />
              {(() => {
                const company = formatCompanyName(stockNames?.[symbol.toUpperCase()]);
                return company ? (
                  <p className="mt-1 text-[11px] text-kasa-text2">→ {company}</p>
                ) : null;
              })()}
            </Field>

            {type !== 'div' && (
              <Field label="Aracı Kurum">
                <select value={broker} onChange={e => setBroker(e.target.value)}
                  className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none">
                  {brokers.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            )}

            {type === 'div' ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Brüt Tutar (₺)">
                  <input type="number" value={grossAmount} onChange={e => setGrossAmount(e.target.value)} placeholder="0"
                    className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none font-mono" />
                </Field>
                <Field label="Stopaj %">
                  <input type="number" value={taxPct} onChange={e => setTaxPct(e.target.value)} placeholder="10"
                    className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none font-mono" />
                </Field>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Adet">
                  <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0"
                    className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none font-mono" />
                </Field>
                <Field label="Fiyat (₺)">
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                    className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none font-mono" />
                </Field>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Tarih">
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none" />
              </Field>
              {type !== 'div' && (
                <Field label="Komisyon %">
                  <input type="number" value={commission} onChange={e => setCommission(e.target.value)} placeholder="0.2"
                    className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none font-mono" />
                </Field>
              )}
            </div>
          </div>

          <button onClick={handleSave}
            className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            {editTx ? 'Değişikliği Kaydet' : 'İşlemi Kaydet'}
          </button>

          {editTx && (
            <button onClick={() => setShowConfirm(true)}
              className="mt-2 w-full rounded-lg border border-kasa-red/30 py-2 text-sm text-kasa-red">
              Bu İşlemi Sil
            </button>
          )}

          <button onClick={onClose}
            className="mt-2 w-full py-2 text-sm text-kasa-text2">
            İptal
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-border bg-kasa-surface p-5 text-center">
            <p className="text-lg font-semibold text-foreground">Emin misin?</p>
            <p className="mt-1 text-sm text-kasa-text2">Bu işlem geri alınamaz.</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setShowConfirm(false); onDelete?.(); }}
                className="flex-1 rounded-lg bg-kasa-red py-2 text-sm font-semibold text-foreground">Evet, Sil</button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-border py-2 text-sm text-kasa-text2">Vazgeç</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] text-kasa-text2">{label}</label>
      {children}
    </div>
  );
}