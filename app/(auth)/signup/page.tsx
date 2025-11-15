'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string
    cookbookName: string
    role: string
  } | null>(null)
  const [loadingInvitation, setLoadingInvitation] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Load invitation details if token is present
  useEffect(() => {
    const token = searchParams.get('invitation')
    if (token) {
      setInvitationToken(token)
      setLoadingInvitation(true)

      fetch(`/api/invitations/${token}`)
        .then(async (response) => {
          const result = await response.json()
          if (result.success && result.invitation) {
            setInvitationDetails(result.invitation)
            setEmail(result.invitation.email)
          } else {
            setError(result.error || 'Invalid invitation')
          }
        })
        .catch((err) => {
          console.error('Failed to load invitation:', err)
          setError('Failed to load invitation details')
        })
        .finally(() => {
          setLoadingInvitation(false)
        })
    }
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Verify email matches invitation if present
      if (invitationDetails && email !== invitationDetails.email) {
        setError(`This invitation is for ${invitationDetails.email}. Please use that email address.`)
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: promoCode ? { promo_code: promoCode.toUpperCase() } : undefined,
        },
      })

      if (error) throw error

      // If there's an invitation token, accept it after signup
      if (invitationToken && data.user) {
        try {
          const acceptResponse = await fetch('/api/invitations/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitationToken }),
          })

          const acceptResult = await acceptResponse.json()

          if (!acceptResult.success) {
            console.error('Failed to accept invitation:', acceptResult.error)
            // Don't fail signup if invitation acceptance fails
          }
        } catch (inviteError) {
          console.error('Error accepting invitation:', inviteError)
          // Don't fail signup if invitation acceptance fails
        }
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <h2 className="text-2xl font-bold text-green-900">Check your email!</h2>
            <p className="mt-2 text-sm text-green-700">
              We've sent you a confirmation link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-green-600">
              Click the link in the email to complete your registration.
            </p>
            {invitationDetails && (
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  After confirming your email, you'll have access to <strong>{invitationDetails.cookbookName}</strong>!
                </p>
              </div>
            )}
            {promoCode && (
              <div className="mt-4 rounded-md bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  Your promo code <strong className="font-mono">{promoCode.toUpperCase()}</strong> will be applied after you confirm your email.
                </p>
              </div>
            )}
          </div>
          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        {loadingInvitation && (
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />
            <p className="mt-2 text-sm text-blue-700">Loading invitation details...</p>
          </div>
        )}

        {invitationDetails && (
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">You've been invited!</h3>
                <p className="text-sm text-gray-700 mt-1">
                  You're invited to join <strong>{invitationDetails.cookbookName}</strong> as a{' '}
                  <span className="capitalize">{invitationDetails.role}</span>.
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!invitationDetails}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Password (min 6 characters)"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
            <div>
              <label htmlFor="promo-code" className="sr-only">
                Promo Code
              </label>
              <input
                id="promo-code"
                name="promo-code"
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={loading}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm uppercase font-mono disabled:opacity-50"
                placeholder="Promo code (optional)"
              />
              <p className="mt-1 text-xs text-gray-500">Have a promo code? Enter it here.</p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
