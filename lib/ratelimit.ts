import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if rate limiting is enabled
export const isRateLimitEnabled = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// Initialize Redis client (only if configured)
const redis = isRateLimitEnabled()
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

/**
 * Rate limiter for recipe imports (AI-powered OCR)
 * Limit: 10 imports per hour per user
 * Cost: ~$0.0003 per import, so 10 imports = $0.003/hour
 */
export const recipeImportLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:recipe-import',
    })
  : null

/**
 * Rate limiter for AI recipe variations
 * Limit: 10 variations per day per user (free tier already has 5/month)
 * Cost: ~$0.01 per variation set, so 10 = $0.10/day
 */
export const recipeVariationLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '24 h'),
      analytics: true,
      prefix: 'ratelimit:recipe-variation',
    })
  : null

/**
 * Rate limiter for general API requests
 * Limit: 100 requests per minute per user
 * Protects against abuse
 */
export const apiLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: 'ratelimit:api',
    })
  : null

/**
 * Rate limiter for cookbook invitations
 * Limit: 10 invitations per hour per user
 * Prevents spam
 */
export const invitationLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:invitation',
    })
  : null

/**
 * Helper to check rate limit and return user-friendly error
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  action: string
): Promise<{ success: boolean; error?: string; limit?: number; remaining?: number; reset?: number }> {
  // If rate limiting is not configured, allow all requests
  if (!limiter || !isRateLimitEnabled()) {
    console.warn(`⚠️  Rate limiting is not configured. ${action} proceeding without limits.`)
    return { success: true }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)

    if (!success) {
      const resetDate = new Date(reset)
      const minutesUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 60000)

      return {
        success: false,
        error: `Rate limit exceeded for ${action}. You can try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`,
        limit,
        remaining: 0,
        reset,
      }
    }

    return { success: true, limit, remaining, reset }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // On error, allow the request but log to Sentry
    return { success: true }
  }
}
