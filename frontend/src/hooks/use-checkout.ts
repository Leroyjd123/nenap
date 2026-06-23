'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CheckoutSku, CreateOrderResponse } from '@nenap/types';
import { apiFetch } from '@/lib/api';
import { qk } from '@/lib/queries';
import { loadRazorpay, openCheckout } from '@/lib/razorpay';
import { useToast } from '@/components/ui/toast';
import { useSession } from '@/hooks/use-session';

/**
 * Drives a Razorpay purchase end-to-end: create order (server) → open Checkout →
 * verify (server, which grants the pass) → refresh entitlements. `pendingSku` lets the
 * UI show a loader on the exact button.
 */
export function useCheckout() {
  const qc = useQueryClient();
  const toast = useToast();
  const { session } = useSession();
  const [pendingSku, setPendingSku] = useState<CheckoutSku | null>(null);

  async function checkout(sku: CheckoutSku) {
    if (pendingSku) return;
    setPendingSku(sku);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.show('Could not load checkout — check your connection and try again');
        return;
      }
      const order = await apiFetch<CreateOrderResponse>('/billing/checkout/order', {
        method: 'POST',
        body: JSON.stringify({ sku }),
      });
      const result = await openCheckout(order, { email: session?.user.email ?? undefined });
      if (!result) return; // user dismissed the modal — no error
      await apiFetch<void>('/billing/checkout/verify', {
        method: 'POST',
        body: JSON.stringify({
          sku,
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
        }),
      });
      await qc.invalidateQueries({ queryKey: qk.entitlements() });
      toast.show('Payment successful — your access is updated');
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Payment failed — try again');
    } finally {
      setPendingSku(null);
    }
  }

  return { checkout, pendingSku };
}
