export interface Transaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell' | 'div';
  symbol: string;
  date: string;
  broker?: string | null;
  qty?: number | null;
  price?: number | null;
  commission?: number | null;
  gross_amount?: number | null;
  tax_pct?: number | null;
}

export interface Position {
  symbol: string;
  broker: string;
  openQty: number;
  avgBuy: number;
  avgSell: number;
  realizedPnl: number;
  currentPrice: number;
  openValue: number;
  openCost: number;
  unrealizedPnl: number;
  dividend: number;
}

export function calculatePortfolio(
  transactions: Transaction[],
  currentPrices: Record<string, number>
): Position[] {
  const positions: Record<string, any> = {};

  for (const t of transactions) {
    if (t.type === 'div') {
      const divKey = t.symbol + '|__DIV__';
      if (!positions[divKey]) positions[divKey] = { symbol: t.symbol, broker: '__DIV__', divTotal: 0 };
      const net = (t.gross_amount || 0) * (1 - (t.tax_pct || 0) / 100);
      positions[divKey].divTotal += net;
      continue;
    }
    const key = t.symbol + '|' + (t.broker || 'Diğer');
    if (!positions[key]) {
      positions[key] = {
        symbol: t.symbol, broker: t.broker || 'Diğer',
        buyQty: 0, sellQty: 0, totalBuyCost: 0, totalSellRevenue: 0
      };
    }
    const p = positions[key];
    const cost = (t.qty || 0) * (t.price || 0) * (1 + (t.commission || 0) / 100);
    const revenue = (t.qty || 0) * (t.price || 0) * (1 - (t.commission || 0) / 100);
    if (t.type === 'buy') { p.buyQty += (t.qty || 0); p.totalBuyCost += cost; }
    else if (t.type === 'sell') { p.sellQty += (t.qty || 0); p.totalSellRevenue += revenue; }
  }

  const divBySymbol: Record<string, number> = {};
  Object.values(positions).forEach((p: any) => {
    if (p.broker === '__DIV__') divBySymbol[p.symbol] = p.divTotal;
  });

  return Object.values(positions)
    .filter((p: any) => p.broker !== '__DIV__')
    .map((p: any) => {
      const openQty = p.buyQty - p.sellQty;
      const avgBuy = p.buyQty > 0 ? p.totalBuyCost / p.buyQty : 0;
      const avgSell = p.sellQty > 0 ? p.totalSellRevenue / p.sellQty : 0;
      const realizedPnl = p.sellQty > 0 ? (avgSell - avgBuy) * p.sellQty : 0;
      const currentPrice = currentPrices[p.symbol] || 0;
      const openValue = openQty * currentPrice;
      const openCost = openQty * avgBuy;
      const unrealizedPnl = openValue - openCost;
      const dividend = divBySymbol[p.symbol] || 0;
      return { symbol: p.symbol, broker: p.broker, openQty, avgBuy, avgSell, realizedPnl, currentPrice, openValue, openCost, unrealizedPnl, dividend };
    });
}

export function getTotalDividend(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'div')
    .reduce((sum, t) => sum + (t.gross_amount || 0) * (1 - (t.tax_pct || 0) / 100), 0);
}

export function fmt(n: number): string {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtInt(n: number): string {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
}