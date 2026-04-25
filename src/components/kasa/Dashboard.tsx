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
import { fetchStockPrices } from '@/lib/yahoo-finance.functions';
import { ThemeToggle } from '@/components/ThemeToggle';

type Tab = 'holdings' | 'analytics' | 'transactions';

export function Dashboard() {
  const { user, profileName, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<Tab>('holdings');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const positions = calculatePortfolio(transactions, prices);
  const totalDividend = getTotalDividend(transactions);

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
    if (symbols.length === 0) return;
    setRefreshing(true);
    try {
      const result = await fetchStockPrices({ data: { symbols } });
      if (result.prices && Object.keys(result.prices).length > 0) {
        const newPrices = { ...prices, ...result.prices };
        setPrices(newPrices);
        // Upsert to cache
        const rows = Object.entries(result.prices).map(([symbol, price]) => ({
          user_id: userId, symbol, price, updated_at: new Date().toISOString()
        }));
        for (const row of rows) {
          await supabase.from('price_cache').upsert(row, { onConflict: 'user_id,symbol' });
        }
      }
    } catch (err) {
      console.error('Price refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-center text-xs font-semibold transition-colors ${tab === t ? 'text-primary border-b-2 border-primary' : 'text-kasa-text2'}`;

  return (
    <div className="min-h-screen bg-background">
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
        <SummaryCards positions={positions} totalDividend={totalDividend} hasTransactions={transactions.length > 0} />

        {/* Tabs */}
        <div className="mt-6 flex border-b border-border">
          <button className={tabClass('holdings')} onClick={() => setTab('holdings')}>Portföy</button>
          <button className={tabClass('analytics')} onClick={() => setTab('analytics')}>Analiz</button>
          <button className={tabClass('transactions')} onClick={() => setTab('transactions')}>İşlemler</button>
        </div>

        <div className="mt-4 pb-24">
          {tab === 'holdings' && <HoldingsView positions={positions} onAddFirst={() => setModalOpen(true)} />}
          {tab === 'analytics' && <AnalyticsView positions={positions} />}
          {tab === 'transactions' && <TransactionsView transactions={transactions} onEdit={handleEdit} />}
        </div>
      </main>

      {/* FAB */}
      <button
        onClick={() => { setEditTx(null); setModalOpen(true); }}
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