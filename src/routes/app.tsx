import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from '@/hooks/use-auth';
import { AuthScreen } from '@/components/kasa/AuthScreen';
import { Dashboard } from '@/components/kasa/Dashboard';

export const Route = createFileRoute("/app")({
  component: AppPage,
  head: () => ({
    meta: [
      { title: "bikasa.me — Uygulama" },
      { name: "description", content: "Borsa portföyünüzü tek yerden takip edin" },
    ],
  }),
});

function AppPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-display text-xl text-foreground">Bikasa.me</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthScreen />;
}
