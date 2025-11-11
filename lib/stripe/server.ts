import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

// Price IDs from environment
export const STRIPE_PRICES = {
  MONTHLY: process.env.STRIPE_PRICE_MONTHLY!,
  ANNUAL: process.env.STRIPE_PRICE_ANNUAL!,
  REFERRAL_DISCOUNT: process.env.STRIPE_PRICE_REFERRAL_DISCOUNT!,
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  stripeCustomerId?: string | null
): Promise<string> {
  // If customer already exists, return it
  if (stripeCustomerId) {
    try {
      await stripe.customers.retrieve(stripeCustomerId)
      return stripeCustomerId
    } catch (error) {
      // Customer doesn't exist, create new one
      console.error('Stripe customer not found, creating new:', error)
    }
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      user_id: userId,
    },
  })

  return customer.id
}

/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  referralCode,
  userId,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  referralCode?: string
  userId: string
}): Promise<Stripe.Checkout.Session> {
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
    },
    subscription_data: {
      metadata: {
        user_id: userId,
      },
    },
  }

  // Apply referral discount if provided
  if (referralCode) {
    sessionParams.discounts = [
      {
        coupon: referralCode,
      },
    ]
  }

  const session = await stripe.checkout.sessions.create(sessionParams)
  return session
}

/**
 * Create a billing portal session for subscription management
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

/**
 * Get subscription details from Stripe
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: cancelAtPeriodEnd,
  })

  return subscription
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })

  return subscription
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Map Stripe subscription status to app status
 */
export function mapSubscriptionStatus(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'canceled' | 'past_due' | 'trialing' | 'free' {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'canceled':
    case 'incomplete_expired':
    case 'unpaid':
      return 'canceled'
    case 'past_due':
      return 'past_due'
    case 'trialing':
      return 'trialing'
    default:
      return 'free'
  }
}

/**
 * Determine plan type from price ID
 */
export function getPlanTypeFromPriceId(priceId: string): 'monthly' | 'annual' | 'free' {
  if (priceId === STRIPE_PRICES.MONTHLY) {
    return 'monthly'
  } else if (priceId === STRIPE_PRICES.ANNUAL) {
    return 'annual'
  }
  return 'free'
}
