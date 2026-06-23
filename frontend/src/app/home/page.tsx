'use client';

import { AuthGuard } from '@/components/auth-guard';
import { Dashboard } from '@/components/dashboard';
import { useSession } from '@/hooks/use-session';

/** The signed-in app home: the notes dashboard, gated behind auth. */
function HomeDashboard() {
  const { session } = useSession();
  return <Dashboard email={session?.user.email ?? undefined} />;
}

export default function HomeRoute() {
  return (
    <AuthGuard>
      <HomeDashboard />
    </AuthGuard>
  );
}
