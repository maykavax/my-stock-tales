import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type PrivacyContextValue = {
  privacy: boolean;
  toggle: () => void;
  setPrivacy: (v: boolean) => void;
};

const PrivacyContext = createContext<PrivacyContextValue | undefined>(undefined);

function getInitial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('privacy') === '1';
  } catch {
    return false;
  }
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [privacy, setPrivacyState] = useState<boolean>(getInitial);

  useEffect(() => {
    try { localStorage.setItem('privacy', privacy ? '1' : '0'); } catch {}
  }, [privacy]);

  const toggle = () => setPrivacyState((p) => !p);
  const setPrivacy = (v: boolean) => setPrivacyState(v);

  return (
    <PrivacyContext.Provider value={{ privacy, toggle, setPrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) throw new Error('usePrivacy must be used within PrivacyProvider');
  return ctx;
}

/**
 * Mask renders its children but, when privacy mode is on, replaces every
 * digit with a • bullet so that all amounts stay the same width (the
 * surrounding mono/tabular-nums font keeps layout stable). Non-digit
 * characters (₺, ., , spaces, +/-, gr, %) are preserved so units and
 * separators remain readable.
 */
export function Mask({ children }: { children: string | number }) {
  const { privacy } = usePrivacy();
  const text = typeof children === 'number' ? String(children) : children;
  if (!privacy) return <>{text}</>;
  const masked = text.replace(/\d/g, '•');
  return <>{masked}</>;
}