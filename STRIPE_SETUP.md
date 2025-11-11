# Stripe Setup Guide for Recipe Keeper

## Step 1: Create Products in Stripe Dashboard

Go to your Stripe Dashboard: https://dashboard.stripe.com/acct_1RQCPxKPbMFl0oo4/products

### Product 1: Recipe Keeper Premium (Monthly)

1. Click **"+ Add product"**
2. Fill in:
   - **Name:** Recipe Keeper Premium
   - **Description:** Unlimited recipes, unlimited AI variations, unlimited cookbooks, share with family
   - **Pricing model:** Standard pricing
   - **Price:** $4.99
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **"Save product"**
4. **Copy the Price ID** (starts with `price_xxx`) and paste it in `.env.local` as `STRIPE_PRICE_MONTHLY`

### Product 2: Recipe Keeper Premium (Annual)

1. Go back to Products and click **"+ Add product"**
2. Fill in:
   - **Name:** Recipe Keeper Premium (Annual)
   - **Description:** Same as monthly, but save 17% with annual billing
   - **Pricing model:** Standard pricing
   - **Price:** $49.99
   - **Billing period:** Yearly
   - **Currency:** USD
3. Click **"Save product"**
4. **Copy the Price ID** and paste it in `.env.local` as `STRIPE_PRICE_ANNUAL`

### Product 3: Referral Discount (First Month 50% Off)

**Option A: Create as a Coupon (Recommended)**
1. Go to https://dashboard.stripe.com/coupons
2. Click **"Create coupon"**
3. Fill in:
   - **Name:** New User Referral Discount
   - **Coupon ID:** `REFERRAL50` (or auto-generate)
   - **Type:** Percentage
   - **Discount:** 50%
   - **Duration:** Once (applies to first payment only)
4. Click **"Create coupon"**
5. **Copy the Coupon ID** and paste it in `.env.local` as `STRIPE_PRICE_REFERRAL_DISCOUNT`

**Option B: Create as a Separate Price**
1. Click **"+ Add product"**
2. Fill in:
   - **Name:** Recipe Keeper Premium (First Month - Referral)
   - **Description:** 50% off first month for referred users
   - **Pricing model:** Standard pricing
   - **Price:** $2.49
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **"Save product"**
4. **Copy the Price ID** and paste it in `.env.local` as `STRIPE_PRICE_REFERRAL_DISCOUNT`

## Step 2: Set Up Webhooks

Webhooks allow Stripe to notify your app about subscription events (payment succeeded, subscription cancelled, etc.)

### Local Development (for testing)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to http://localhost:3004/api/webhooks/stripe`
3. Copy the webhook signing secret (starts with `whsec_`) to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Production (when deploying)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter your production URL: `https://app.myfamilyrecipekeeper.com/api/webhooks/stripe`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Click **"Add endpoint"**
6. **Copy the Signing secret** and update `.env.local` with `STRIPE_WEBHOOK_SECRET`

## Step 3: Update Your .env.local

After creating products and webhooks, your `.env.local` should look like this:

```env
# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
# Product Price IDs
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ANNUAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_REFERRAL_DISCOUNT=REFERRAL50  # or price_xxxxxxxxxxxxx if using Option B
# Expose price IDs to client for billing page
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=price_xxxxxxxxxxxxx
```

## Step 4: Test Your Integration

Once the integration is built, you can test with Stripe test mode:

1. Use test card: `4242 4242 4242 4242`
2. Use any future expiry date (e.g., 12/34)
3. Use any 3-digit CVC
4. Use any ZIP code

## Customer Portal

Enable Stripe Customer Portal so users can manage their subscriptions:

1. Go to https://dashboard.stripe.com/settings/billing/portal
2. Click **"Activate Customer Portal"**
3. Configure what customers can do:
   - ✅ Cancel subscriptions
   - ✅ Update payment methods
   - ✅ View invoices
4. Click **"Save changes"**

## Next Steps

After completing this setup:
1. The integration code will be created
2. Subscription data will be synced to Supabase
3. Users can upgrade/downgrade through the app
4. Referral codes will be generated automatically
