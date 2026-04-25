import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { calculatePortfolio, getTotalDividend } from '@/lib/portfolio';
import type { Transaction } from '@/lib/portfolio';
import { SummaryCards } from './SummaryCards';
import { HoldingsView } from './HoldingsView';
import { TransactionsView } from './TransactionsView';
import { AnalyticsView } from './AnalyticsView';
import { TransactionModal } from './TransactionModal';
import { MetalsView } from './MetalsView';
import { MetalModal } from './MetalModal';
import { fetchStockPrices } from '@/lib/yahoo-finance.functions';
import { fetchMetalPrices, calculateMetalPositions } from '@/lib/metals';
import type { MetalHolding, MetalPrices } from '@/lib/metals';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'holdings' | 'metals' | 'analytics' | 'transactions';

export function Dashboard() {
  const { user, profileName, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>('holdings');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [metalHoldings, setMetalHoldings] = useState<MetalHolding[]>([]);
  const [metalPrices, setMetalPrices] = useState<MetalPrices>({ gold: undefined, silver: undefined, platinum: undefined, palladium: undefined });
  const [metalsStale, setMetalsStale] = useState(false);
  const [metalModalOpen, setMetalModalOpen] = useState(false);
  const [editMetal, setEditMetal] = useState<MetalHolding | null>(null);

  const userId = user?.id || '';

  // Load transactions
  const loadData = useCallback(async () => {
    if (!userId) return;
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (txs) setTransactions(txs as Transaction[]);

    const { data: cached } = await supabase
      .from('price_cache')
      .select('*')
      .eq('user_id', userId);
    if (cached) {
      const p: Record<string, number> = {};
      for (const c of cached) p[c.symbol] = c.price;
      setPrices(p);
    }

    const { data: metals } = await supabase
      .from('metal_holdings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (metals) setMetalHoldings(metals as MetalHolding[]);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Fetch metal prices on mount
  const refreshMetalPrices = useCallback(async () => {
    try {
      const p = await fetchMetalPrices();
      setMetalPrices(p);
      setMetalsStale(false);
    } catch (err) {
      console.error('Metal price fetch error:', err);
      setMetalsStale(true);
    }
  }, []);

  useEffect(() => { refreshMetalPrices(); }, [refreshMetalPrices]);

  const positions = calculatePortfolio(transactions, prices);
  const totalDividend = getTotalDividend(transactions);
  const metalPositions = calculateMetalPositions(metalHoldings, metalPrices);
  const metalsValue = metalPositions.reduce((s, p) => s + p.currentValue, 0);
  const metalsPnl = metalPositions.reduce((s, p) => s + p.pnl, 0);

  // Today's change in TRY: sum over all positions of currentValue * (changePct/100)
  const stocksDailyChange = positions.reduce((s, p) => {
    const ch = stockChanges[p.symbol];
    if (typeof ch !== 'number') return s;
    return s + p.openValue * (ch / 100);
  }, 0);
  const metalsDailyChange = metalPositions.reduce(
    (s, p) => s + p.currentValue * (p.dailyChange / 100),
    0,
  );
  const dailyChange = stocksDailyChange + metalsDailyChange;

  // Save transaction
  const handleSaveTx = async (tx: Omit<Transaction, 'id' | 'user_id'>) => {
    if (editTx) {
      await supabase.from('transactions').update({ ...tx }).eq('id', editTx.id);
    } else {
      await supabase.from('transactions').insert({ ...tx, user_id: userId });
      // Set initial price if not cached
      if (tx.type !== 'div' && tx.price && !prices[tx.symbol]) {
        await supabase.from('price_cache').upsert(
          { user_id: userId, symbol: tx.symbol, price: tx.price, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,symbol' }
        );
      }
    }
    setModalOpen(false);
    setEditTx(null);
    loadData();
  };

  const handleDeleteTx = async () => {
    if (editTx) {
      await supabase.from('transactions').delete().eq('id', editTx.id);
      setModalOpen(false);
      setEditTx(null);
      loadData();
    }
  };

  const handleEdit = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) { setEditTx(tx); setModalOpen(true); }
  };

  // Refresh prices from Yahoo Finance
  const handleRefresh = async () => {
    const symbols = [...new Set(transactions.filter(t => t.type !== 'div').map(t => t.symbol))];
    setRefreshing(true);
    try {
      if (symbols.length > 0) {
        const result = await fetchStockPrices({ data: { symbols } });
        if (result.prices && Object.keys(result.prices).length > 0) {
          const newPrices = { ...prices, ...result.prices };
          setPrices(newPrices);
          const rows = Object.entries(result.prices).map(([symbol, price]) => ({
            user_id: userId, symbol, price, updated_at: new Date().toISOString()
          }));
          for (const row of rows) {
            await supabase.from('price_cache').upsert(row, { onConflict: 'user_id,symbol' });
          }
        }
        if (result.changes) {
          setStockChanges((prev) => ({ ...prev, ...result.changes }));
        }
      }
      await refreshMetalPrices();
    } catch (err) {
      console.error('Price refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Save / delete metal holding
  const handleSaveMetal = async (h: Omit<MetalHolding, 'id' | 'user_id' | 'created_at'>) => {
    if (editMetal) {
      await supabase.from('metal_holdings').update({ ...h }).eq('id', editMetal.id);
    } else {
      await supabase.from('metal_holdings').insert({ ...h, user_id: userId });
    }
    setMetalModalOpen(false);
    setEditMetal(null);
    loadData();
  };

  const handleDeleteMetal = async () => {
    if (editMetal) {
      await supabase.from('metal_holdings').delete().eq('id', editMetal.id);
      setMetalModalOpen(false);
      setEditMetal(null);
      loadData();
    }
  };

  const handleEditMetal = (id: string) => {
    const m = metalHoldings.find((x) => x.id === id);
    if (m) { setEditMetal(m); setMetalModalOpen(true); }
  };

  const handleFabClick = () => {
    if (tab === 'metals') {
      setEditMetal(null);
      setMetalModalOpen(true);
    } else {
      setEditTx(null);
      setModalOpen(true);
    }
  };

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-kasa-text2'}`;

  return (
    <div className="min-h-screen bg-background" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center">
          <img
            src="/wordmark-on-light.png"
            srcSet="/wordmark-on-light.png 1x, /wordmark-on-light@2x.png 2x"
            alt="bikasa.me"
            className="h-7 w-auto dark:hidden"
          />
          <img
            src="/wordmark-on-dark.png"
            srcSet="/wordmark-on-dark.png 1x, /wordmark-on-dark@2x.png 2x"
            alt="bikasa.me"
            className="hidden h-7 w-auto dark:block"
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-kasa-surface2 disabled:opacity-50"
          >
            {refreshing ? '↻ Güncelleniyor...' : '↻ Güncelle'}
          </button>
          <button
            onClick={() => setProfileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {(profileName || user?.email || 'U').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-4">
        <SummaryCards
          positions={positions}
          totalDividend={totalDividend}
          hasTransactions={transactions.length > 0}
          metalsValue={metalsValue}
          metalsPnl={metalsPnl}
          dailyChange={dailyChange}
        />

        {/* Tabs */}
        <div className="mt-6 flex border-b border-border">
          <button className={tabClass('holdings')} onClick={() => setTab('holdings')}>Portföy</button>
          <button className={tabClass('metals')} onClick={() => setTab('metals')}>Metaller</button>
          <button className={tabClass('analytics')} onClick={() => setTab('analytics')}>Analiz</button>
          <button className={tabClass('transactions')} onClick={() => setTab('transactions')}>İşlemler</button>
        </div>

        <div className="mt-4 pb-24">
          {tab === 'holdings' && <HoldingsView positions={positions} onAddFirst={() => setModalOpen(true)} />}
          {tab === 'metals' && (
            <MetalsView
              positions={metalPositions}
              pricesStale={metalsStale}
              onAddFirst={() => { setEditMetal(null); setMetalModalOpen(true); }}
              onEdit={handleEditMetal}
            />
          )}
          {tab === 'analytics' && (
            <AnalyticsView
              positions={positions}
              metalPositions={metalPositions}
              onAddFirst={handleFabClick}
            />
          )}
          {tab === 'transactions' && <TransactionsView transactions={transactions} onEdit={handleEdit} />}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={handleFabClick}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        +
      </button>

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTx(null); }}
        onSave={handleSaveTx}
        onDelete={handleDeleteTx}
        editTx={editTx}
      />

      {/* Metal Modal */}
      <MetalModal
        open={metalModalOpen}
        onClose={() => { setMetalModalOpen(false); setEditMetal(null); }}
        onSave={handleSaveMetal}
        onDelete={handleDeleteMetal}
        editHolding={editMetal}
      />

      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setProfileOpen(false)}>
          <div className="w-80 rounded-2xl border border-border bg-kasa-surface p-5" onClick={e => e.stopPropagation()}>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Hesap</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[10px] text-kasa-text2">E-posta</label>
                <input readOnly value={user?.email || ''} className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-kasa-text2">Ad</label>
                <input readOnly value={profileName} className="w-full rounded-lg border border-border bg-kasa-surface2 px-3 py-2 text-sm text-foreground" />
              </div>
            </div>
            <button onClick={signOut} className="mt-4 w-full rounded-lg border border-kasa-red/30 py-2 text-sm text-kasa-red">
              Çıkış Yap
            </button>
            <button onClick={() => setProfileOpen(false)} className="mt-2 w-full py-2 text-sm text-kasa-text2">
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}