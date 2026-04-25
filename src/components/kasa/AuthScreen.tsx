import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('E-posta ve şifre zorunlu.'); return; }
    if (password.length < 6) { setError('Şifre en az 6 karakter olmalı.'); return; }
    if (mode === 'register' && !name) { setError('Adını gir.'); return; }

    setLoading(true);
    try {
      if (mode === 'register') {
        const { error: err } = await signUp(email, password, name);
        if (err) { setError(err.message); return; }
      } else {
        const { error: err } = await signIn(email, password);
        if (err) { setError('E-posta veya şifre hatalı.'); return; }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-3">
          <img
            src="/wordmark-on-light.png"
            srcSet="/wordmark-on-light.png 1x, /wordmark-on-light@2x.png 2x"
            alt="bikasa.me"
            className="h-10 w-auto dark:hidden"
          />
          <img
            src="/wordmark-on-dark.png"
            srcSet="/wordmark-on-dark.png 1x, /wordmark-on-dark@2x.png 2x"
            alt="bikasa.me"
            className="hidden h-10 w-auto dark:block"
          />
        </div>
        <p className="mb-1 text-sm text-kasa-text2">
          Borsa portföyünüzü tek yerden, zahmetsizce takip edin.
        </p>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="mb-1 block text-xs text-kasa-text2">Adın</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-kasa-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                placeholder="Adın"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-kasa-text2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-kasa-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              placeholder="sen@ornek.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-kasa-text2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-kasa-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              placeholder="••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-kasa-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-kasa-text2">
          {mode === 'login' ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-primary underline"
          >
            {mode === 'login' ? 'Kayıt ol' : 'Giriş yap'}
          </button>
        </p>
      </div>
    </div>
  );
}