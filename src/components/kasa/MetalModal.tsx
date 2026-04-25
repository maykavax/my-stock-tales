import { useEffect, useState, useMemo } from 'react';
import type { MetalTransaction, MetalType } from '@/lib/metals';
import { METAL_SHORT, openGramsOf, fmtGrams } from '@/lib/metals';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<MetalTransaction, 'id' | 'user_id' | 'created_at'>) => void;
  onDelete?: () => void;
  editTx?: MetalTransaction | null;
  allTxs: MetalTransaction[];
}

const METALS: MetalType[] = ['gold', 'silver', 'platinum', 'palladium'];

export function MetalModal({ open, onClose, onSave, onDelete, editTx, allTxs }: Props) {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [metalType, setMetalType] = useState<MetalType>('gold');
  const [grams, setGrams] = useState('');
  const [pricePerGram, setPricePerGram] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setMetalType(editTx.metal_type);
      setGrams(editTx.grams.toString());
      setPricePerGram(editTx.price_per_gram.toString());
      setSource(editTx.source || '');
      setDate(editTx.date);
    } else {
      setType('buy');
      setMetalType('gold');
      setGrams('');
      setPricePerGram('');
      setSource('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [editTx, open]);

  // Available grams for sell validation — exclude the tx being edited so user can edit it
  const availableGrams = useMemo(() => {
    const others = editTx ? allTxs.filter((t) => t.id !== editTx.id) : allTxs;
    return openGramsOf(metalType, others);
  }, [allTxs, metalType, editTx]);

  if (!open) return null;

  const handleSave = () => {
    const g = parseFloat(grams.replace(',', '.'));
    const p = parseFloat(pricePerGram.replace(',', '.'));
    if (!g || g <= 0) { setError('Geçerli bir gram giriniz.'); return; }
    if (!p || p <= 0) { setError('Geçerli bir fiyat giriniz.'); return; }
    if (!date) { setError('Tarih seçiniz.'); return; }
    if (type === 'sell' && g > availableGrams + 1e-9) {
      setError(`Satılacak gram mevcut pozisyondan fazla. Mevcut: ${fmtGrams(availableGrams)} gr`);
      return;
    }
    setError(null);
    onSave({
      type,
      metal_type: metalType,
      grams: g,
      price_per_gram: p,
      source: source.trim() || null,
      date,
    });
  };

  const typeClass = (t: 'buy' | 'sell') =>
    `flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${type === t ? 'bg-primary text-primary-foreground' : 'text-kasa-text2'}`;

  const metalClass = (m: MetalType) =>
    `flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${metalType === m ? 'bg-primary text-primary-foreground' : 'text-kasa-text2'}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-lg rounded-t-2xl border border-border bg-kasa-surface p-5 pb-8" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {editTx ? 'Metal İşlemini Düzenle' : 'Yeni Metal İşlemi'}
          </h2>

          <div className="mb-4 flex gap-1 rounded-xl bg-kasa-surface2 p-1">
            <button className={typeClass('buy')} onClick={() => setType('buy')}>Alış</button>
            <button className={typeClass('sell')} onClick={() => setType('sell')}>Satış</button>
          </div>

          <div className="mb-3 flex gap-1 rounded-xl bg-kasa-surface2 p-1">
            {METALS.map((m) => (
              <button key={m} className={metalClass(m)} onClick={() => setMetalType(m)}>
                {METAL_SHORT[m]}
              </button>
            ))}
          </div>

          {type === 'sell' && (
            <p className="mb-2 text-[10px] text-kasa-text2">
              Mevcut {METAL_SHORT[metalType]}: <span className="font-mono text-foreground">{fmtGrams(availableGrams)} gr</span>
            </p>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gram">
                <input
                  type="text" inputMode="decimal" value={grams}
                  onChange={(e) => setGrams(e.target.value)} placeholder="12.5"
                  className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
                />
              </Field>
              <Field label="Gram başına fiyat (₺)">
                <input
                  type="text" inputMode="decimal" value={pricePerGram}
                  onChange={(e) => setPricePerGram(e.target.value)} placeholder="3500"
                  className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
                />
              </Field>
            </div>

            <Field label="Kaynak (opsiyonel)">
              <input
                type="text" value={source}
                onChange={(e) => setSource(e.target.value)} placeholder="Kuveyt Türk, Kapalıçarşı..."
                className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </Field>

            <Field label="Tarih">
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none"
              />
            </Field>
          </div>

          {error && <p className="mt-3 text-xs text-kasa-red">{error}</p>}

          <button onClick={handleSave} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            {editTx ? 'Değişikliği Kaydet' : 'İşlemi Kaydet'}
          </button>

          {editTx && (
            <button onClick={() => setShowConfirm(true)} className="mt-2 w-full rounded-lg border border-kasa-red/30 py-2 text-sm text-kasa-red">
              Bu İşlemi Sil
            </button>
          )}

          <button onClick={onClose} className="mt-2 w-full py-2 text-sm text-kasa-text2">
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
              <button onClick={() => { setShowConfirm(false); onDelete?.(); }} className="flex-1 rounded-lg bg-kasa-red py-2 text-sm font-semibold text-foreground">
                Evet, Sil
              </button>
              <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-lg border border-border py-2 text-sm text-kasa-text2">
                Vazgeç
              </button>
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
