'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface Subscription {
  status: string
  plan_type: string
  recipe_count: number
  recipe_limit: number
  current_period_end: string | null
  cancel_at: string | null
  referral_code: string
  stripe_customer_id: string | null
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    loadSubscription()

    // Handle redirect from Stripe Checkout
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      toast.success('Subscription activated! Welcome to Premium.')
      // Clear query params
      router.replace('/billing')
    } else if (canceled === 'true') {
      toast.info('Checkout canceled. Your subscription was not changed.')
      router.replace('/billing')
    }
  }, [searchParams])

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading subscription:', error)
        toast.error('Failed to load subscription')
        return
      }

      setSubscription(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    setActionLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast.error(error.message || 'Failed to start checkout')
      setActionLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.error('No active subscription to manage')
      return
    }

    setActionLoading(true)

    try {
      // Create billing portal session
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session')
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Portal error:', error)
      toast.error(error.message || 'Failed to open billing portal')
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscription...</p>
        </div>
      </div>
    )
  }

  const isActive = subscription?.status === 'active'
  const isFree = subscription?.plan_type === 'free' || !isActive

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
          <p className="mt-2 text-gray-600">Manage your Recipe Keeper subscription</p>
        </div>

        {/* Current Plan Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Premium' : 'Free'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan Type:</span>
              <span className="font-semibold text-gray-900">
                {subscription?.plan_type === 'monthly' && 'Monthly ($4.99/mo)'}
                {subscription?.plan_type === 'annual' && 'Annual ($49.99/yr)'}
                {isFree && 'Free (25 recipes)'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Recipes Used:</span>
              <span className="font-semibold text-gray-900">
                {subscription?.recipe_count || 0} / {subscription?.recipe_limit || 25}
              </span>
            </div>

            {subscription?.current_period_end && isActive && (
              <div className="flex justify-between">
                <span className="text-gray-600">Next Billing Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription?.cancel_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cancels On:</span>
                <span className="font-semibold text-red-600">
                  {new Date(subscription.cancel_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription?.referral_code && (
              <div className="flex justify-between">
                <span className="text-gray-600">Your Referral Code:</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {subscription.referral_code}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isFree ? (
          // Show upgrade options for free users
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Monthly</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                $4.99<span className="text-lg text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Unlimited recipes</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Unlimited AI variations</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Share with family</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Priority support</span>
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!)}
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Upgrade to Monthly'}
              </button>
            </div>

            {/* Annual Plan */}
            <div className="bg-white rounded-lg shadow-md p-6 border-4 border-emerald-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                SAVE 17%
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Annual</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                $49.99<span className="text-lg text-gray-600">/year</span>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-4">Only $4.16/month</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">All Monthly features</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-semibold">2 months FREE</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Best value</span>
                </li>
              </ul>
              <button
                onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL!)}
                disabled={actionLoading}
                className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Upgrade to Annual'}
              </button>
            </div>
          </div>
        ) : (
          // Show manage subscription for premium users
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h3>
            <p className="text-gray-600 mb-6">
              Update your payment method, view invoices, or cancel your subscription in the Stripe Customer Portal.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={actionLoading}
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? 'Opening...' : 'Manage Subscription'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
