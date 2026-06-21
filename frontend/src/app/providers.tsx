'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AnalyticsProvider } from '@/components/analytics-provider';
import { ToastProvider } from '@/components/ui/toast';

/** App-wide client providers. TanStack Query handles server-state caching. */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <AnalyticsProvider>
        <ToastProvider>{children}</ToastProvider>
      </AnalyticsProvider>
    </QueryClientProvider>
  );
}
