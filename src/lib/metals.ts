export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';

export interface MetalHolding {
  id: string;
  user_id: string;
  metal_type: MetalType;
  grams: number;
  avg_cost_try: number;
  purchase_source?: string | null;
  created_at?: string;
}

export interface MetalPrice {
  price: number;
  change: number; // daily % change
}

export type MetalPrices = Record<MetalType, MetalPrice | undefined>;

export const METAL_LABELS: Record<MetalType, string> = {
  gold: 'Gram Altın',
  silver: 'Gram Gümüş',
  platinum: 'Gram Platin',
  palladium: 'Gram Paladyum',
};

export const METAL_SHORT: Record<MetalType, string> = {
  gold: 'Altın',
  silver: 'Gümüş',
  platinum: 'Platin',
  palladium: 'Paladyum',
};

const TRUNCGIL_KEY: Record<MetalType, string> = {
  gold: 'GRA',
  silver: 'GUMUS',
  platinum: 'GPL',
  palladium: 'PAL',
};

function parseNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return 0;
  // Truncgil sometimes returns "4.123,45" tr-style
  const cleaned = v.replace(/\./g, '').replace(',', '.').replace('%', '').trim();
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  const res = await fetch('https://finans.truncgil.com/v4/today.json');
  if (!res.ok) throw new Error('Truncgil API error');
  const data = await res.json();
  const out: MetalPrices = { gold: undefined, silver: undefined, platinum: undefined, palladium: undefined };
  (Object.keys(TRUNCGIL_KEY) as MetalType[]).forEach((m) => {
    const node = data?.[TRUNCGIL_KEY[m]];
    if (node) {
      out[m] = {
        price: parseNumber(node.Selling ?? node.selling ?? node.Buying),
        change: parseNumber(node.Change ?? node.change ?? 0),
      };
    }
  });
  return out;
}

export interface MetalPosition {
  metal_type: MetalType;
  grams: number;
  avgCost: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  dailyChange: number; // %
  hasPrice: boolean;
  source?: string | null;
  id: string;
}

export function calculateMetalPositions(
  holdings: MetalHolding[],
  prices: MetalPrices,
): MetalPosition[] {
  return holdings.map((h) => {
    const p = prices[h.metal_type];
    const currentPrice = p?.price ?? h.avg_cost_try;
    const currentValue = h.grams * currentPrice;
    const totalCost = h.grams * h.avg_cost_try;
    const pnl = currentValue - totalCost;
    const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return {
      id: h.id,
      metal_type: h.metal_type,
      grams: h.grams,
      avgCost: h.avg_cost_try,
      totalCost,
      currentPrice,
      currentValue,
      pnl,
      pnlPct,
      dailyChange: p?.change ?? 0,
      hasPrice: !!p,
      source: h.purchase_source,
    };
  });
}

export function fmtGrams(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}