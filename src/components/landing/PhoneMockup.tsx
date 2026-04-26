import type { ReactNode } from 'react';

export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-[260px] shrink-0 rounded-[2.5rem] border border-neutral-800 bg-neutral-950 p-2 shadow-2xl ${className}`}
      style={{ boxShadow: '0 30px 60px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset' }}
    >
      <div className="overflow-hidden rounded-[2rem] bg-[#0a0a0a]">
        <div className="aspect-[9/19.5] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function PhoneHeader() {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <span className="font-display text-[15px] font-semibold tracking-tight text-white">bikasa.me</span>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full border border-neutral-700" />
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A8E40C] text-[10px] font-semibold text-neutral-950">A</div>
      </div>
    </div>
  );
}

function Tabs({ active }: { active: 'portfolio' | 'metals' | 'analytics' | 'transactions' }) {
  const tabs = [
    { id: 'portfolio', label: 'Portföy' },
    { id: 'metals', label: 'Metaller' },
    { id: 'analytics', label: 'Analiz' },
    { id: 'transactions', label: 'İşlemler' },
  ] as const;
  return (
    <div className="mx-3 mb-2 flex items-center gap-1 rounded-full bg-neutral-900/80 p-1">
      {tabs.map((t) => (
        <div
          key={t.id}
          className={`flex-1 rounded-full py-1 text-center text-[9px] font-medium transition-colors ${
            t.id === active ? 'bg-[#A8E40C] text-neutral-950' : 'text-neutral-400'
          }`}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}

function MetricCard({ label, value, delta, deltaColor = 'green' }: { label: string; value: string; delta?: string; deltaColor?: 'green' | 'red' | 'neutral' }) {
  const colorClass = deltaColor === 'green' ? 'text-[#9BE15D]' : deltaColor === 'red' ? 'text-[#FF6B6B]' : 'text-neutral-400';
  return (
    <div className="rounded-xl bg-neutral-900 p-2.5">
      <p className="text-[8px] uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-0.5 font-display text-[13px] font-semibold text-white">{value}</p>
      {delta && <p className={`text-[8px] font-medium ${colorClass}`}>{delta}</p>}
    </div>
  );
}

function HoldingRow({ symbol, company, sub, value, delta, deltaColor }: { symbol: string; company: string; sub: string; value: string; delta: string; deltaColor: 'green' | 'red' }) {
  const colorClass = deltaColor === 'green' ? 'text-[#9BE15D]' : 'text-[#FF6B6B]';
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-900 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold text-white">
          {symbol} <span className="font-normal text-neutral-500">· {company}</span>
        </p>
        <p className="truncate text-[8px] text-neutral-500">{sub}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-semibold text-white">{value}</p>
        <p className={`text-[8px] font-medium ${colorClass}`}>{delta}</p>
      </div>
    </div>
  );
}

export function PortfolioPhoneScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      <PhoneHeader />
      <div className="px-3">
        <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 p-3">
          <p className="text-[8px] uppercase tracking-wider text-neutral-500">Toplam Portföy Değeri</p>
          <p className="mt-1 font-display text-[22px] font-semibold tracking-tight">127.450,00 ₺</p>
          <p className="text-[10px] font-medium text-[#9BE15D]">+2.341,80 ₺ (+1,87%)</p>
          <p className="mt-1 text-[9px] italic text-neutral-500">Portföyün formda.</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 px-3">
        <MetricCard label="Potansiyel K/Z" value="+8.230 ₺" />
        <MetricCard label="Gerçekleşen K/Z" value="+12.580 ₺" />
        <MetricCard label="Bugünkü Değişim" value="+2.341 ₺" delta="+1,87%" />
        <MetricCard label="Toplam Temettü" value="450 ₺" deltaColor="neutral" />
      </div>
      <div className="mt-2">
        <Tabs active="portfolio" />
      </div>
      <div className="space-y-1.5 px-3">
        <HoldingRow symbol="AKBNK" company="Akbank" sub="Garanti · 850 adet" value="45.230 ₺" delta="+1.420 ₺ (+3,24%)" deltaColor="green" />
        <HoldingRow symbol="TUPRS" company="Tüpraş" sub="Midas · 240 adet" value="38.120 ₺" delta="+892 ₺ (+2,40%)" deltaColor="green" />
        <HoldingRow symbol="EREGL" company="Ereğli" sub="İş Yatırım · 1.250 adet" value="28.490 ₺" delta="-145 ₺ (-0,51%)" deltaColor="red" />
      </div>
    </div>
  );
}

export function AnalyticsPhoneScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      <PhoneHeader />
      <Tabs active="analytics" />
      <div className="px-3">
        <div className="rounded-2xl bg-neutral-900 p-3">
          <p className="text-[9px] uppercase tracking-wider text-neutral-500">Varlık Sınıfı Dağılımı</p>
          <div className="mt-2 flex items-center justify-center">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1f1f1f" strokeWidth="14" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#A8E40C" strokeWidth="14" strokeDasharray={`${0.72 * 251.3} 251.3`} />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#5DA8E4" strokeWidth="14" strokeDasharray={`${0.28 * 251.3} 251.3`} strokeDashoffset={`-${0.72 * 251.3}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[7px] uppercase text-neutral-500">Toplam</p>
                <p className="font-display text-[12px] font-semibold">127.450 ₺</p>
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[9px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#A8E40C]" />
                <span className="text-neutral-300">Hisseler</span>
              </div>
              <span className="text-neutral-400">72% · 91.764 ₺</span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#5DA8E4]" />
                <span className="text-neutral-300">Metaller</span>
              </div>
              <span className="text-neutral-400">28% · 35.686 ₺</span>
            </div>
          </div>
        </div>
        <div className="mt-2 rounded-2xl bg-neutral-900 p-3">
          <p className="text-[9px] uppercase tracking-wider text-neutral-500">Hisse Dağılımı</p>
          <div className="mt-2 flex items-center justify-center">
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1f1f1f" strokeWidth="14" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#A8E40C" strokeWidth="14" strokeDasharray={`${0.4 * 251.3} 251.3`} />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#D4F542" strokeWidth="14" strokeDasharray={`${0.35 * 251.3} 251.3`} strokeDashoffset={`-${0.4 * 251.3}`} />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#5C8A0A" strokeWidth="14" strokeDasharray={`${0.25 * 251.3} 251.3`} strokeDashoffset={`-${0.75 * 251.3}`} />
              </svg>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[8px]">
            <div><span className="block h-1 w-full rounded-full bg-[#A8E40C]" /><span className="mt-1 block text-neutral-400">AKBNK 40%</span></div>
            <div><span className="block h-1 w-full rounded-full bg-[#D4F542]" /><span className="mt-1 block text-neutral-400">TUPRS 35%</span></div>
            <div><span className="block h-1 w-full rounded-full bg-[#5C8A0A]" /><span className="mt-1 block text-neutral-400">EREGL 25%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetalsPhoneScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      <PhoneHeader />
      <Tabs active="metals" />
      <div className="px-3">
        <div className="rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 p-3">
          <p className="text-[8px] uppercase tracking-wider text-neutral-500">Toplam Metal Değeri</p>
          <p className="mt-1 font-display text-[20px] font-semibold tracking-tight">35.686,00 ₺</p>
          <p className="text-[10px] font-medium text-[#9BE15D]">+512,30 ₺ (+1,46%)</p>
        </div>
      </div>
      <div className="mt-2 space-y-1.5 px-3">
        <HoldingRow symbol="Altın" company="" sub="12,5 gr · İş Bankası" value="85.187 ₺" delta="+1,2% bugün" deltaColor="green" />
        <HoldingRow symbol="Gümüş" company="" sub="85,4 gr · Kuveyt Türk" value="9.353 ₺" delta="+0,8% bugün" deltaColor="green" />
        <HoldingRow symbol="Platin" company="" sub="0,8 gr · Kapalıçarşı" value="2.344 ₺" delta="+2,1% bugün" deltaColor="green" />
      </div>
    </div>
  );
}
