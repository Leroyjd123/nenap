'use client';

import { useQuery } from '@tanstack/react-query';
import type { HealthResponse, MeResponse } from '@nenap/types';
import { apiFetch } from '@/lib/api';

/**
 * Phase 1 proof-of-life: pings the public /health endpoint and the authenticated /me
 * endpoint. /me succeeding end-to-end confirms the Supabase-JWT → NestJS handshake.
 */
export function ConnectionStatus() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<HealthResponse>('/health'),
  });

  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeResponse>('/me'),
    retry: false,
  });

  return (
    <div className="bg-surface border border-line rounded-[var(--r)] shadow-1 p-[var(--pad)]">
      <p className="eyebrow m-0 mb-3">System</p>
      <ul className="m-0 p-0 list-none flex flex-col gap-2 text-sm">
        <li className="flex items-center gap-2">
          <Dot ok={health.isSuccess} pending={health.isLoading} />
          <span className="text-ink-2">Backend</span>
          <span className="ml-auto font-mono text-[12px] text-ink-3">
            {health.isLoading ? '…' : health.isSuccess ? 'reachable' : 'offline'}
          </span>
        </li>
        <li className="flex items-center gap-2">
          <Dot ok={me.isSuccess} pending={me.isLoading} />
          <span className="text-ink-2">Authenticated session</span>
          <span className="ml-auto font-mono text-[12px] text-ink-3">
            {me.isLoading ? '…' : me.isSuccess ? me.data.email || 'signed in' : 'not signed in'}
          </span>
        </li>
      </ul>
    </div>
  );
}

function Dot({ ok, pending }: { ok: boolean; pending: boolean }) {
  const color = pending ? 'var(--ink-3)' : ok ? 'var(--accent)' : 'var(--rec)';
  return (
    <span
      className="w-2 h-2 rounded-full flex-none"
      style={{ background: color, boxShadow: `0 0 0 3px color-mix(in oklab, ${color} 18%, transparent)` }}
    />
  );
}
