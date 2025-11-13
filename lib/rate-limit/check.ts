'use server'

import { createClient } from '@/lib/supabase/server'
import { captureMessage } from '@/lib/utils/error-handler'
import type { Ratelimit } from '@upstash/ratelimit'

/**
 * Check rate limit for a user action
 *
 * @param limiter - The rate limiter to use
 * @param action - Action name for error messages
 * @returns Result with success status and remaining quota
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  action: string
): Promise<{
  success: boolean
  limit?: number
  remaining?: number
  reset?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check rate limit
    const { success, limit, remaining, reset } = await limiter.limit(user.id)

    if (!success) {
      // Log rate limit hit to Sentry for monitoring
      captureMessage(
        `Rate limit exceeded for ${action}`,
        'warning',
        {
          userId: user.id,
          action,
          metadata: { limit, remaining, reset }
        }
      )

      const resetDate = new Date(reset)
      const waitMinutes = Math.ceil((reset - Date.now()) / 60000)

      return {
        success: false,
        limit,
        remaining,
        reset,
        error: `Rate limit exceeded. You can try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''} (at ${resetDate.toLocaleTimeString()}).`
      }
    }

    return {
      success: true,
      limit,
      remaining,
      reset
    }
  } catch (error: any) {
    console.error('Rate limit check error:', error)

    // If rate limiting fails, allow the request (fail open)
    // but log to Sentry for investigation
    captureMessage(
      `Rate limit check failed for ${action}: ${error.message}`,
      'error',
      {
        action,
        metadata: { error: error.message }
      }
    )

    // Return success to not block users if rate limiting is down
    return { success: true }
  }
}

/**
 * Check rate limit by IP address (for non-authenticated actions like login)
 */
export async function checkRateLimitByIP(
  limiter: Ratelimit,
  action: string,
  ipAddress: string
): Promise<{
  success: boolean
  limit?: number
  remaining?: number
  reset?: number
  error?: string
}> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(ipAddress)

    if (!success) {
      captureMessage(
        `IP rate limit exceeded for ${action}`,
        'warning',
        {
          action,
          metadata: { ipAddress, limit, remaining, reset }
        }
      )

      const resetDate = new Date(reset)
      const waitMinutes = Math.ceil((reset - Date.now()) / 60000)

      return {
        success: false,
        limit,
        remaining,
        reset,
        error: `Too many attempts. Please try again in ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`
      }
    }

    return {
      success: true,
      limit,
      remaining,
      reset
    }
  } catch (error: any) {
    console.error('IP rate limit check error:', error)

    captureMessage(
      `IP rate limit check failed for ${action}: ${error.message}`,
      'error',
      {
        action,
        metadata: { ipAddress, error: error.message }
      }
    )

    return { success: true }
  }
}

/**
 * Format rate limit error message for display
 */
export function formatRateLimitError(result: {
  limit?: number
  remaining?: number
  reset?: number
  error?: string
}): string {
  if (result.error) {
    return result.error
  }

  if (result.remaining !== undefined && result.limit !== undefined) {
    return `${result.remaining} of ${result.limit} requests remaining`
  }

  return 'Rate limit information unavailable'
}
