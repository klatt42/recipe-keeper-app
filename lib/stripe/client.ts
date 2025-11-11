'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null>

/**
 * Get the Stripe.js instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      throw new Error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe()

  if (!stripe) {
    throw new Error('Failed to load Stripe')
  }

  const { error } = await stripe.redirectToCheckout({ sessionId })

  if (error) {
    throw error
  }
}
