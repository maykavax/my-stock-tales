import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from 'react';
import { Menu, X, TrendingUp, Coins, PieChart, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Wordmark } from '@/components/landing/Wordmark';
import {
  PhoneFrame,
  PortfolioPhoneScreen,
  AnalyticsPhoneScreen,
  MetalsPhoneScreen,
} from '@/components/landing/PhoneMockup';

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "bikasa.me — Yatırım takip uygulaması" },
      { name: "description", content: "BIST hisseleri ve kıymetli metal yatırımlarını tek yerde takip et. Ücretsiz, hızlı, Türkiye'ye özel." },
      { property: "og:title", content: "bikasa.me — Yatırım takip uygulaması" },
      { property: "og:description", content: "BIST hisseleri ve kıymetli metal yatırımlarını tek yerden takip et. Ücretsiz, hızlı, Türkiye'ye özel." },
      { property: "og:type", content: "website" },
    ],
  }),
});

// Reveal-on-scroll wrapper
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}

function Header() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-border/50 bg-background/80 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center">
          <Wordmark className="h-6 w-auto sm:h-7" />
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Uygulamaya Git <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/app" className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                Giriş Yap
              </Link>
              <Link
                to="/app"
                className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                Ücretsiz Başla
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Menü"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border/50 bg-background md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            {user ? (
              <Link
                to="/app"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Uygulamaya Git
              </Link>
            ) : (
              <>
                <Link
                  to="/app"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-center text-sm font-medium text-foreground"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/app"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                >
                  Ücretsiz Başla
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* lime gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#A8E40C]/15 blur-3xl" />
        <div className="absolute -right-32 top-40 h-[400px] w-[400px] rounded-full bg-[#D4F542]/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div>
          <Reveal>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Yatırımlarını tek yerde topla,
              <br />
              <span className="bg-gradient-to-r from-[#5C8A0A] via-[#A8E40C] to-[#D4F542] bg-clip-text text-transparent">
                tek bakışta gör.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              BIST hisselerini, gram altın, gümüş, platin ve paladyum yatırımlarını aynı ekrandan
              takip et. Ücretsiz, hızlı, Türkiye'ye özel.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col items-start gap-3">
              <Link
                to="/app"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-[0_8px_30px_-8px_rgba(168,228,12,0.6)] transition-all hover:scale-[1.03] hover:shadow-[0_12px_40px_-8px_rgba(168,228,12,0.8)]"
              >
                Ücretsiz Başla
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/app" className="text-sm font-medium text-foreground/70 underline-offset-4 hover:text-foreground hover:underline">
                Zaten hesabım var
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal delay={300} className="relative">
          <PhoneShowcase />
        </Reveal>
      </div>
    </section>
  );
}

function PhoneShowcase() {
  return (
    <>
      {/* Desktop / tablet: three overlapping phones */}
      <div className="relative hidden h-[560px] items-center justify-center sm:flex">
        <div className="absolute left-0 top-8 -rotate-[8deg] transform-gpu transition-transform duration-500 hover:rotate-[-4deg] hover:scale-[1.02]">
          <PhoneFrame>
            <AnalyticsPhoneScreen />
          </PhoneFrame>
        </div>
        <div className="relative z-10 transform-gpu transition-transform duration-500 hover:-translate-y-2">
          <PhoneFrame>
            <PortfolioPhoneScreen />
          </PhoneFrame>
        </div>
        <div className="absolute right-0 top-8 rotate-[8deg] transform-gpu transition-transform duration-500 hover:rotate-[4deg] hover:scale-[1.02]">
          <PhoneFrame>
            <MetalsPhoneScreen />
          </PhoneFrame>
        </div>
      </div>
      {/* Mobile: horizontal carousel */}
      <div className="sm:hidden">
        <PhoneCarousel />
      </div>
    </>
  );
}

