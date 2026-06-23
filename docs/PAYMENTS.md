# Payments & Plans (Razorpay)

Nenap monetises with three tiers plus short "booster" passes, paid one-time via
**Razorpay** (test mode for now). The entitlements engine is the source of truth;
payments simply grant timed access to it.

## Tiers

| Tier | Recordings | Max clip | Improve again | File uploads | Storage |
|---|---|---|---|---|---|
| **Free** | 1 / day | 5 min | — | — | 100 MB |
| **Pro** | ~10 / day | 30 min | ✓ | ✓ | 2 GB |
| **Enterprise** | unlimited | 60 min | ✓ | ✓ | 20 GB |

Notes, folders, tags, and search are always free and unlimited. Limits live in
[`entitlements.service.ts`](../backend/src/billing/entitlements.service.ts) (`LIMITS`).

## What you can buy (SKUs + pricing)

One place to reprice: [`pricing.ts`](../backend/src/billing/pricing.ts) (amounts in INR paise).

| SKU | Grants | Days | Price |
|---|---|---|---|
| `pro_30d` | Pro | 30 | ₹149 |
| `enterprise_30d` | Enterprise | 30 | ₹399 |
| `booster_1d` / `booster_3d` / `booster_5d` | **Enterprise burst** | 1 / 3 / 5 | ₹29 / ₹69 / ₹99 |

Everything is **one-time** (no auto-renew). Boosters give a short full-Enterprise
burst (exam week, a conference) then revert on their own. Per-day, boosters cost more
than the monthly plans — by design, to nudge subscriptions.

## How it works

Every purchase becomes a **timed pass grant**, so the whole flow reuses the existing
entitlements logic (`tier = max(plan, highest active pass)`).

1. **Order** — `POST /billing/checkout/order { sku }`. Server looks up the amount
   (never trusts the client), creates a Razorpay order, and records a `Payment`
   row (`status: created`). Returns `{ orderId, amount, currency, keyId, label }`.
2. **Checkout** — the client opens Razorpay Checkout ([`razorpay.ts`](../frontend/src/lib/razorpay.ts) +
   [`use-checkout.ts`](../frontend/src/hooks/use-checkout.ts)) with that order.
3. **Verify** — `POST /billing/checkout/verify`. Server checks the
   **HMAC-SHA256 signature** (`order_id|payment_id` keyed by the secret). Only on a
   valid signature does it mark the `Payment` `paid` and grant the pass. **Idempotent**:
   a replayed callback for an already-paid order is a no-op.
4. **Grant** — `grantPass(level, days)` **extends** an active pass of the same level
   (buy Pro twice → 60 days, not two overlapping passes); otherwise creates one.

### Expiry & visibility
- Entitlements report the **effective tier + a single expiry** (the highest active
  pass's `expiresAt`). After it lapses, the user reverts to Free (or a lower active pass).
- `GET /billing/orders` returns purchase history. The **Account page** shows the
  current tier, "active until <date>", and a **Purchases** list; the **Plans page**
  shows the same status banner.

## Data model
- **`Payment`** (`payments` table) — one row per order: `sku`, `level`, `days`,
  `amount`, `status` (`created`/`paid`/`failed`), `razorpayOrderId` (unique),
  `razorpayPaymentId`, `paidAt`. This is the order history.
- **`UserPass`** — the active grant(s); entitlements resolve from these.

## Configuration

`backend/.env` (secret is **server-only**, never exposed):
```
RAZORPAY_KEY_ID="rzp_test_…"
RAZORPAY_KEY_SECRET="…"          # server-only
RAZORPAY_WEBHOOK_SECRET=""       # optional, see below
```
Checkout endpoints return **503** until these are set (env-gated, like the other
integrations). The public key id reaches the client via the order response (so the
frontend needs no Razorpay env var).

## Testing (test mode)
On `/plans`, click a plan/booster → Razorpay modal → test card
`4111 1111 1111 1111`, any future expiry / CVV (or UPI `success@razorpay`). No real
charge. The tier updates immediately and the order appears under Account → Purchases.

## Prod hardening (follow-ups)
- **Webhook** — add a Razorpay webhook (`payment.captured`) + `RAZORPAY_WEBHOOK_SECRET`
  to finalize orders even if the user closes the tab before the verify callback (the
  order would otherwise sit `created`). The verify-on-callback flow covers the happy path.
- Switch to **live keys**; review pricing in `pricing.ts`.
- Consider true recurring **subscriptions** (Razorpay Subscriptions) if monthly
  auto-renew is wanted — current plans are one-time 30-day grants.
