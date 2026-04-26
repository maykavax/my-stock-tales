import { useTheme } from '@/components/ThemeProvider';

export function Wordmark({ className = '', forceDark = false }: { className?: string; forceDark?: boolean }) {
  const { theme } = useTheme();
  const isDark = forceDark || theme === 'dark';
  const src = isDark ? '/wordmark-on-dark.png' : '/wordmark-on-light.png';
  const src2x = isDark ? '/wordmark-on-dark@2x.png' : '/wordmark-on-light@2x.png';
  return (
    <img
      src={src}
      srcSet={`${src} 1x, ${src2x} 2x`}
      alt="bikasa.me"
      className={className}
    />
  );
}
