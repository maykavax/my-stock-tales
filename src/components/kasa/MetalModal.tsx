import { useEffect, useState } from 'react';
import type { MetalHolding, MetalType } from '@/lib/metals';
import { METAL_SHORT } from '@/lib/metals';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (h: Omit<MetalHolding, 'id' | 'user_id' | 'created_at'>) => void;
  onDelete?: () => void;
  editHolding?: MetalHolding | null;
}

const METALS: MetalType[] = ['gold', 'silver', 'platinum', 'palladium'];

export function MetalModal({ open, onClose, onSave, onDelete, editHolding }: Props) {
  const [metalType, setMetalType] = useState<MetalType>('gold');
  const [grams, setGrams] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [source, setSource] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (editHolding) {
      setMetalType(editHolding.metal_type);
      setGrams(editHolding.grams.toString());
      setAvgCost(editHolding.avg_cost_try.toString());
      setSource(editHolding.purchase_source || '');
    } else {
      setMetalType('gold');
      setGrams('');
      setAvgCost('');
      setSource('');
    }
  }, [editHolding, open]);

  if (!open) return null;

  const handleSave = () => {
    const g = parseFloat(grams.replace(',', '.'));
    const c = parseFloat(avgCost.replace(',', '.'));
    if (!g || g <= 0 || !c || c <= 0) return;
    onSave({
      metal_type: metalType,
      grams: g,
      avg_cost_try: c,
      purchase_source: source.trim() || null,
    });
  };

  const segClass = (m: MetalType) =>
    `flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${metalType === m ? 'bg-primary text-primary-foreground' : 'text-kasa-text2'}`;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <div className="w-full max-w-lg rounded-t-2xl border border-border bg-kasa-surface p-5 pb-8" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {editHolding ? 'Metal Pozisyonunu Düzenle' : 'Yeni Metal Pozisyonu'}
          </h2>

          <div className="mb-4 flex gap-1 rounded-xl bg-kasa-surface2 p-1">
            {METALS.map((m) => (
              <button key={m} className={segClass(m)} onClick={() => setMetalType(m)}>
                {METAL_SHORT[m]}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Field label="Gram">
              <input
                type="text"
                inputMode="decimal"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="12.5"
                className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
              />
            </Field>

            <Field label="Gram başına ort. maliyet (₺)">
              <input
                type="text"
                inputMode="decimal"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                placeholder="3500"
                className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
              />
            </Field>

            <Field label="Alış kaynağı (opsiyonel)">
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Kuveyt Türk, Kapalıçarşı..."
                className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
            </Field>
          </div>

          <button onClick={handleSave} className="mt-5 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            {editHolding ? 'Değişikliği Kaydet' : 'Pozisyonu Kaydet'}
          </button>

          {editHolding && (
            <button onClick={() => setShowConfirm(true)} className="mt-2 w-full rounded-lg border border-kasa-red/30 py-2 text-sm text-kasa-red">
              Bu Pozisyonu Sil
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