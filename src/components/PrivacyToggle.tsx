import { Eye, EyeOff } from 'lucide-react';
import { usePrivacy } from './PrivacyProvider';

export function PrivacyToggle() {
  const { privacy, toggle } = usePrivacy();
  return (
    <button
      onClick={toggle}
      aria-label={privacy ? 'Gizlilik modunu kapat' : 'Gizlilik modunu aç'}
      title={privacy ? 'Gizlilik modu açık' : 'Gizlilik modu kapalı'}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
    >
      {privacy ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}