function PhoneCarousel() {
  const slides = [
    { key: 'portfolio', node: <PortfolioPhoneScreen /> },
    { key: 'analytics', node: <AnalyticsPhoneScreen /> },
    { key: 'metals', node: <MetalsPhoneScreen /> },
  ];
  const [active, setActive] = useState(0);
  const userInteractedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Auto-advance every 4s until user interacts
  useEffect(() => {
    const id = window.setInterval(() => {
      if (userInteractedRef.current) return;
      setActive((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  // Programmatic scroll when active changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const child = el.children[active] as HTMLElement | undefined;
    if (!child) return;
    isProgrammaticScroll.current = true;
    el.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
    const t = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
    return () => window.clearTimeout(t);
  }, [active]);

  const handleTouchStart = () => {
    userInteractedRef.current = true;
  };

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active && idx >= 0 && idx < slides.length) {
      setActive(idx);
    }
  };

  const goTo = (i: number) => {
    userInteractedRef.current = true;
    setActive(i);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onScroll={handleScroll}
        className="flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollBehavior: 'smooth' }}
      >
        {slides.map((s) => (
          <div key={s.key} className="flex w-full shrink-0 snap-center justify-center py-2">
            <PhoneFrame>{s.node}</PhoneFrame>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? 'w-6 bg-[#A8E40C]' : 'w-2 bg-neutral-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Hisse Takibi',
      desc: "BIST'teki tüm hisselerinin ortalama maliyetini, güncel değerini, kar/zararını ve temettü gelirini takip et. Yahoo Finance ile canlı fiyat güncellemesi.",
    },
    {
      icon: Coins,
      title: 'Metal Takibi',
      desc: 'Gram altın, gümüş, platin ve paladyum pozisyonlarını aynı yerde tut. Kuveyt Türk, Kapalıçarşı veya banka altın hesabın nereden olursa olsun.',
    },
    {
      icon: PieChart,
      title: 'Akıllı Analiz',
      desc: 'Varlık sınıfı dağılımını gör, riskini dengele. Hangi hisse veya metal ne kadar ağırlıkta, anında anla.',
    },
  ];
  return (
    <section className="border-t border-border/50 bg-secondary/30 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            Bütün varlıkların, <span className="italic text-[#5C8A0A] dark:text-[#A8E40C]">tek ekranda.</span>
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 120}>
              <div className="group h-full rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Ücretsiz hesap aç', desc: 'E-postanla kayıt ol, 30 saniyede hazırsın.' },
    { n: '02', title: 'Pozisyonlarını ekle', desc: 'Hisse ve metal alımlarını gir, ortalama maliyetini bilesin.' },
    { n: '03', title: 'Her gün takip et', desc: 'Otomatik fiyat güncellemesi, anında kar/zarar.' },
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Üç adımda başla.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="relative">
                <div className="font-display text-6xl font-semibold text-primary/30">{s.n}</div>
                <h3 className="mt-3 font-display text-2xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-[#D4F542]/30 via-[#A8E40C]/20 to-[#5C8A0A]/30 px-6 py-20 text-center sm:py-24">
        <div aria-hidden className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#A8E40C]/40 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#D4F542]/40 blur-3xl" />
        </div>
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Portföyünü hak ettiği yere taşı.
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-4 max-w-xl text-base text-foreground/80 sm:text-lg">
            Excel'den, defterlerden, dağınık notlardan kurtul.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <Link
            to="/app"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-semibold text-background transition-transform hover:scale-[1.04]"
          >
            Ücretsiz Başla <ArrowRight size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Wordmark className="h-7 w-auto" />
            <p className="mt-3 text-sm text-muted-foreground">Yatırım takibinde, Türkiye'ye özel.</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Bağlantılar</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground">Hakkında</a></li>
              <li><a href="mailto:bistkasa@gmail.com" className="hover:text-foreground">İletişim</a></li>
              <li><a href="#privacy" className="hover:text-foreground">Gizlilik Politikası</a></li>
              <li><a href="#terms" className="hover:text-foreground">Kullanım Koşulları</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Sosyal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Twitter / X</a></li>
              <li><a href="#" className="hover:text-foreground">GitHub</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-12 text-xs leading-relaxed text-muted-foreground/70">
          bikasa.me bir yatırım tavsiyesi sağlamıyor. Bu site sadece kişisel portföy takibi
          amaçlıdır. Yatırım kararlarını kendi araştırmanız ve lisanslı danışmanların görüşüyle
          alınız.
        </p>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
