# Stripe Integration - Implementation Guide

## Current Status: ✅ Setup Complete, Ready to Build

You've completed the setup phase:
- ✅ Stripe API keys added to `.env.local`
- ✅ Stripe npm packages installed (`stripe`, `@stripe/stripe-js`)
- ✅ Products created in Stripe dashboard
- ✅ Price IDs configured
- ✅ Referral coupon created (`REFERRAL50`)
- ✅ Supabase migration created

## Step 1: Run the Supabase Migration

The database schema has been created in `supabase/migrations/20241110_add_subscriptions.sql`.

**To apply it:**

```bash
cd ~/projects/recipe-keeper-app
~/.local/bin/supabase db push
```

This will create:
- `subscriptions` table with user subscription data
- Automatic subscription creation on signup
- Recipe count tracking and limits
- Referral code system
- Helper functions for subscription management

---

## Step 2: Build the Stripe Integration (Remaining Work)

I recommend building this in phases:

### Phase 1: Basic Checkout (Essential for MVP)
**Files to create:**
1. `app/api/checkout/route.ts` - Create Stripe Checkout session
2. `app/api/webhooks/stripe/route.ts` - Handle Stripe webhook events
3. `app/billing/page.tsx` - Subscription management page
4. `lib/stripe/server.ts` - Server-side Stripe utilities
5. `lib/stripe/client.ts` - Client-side Stripe utilities

### Phase 2: Advanced Features (Post-MVP)
- Referral system UI
- Usage analytics dashboard
- Proration handling for plan switches
- Failed payment retry logic
- Customer portal integration

---

## Recommended: Let Claude Build It

Given the complexity (5+ files, API routes, webhooks, error handling), I recommend using Claude to build the integration. The full implementation requires:

- **Checkout flow**: User clicks "Upgrade" → Stripe Checkout → Success redirect
- **Webhook handling**: Stripe events → Update Supabase → Sync subscription status
- **Usage enforcement**: Check recipe limits before allowing recipe creation
- **Referral tracking**: Generate codes, apply discounts, credit referrers
- **Error handling**: Failed payments, expired cards, webhook retries

---

## Quick Start Option: Build Yourself

If you prefer to build it yourself, here's the architecture:

### File Structure:
```
app/
├── api/
│   ├── checkout/
│   │   └── route.ts          # POST /api/checkout
│   └── webhooks/
│       └── stripe/
│           └── route.ts       # POST /api/webhooks/stripe
├── billing/
│   └── page.tsx               # /billing - manage subscription
lib/
├── stripe/
│   ├── server.ts              # Server-side Stripe client
│   └── client.ts              # Client-side utilities
└── supabase/
    └── queries.ts             # Subscription queries
```

### Key Implementation Points:

**1. Checkout API (`/api/checkout`)**
```typescript
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { priceId, referralCode } = await request.json()
  const supabase = createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  // Create Stripe Checkout session
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const session = await stripe.checkout.sessions.create({
    customer: subscription.stripe_customer_id,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    discounts: referralCode ? [{ coupon: referralCode }] : [],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
  })

  return Response.json({ url: session.url })
}
```

**2. Webhook Handler (`/api/webhooks/stripe`)**
```typescript
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const sig = request.headers.get('stripe-signature')!
  const body = await request.text()

  const event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful subscription creation
      break
    case 'customer.subscription.updated':
      // Handle subscription changes
      break
    case 'customer.subscription.deleted':
      // Handle cancellations
      break
  }

  return Response.json({ received: true })
}
```

**3. Billing Page (`/billing`)**
```typescript
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

export default function BillingPage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async (priceId: string) => {
    setLoading(true)

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    })

    const { url } = await response.json()
    window.location.href = url
  }

  return (
    <div>
      <h1>Manage Subscription</h1>
      <button onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!)}>
        Upgrade to Monthly - $4.99/month
      </button>
      <button onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL!)}>
        Upgrade to Annual - $49.99/year
      </button>
    </div>
  )
}
```

---

## Step 3: Set Up Webhooks

Once the webhook handler is deployed:

### Local Testing:
```bash
stripe listen --forward-to http://localhost:3004/api/webhooks/stripe
# Copy the webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET
```

### Production:
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://app.myfamilyrecipekeeper.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
4. Copy signing secret to production `.env.local`

---

## Step 4: Test the Integration

### Test Cards:
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

### Test Flow:
1. Sign up for free account
2. Navigate to `/billing`
3. Click "Upgrade to Premium"
4. Complete Stripe Checkout with test card
5. Verify subscription status updates in Supabase
6. Try creating more than 25 recipes (should work now)

---

## Next Steps

**Option A:** Have Claude build the integration (recommended)
- Provides complete, tested implementation
- Handles edge cases and error states
- Includes proper TypeScript types
- Production-ready code

**Option B:** Build it yourself using this guide
- Great learning experience
- Full control over implementation
- Can customize to your needs

Would you like me to build the complete integration files for you?
