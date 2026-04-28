export type MetalType = 'gold' | 'silver' | 'platinum' | 'palladium';

export interface MetalTransaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  metal_type: MetalType;
  grams: number;
  price_per_gram: number;
  source?: string | null;
  date: string;
  created_at?: string;
}

export interface MetalPrice {
  price: number;
  change: number;
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
  const cleaned = v.replace(/\./g, '').replace(',', '.').replace('%', '').trim();
  const n = parseFloat(cleaned);
  return isFinite(n) ? n : 0;
}

export async function fetchMetalPrices(): Promise<MetalPrices> {
  const url = `https://finans.truncgil.com/v4/today.json?_t=${Date.now()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Truncgil API error: ${res.status}`);
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
  } catch (err) {
    throw err;
  }
}

export interface MetalGroup {
  metal_type: MetalType;
  totalGrams: number;
  weightedAvgCost: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  realizedPnl: number;
  dailyChange: number;
  hasPrice: boolean;
}

/**
 * Aggregate metal transactions into per-metal positions.
 * Sells reduce open grams using the running weighted average cost basis
 * and contribute to realized P/L, mirroring stock portfolio logic.
 */
export function calculateMetalGroups(
  txs: MetalTransaction[],
  prices: MetalPrices,
): MetalGroup[] {
  const byMetal: Record<MetalType, MetalTransaction[]> = {
    gold: [], silver: [], platinum: [], palladium: [],
  };
  for (const t of txs) byMetal[t.metal_type].push(t);

  const groups: MetalGroup[] = [];
  (Object.keys(byMetal) as MetalType[]).forEach((m) => {
    const list = byMetal[m].slice().sort((a, b) =>
      a.date === b.date
        ? (a.created_at ?? '').localeCompare(b.created_at ?? '')
        : a.date.localeCompare(b.date),
    );
    if (list.length === 0) return;

    let openGrams = 0;
    let openCost = 0; // total TRY cost basis of currently held grams
    let realizedPnl = 0;

    for (const t of list) {
      if (t.type === 'buy') {
        openGrams += t.grams;
        openCost += t.grams * t.price_per_gram;
      } else {
        const sellG = Math.min(t.grams, openGrams);
        const avg = openGrams > 0 ? openCost / openGrams : 0;
        realizedPnl += (t.price_per_gram - avg) * sellG;
        openCost -= avg * sellG;
        openGrams -= sellG;
        if (openGrams < 1e-9) { openGrams = 0; openCost = 0; }
      }
    }

    const p = prices[m];
    const currentPrice = p?.price ?? (openGrams > 0 ? openCost / openGrams : 0);
    const currentValue = openGrams * currentPrice;
    const weightedAvgCost = openGrams > 0 ? openCost / openGrams : 0;
    const pnl = currentValue - openCost;
    const pnlPct = openCost > 0 ? (pnl / openCost) * 100 : 0;

    if (openGrams <= 0 && realizedPnl === 0) return; // skip empty
    if (openGrams <= 0) {
      // fully sold position — don't show as a holding card,
      // but realized P/L still belongs to the user. Caller computes total realized.
      groups.push({
        metal_type: m,
        totalGrams: 0,
        weightedAvgCost: 0,
        totalCost: 0,
        currentPrice,
        currentValue: 0,
        pnl: 0,
        pnlPct: 0,
        realizedPnl,
        dailyChange: p?.change ?? 0,
        hasPrice: !!p,
      });
      return;
    }
    groups.push({
      metal_type: m,
      totalGrams: openGrams,
      weightedAvgCost,
      totalCost: openCost,
      currentPrice,
      currentValue,
      pnl,
      pnlPct,
      realizedPnl,
      dailyChange: p?.change ?? 0,
      hasPrice: !!p,
    });
  });

  return groups;
}

/**
 * Compute realized P/L for a single sell transaction by replaying all earlier
 * transactions of the same metal up to (but not including) this one.
 */
export function realizedPnlForSell(
  sellTx: MetalTransaction,
  allTxs: MetalTransaction[],
): number {
  if (sellTx.type !== 'sell') return 0;
  const sorted = allTxs
    .filter((t) => t.metal_type === sellTx.metal_type)
    .slice()
    .sort((a, b) =>
      a.date === b.date
        ? (a.created_at ?? '').localeCompare(b.created_at ?? '')
        : a.date.localeCompare(b.date),
    );
  let openGrams = 0;
  let openCost = 0;
  for (const t of sorted) {
    if (t.id === sellTx.id) {
      const sellG = Math.min(t.grams, openGrams);
      const avg = openGrams > 0 ? openCost / openGrams : 0;
      return (t.price_per_gram - avg) * sellG;
    }
    if (t.type === 'buy') {
      openGrams += t.grams;
      openCost += t.grams * t.price_per_gram;
    } else {
      const sellG = Math.min(t.grams, openGrams);
      const avg = openGrams > 0 ? openCost / openGrams : 0;
      openCost -= avg * sellG;
      openGrams -= sellG;
      if (openGrams < 1e-9) { openGrams = 0; openCost = 0; }
    }
  }
  return 0;
}

/** Current open grams of a metal — used by sell-form validation. */
export function openGramsOf(metal: MetalType, txs: MetalTransaction[]): number {
  const sorted = txs
    .filter((t) => t.metal_type === metal)
    .slice()
    .sort((a, b) =>
      a.date === b.date
        ? (a.created_at ?? '').localeCompare(b.created_at ?? '')
        : a.date.localeCompare(b.date),
    );
  let g = 0;
  for (const t of sorted) {
    if (t.type === 'buy') g += t.grams;
    else g -= Math.min(t.grams, g);
    if (g < 1e-9) g = 0;
  }
  return g;
}

export function fmtGrams(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}
