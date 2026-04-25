import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

import { useAuth } from '@/hooks/use-auth';
import { AuthScreen } from '@/components/kasa/AuthScreen';
import { Dashboard } from '@/components/kasa/Dashboard';

function Index() {
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
