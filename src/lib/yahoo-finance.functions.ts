import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const inputSchema = z.object({
  symbols: z.array(z.string().min(1).max(20).regex(/^[A-Z0-9.]+$/)).min(1).max(100),
});

export const fetchStockPrices = createServerFn({ method: 'POST' })
  .inputValidator((input: { symbols: string[] }) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const results: Record<string, number> = {};
    const changes: Record<string, number> = {};
    const names: Record<string, { shortName?: string; longName?: string }> = {};

    try {
      const fetches = data.symbols.map(async (symbol) => {
        const yahooSymbol = symbol.includes('.') ? symbol : symbol + '.IS';
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1d`;
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          });
          if (!res.ok) {
            console.error(`Yahoo chart error for ${yahooSymbol}: ${res.status}`);
            return;
          }
          const json = await res.json();
          const meta = json?.chart?.result?.[0]?.meta;
          if (meta?.regularMarketPrice) {
            results[symbol] = meta.regularMarketPrice;
            const prev = meta.chartPreviousClose ?? meta.previousClose;
            if (typeof prev === 'number' && prev > 0) {
              changes[symbol] = ((meta.regularMarketPrice - prev) / prev) * 100;
            }
            const shortName = typeof meta.shortName === 'string' ? meta.shortName : undefined;
            const longName = typeof meta.longName === 'string' ? meta.longName : undefined;
            if (shortName || longName) {
              names[symbol] = { shortName, longName };
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${yahooSymbol}:`, e);
        }
      });

      await Promise.all(fetches);

      return { prices: results, changes, names, error: null };
    } catch (err) {
      console.error('Yahoo Finance fetch failed:', err);
      return { prices: results, changes, names, error: 'Yahoo Finance bağlantı hatası' };
    }
  });