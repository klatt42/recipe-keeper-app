import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

/**
 * Upstash Redis client for rate limiting
 * Uses serverless-friendly connection pooling
 */

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('UPSTASH_REDIS credentials not set. Rate limiting will not work in production.')
}

// Create Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

/**
 * Rate limiter for AI recipe imports
 * Limit: 5 imports per hour per user
 *
 * Why: Gemini API costs ~$0.0003 per import. Without limits:
 * - Malicious user could import 1000 recipes/hour = $0.30/hour
 * - Over a day: $7.20
 * - Over a month: $216
 *
 * With 5/hour limit: $0.0015/hour max = $0.036/day = $1.08/month per user
 */
export const recipeImportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'ratelimit:recipe-import',
})

/**
 * Rate limiter for AI recipe variations
 * Limit: 10 variations per day per user
 *
 * Why: Claude API costs ~$0.015 per variation. Without limits:
 * - Malicious user could generate 1000 variations/day = $15/day
 * - Over a month: $450
 *
 * With 10/day limit: $0.15/day max = $4.50/month per user
 */
export const recipeVariationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '24 h'),
  analytics: true,
  prefix: 'ratelimit:recipe-variation',
})

/**
 * Rate limiter for general API requests
 * Limit: 100 requests per minute per user
 *
 * Why: Prevent abuse and DoS attacks
 */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
})

/**
 * Rate limiter for authentication attempts
 * Limit: 5 attempts per 15 minutes per IP
 *
 * Why: Prevent brute force attacks
 */
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
})

/**
 * Check if Redis connection is working
 */
export async function verifyRedisConnection() {
  try {
    await redis.ping()
    return { connected: true, error: null }
  } catch (error: any) {
    return { connected: false, error: error.message }
  }
}
