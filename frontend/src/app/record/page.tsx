'use client';

import { useRouter } from 'next/navigation';
import { RecordFirst } from '@/components/record-first';
import { useSession } from '@/hooks/use-session';

export default function RecordPage() {
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading) {
    return <main className="min-h-screen grid place-items-center eyebrow animate-pulse">Loading…</main>;
  }
  if (!session) {
    router.replace('/login');
    return null;
  }
  return <RecordFirst />;
}
