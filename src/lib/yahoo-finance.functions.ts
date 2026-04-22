import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

const inputSchema = z.object({
  symbols: z.array(z.string().min(1).max(20).regex(/^[A-Z0-9.]+$/)).min(1).max(100),
});

export const fetchStockPrices = createServerFn({ method: 'POST' })
  .inputValidator((input: { symbols: string[] }) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const results: Record<string, number> = {};
    const yahooSymbols = data.symbols.map(s => s.includes('.') ? s : s + '.IS');
    const query = yahooSymbols.join(',');

    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(query)}&fields=regularMarketPrice,symbol`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (!res.ok) {
        console.error(`Yahoo Finance API error: ${res.status}`);
        return { prices: results, error: `Yahoo Finance API returned ${res.status}` };
      }

      const json = await res.json();
      const quotes = json?.quoteResponse?.result || [];

      for (const quote of quotes) {
        const originalSymbol = quote.symbol?.replace('.IS', '') || '';
        if (quote.regularMarketPrice && originalSymbol) {
          results[originalSymbol] = quote.regularMarketPrice;
        }
      }

      return { prices: results, error: null };
    } catch (err) {
      console.error('Yahoo Finance fetch failed:', err);
      return { prices: results, error: 'Yahoo Finance bağlantı hatası' };
    }
  });