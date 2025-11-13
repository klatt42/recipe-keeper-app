# Upstash Redis Rate Limiting Setup

This guide explains how to set up Upstash Redis for rate limiting API requests in Recipe Keeper.

## Why Upstash Redis?

Upstash provides:
- **Serverless Redis** - No infrastructure to manage
- **Global Edge Network** - Low latency worldwide
- **Generous Free Tier** - 10,000 requests/day for free
- **REST API** - Works seamlessly with serverless functions
- **Built-in Analytics** - Monitor rate limit hits and usage patterns
- **No credit card required** - for the free tier

## Why Rate Limiting?

Rate limiting protects your app from:
- **API Abuse** - Prevents malicious users from spamming AI endpoints
- **Cost Control** - Limits expensive AI operations (Gemini, Claude API)
- **Fair Usage** - Ensures all users get equitable access
- **DDoS Protection** - Blocks automated attacks

## Setup Steps

### 1. Create an Upstash Account

1. Go to [https://console.upstash.com/](https://console.upstash.com/)
2. Sign up for a free account (GitHub, Google, or email)
3. Verify your email address

### 2. Create a Redis Database

1. Click **"Create Database"**
2. Choose a name (e.g., "recipe-keeper-ratelimit")
3. Select a region (choose closest to your deployment):
   - **Vercel/Netlify**: Choose the same region as your deployment
   - **Development**: Choose closest to you
4. Choose **Free** tier (10,000 commands/day)
5. Click **"Create"**

### 3. Get Your Connection Details

1. Go to your database dashboard
2. Scroll to **"REST API"** section
3. Copy the following:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 4. Add Environment Variables

Add to your `.env.local` file:

```bash
# Upstash Redis Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
```

**Important**: For production (Netlify, Vercel), add these as environment variables in your deployment platform's settings.

## Rate Limit Configuration

Recipe Keeper implements four types of rate limiters:

### 1. Recipe Import Rate Limiter

**Purpose**: Prevent abuse of AI-powered recipe OCR (Gemini API)

**Limit**: 10 imports per hour per user

**Cost Protection**: Each import costs ~$0.0003, so this limits costs to $0.003/hour per user

**Code**: `lib/ratelimit.ts`
```typescript
export const recipeImportLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:recipe-import',
})
```

**Used In**: `lib/actions/import-gemini.ts`

### 2. Recipe Variation Rate Limiter

**Purpose**: Prevent abuse of AI recipe variations (Claude API)

**Limit**: 10 variations per day per user

**Cost Protection**: Each variation costs ~$0.01, so this limits costs to $0.10/day per user

**Code**: `lib/ratelimit.ts`
```typescript
export const recipeVariationLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '24 h'),
  analytics: true,
  prefix: 'ratelimit:recipe-variation',
})
```

**Used In**: `lib/actions/variations.ts`

### 3. General API Rate Limiter

**Purpose**: Protect against general API abuse

**Limit**: 100 requests per minute per user

**Protection**: Prevents automated scraping and DDoS

**Code**: `lib/ratelimit.ts`
```typescript
export const apiLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
})
```

**Usage**: Can be applied to any API endpoint that needs protection

### 4. Cookbook Invitation Rate Limiter

**Purpose**: Prevent spam invitations

**Limit**: 10 invitations per hour per user

**Protection**: Prevents abuse of invitation system

**Code**: `lib/ratelimit.ts`
```typescript
export const invitationLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:invitation',
})
```

**Used In**: `lib/actions/recipe-books.ts`

## How It Works

### Sliding Window Algorithm

Upstash uses a **sliding window** algorithm for rate limiting:

- More accurate than fixed windows
- Prevents burst traffic at window boundaries
- Smoothly distributes allowed requests over time

**Example**: 10 requests per hour
```
Time:     0min   30min   60min   90min   120min
Requests: 5      5       ✅      5       ✅
          └──────┘       │       └──────┘
          Window 1       │       Window 2
                         └─ This request counts against Window 1
```

### Graceful Degradation

The rate limiting system gracefully degrades if Upstash is not configured:

```typescript
export const isRateLimitEnabled = () => {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

// If not configured, limiters are null
export const recipeImportLimit = redis
  ? new Ratelimit({ ... })
  : null
```

**Result**: Your app works perfectly in development without rate limiting, but gains protection in production.

### Error Handling

If Upstash fails (network error, downtime), requests are **allowed** to prevent blocking users:

```typescript
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
  action: string
) {
  if (!limiter || !isRateLimitEnabled()) {
    console.warn(`⚠️  Rate limiting is not configured. ${action} proceeding without limits.`)
    return { success: true }
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    // ... handle rate limit
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // On error, allow the request but log to Sentry
    return { success: true }
  }
}
```

## Usage in Your Code

### Basic Usage

```typescript
import { recipeImportLimit, checkRateLimit } from '@/lib/ratelimit'

export async function importRecipe(userId: string) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(
    recipeImportLimit,
    userId,
    'recipe import'
  )

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: rateLimitResult.error
    }
  }

  // Proceed with import...
}
```

### User-Friendly Error Messages

The rate limiter provides friendly error messages:

```typescript
{
  success: false,
  error: "Rate limit exceeded for recipe import. You can try again in 45 minutes.",
  limit: 10,
  remaining: 0,
  reset: 1234567890
}
```

### Getting Remaining Quota

```typescript
const { success, limit, remaining, reset } = await checkRateLimit(
  recipeImportLimit,
  userId,
  'recipe import'
)

if (success) {
  console.log(`You have ${remaining}/${limit} imports remaining`)
  console.log(`Resets at: ${new Date(reset)}`)
}
```

## Monitoring & Analytics

### Upstash Console

View rate limit analytics at: [https://console.upstash.com/](https://console.upstash.com/)

You can see:
- **Total Requests** - How many rate limit checks per day
- **Hit Rate** - Percentage of requests that hit the limit
- **Active Keys** - Number of unique users being rate limited
- **Commands** - Detailed Redis command logs

### Custom Analytics

Enable analytics in your limiters:

```typescript
export const recipeImportLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true, // ✅ Enables built-in analytics
  prefix: 'ratelimit:recipe-import',
})
```

## Cost & Limits

### Free Tier
- **10,000 commands/day**
- **256 MB storage**
- **Global replication**
- **TLS encryption**
- **REST API access**
- No credit card required

### Estimating Usage

Each rate limit check uses **1 command**.

**Example Calculation**:
- 100 active users/day
- Each user makes 5 recipe imports = 500 checks
- Each user makes 2 variations = 200 checks
- Total: **700 commands/day**

**Result**: Well within the 10,000 free tier limit!

### Paid Plans

If you exceed the free tier:
- **Pay as you go**: $0.20 per 100,000 commands
- **Pro**: $10/month for 1M commands + 1GB storage

For most Recipe Keeper instances, the **free tier is sufficient**.

## Best Practices

### 1. Use Specific Prefixes

Each limiter should have a unique prefix:

```typescript
prefix: 'ratelimit:recipe-import'  // ✅ Specific
prefix: 'ratelimit'                 // ❌ Too generic
```

### 2. Choose Appropriate Windows

```typescript
// High-cost operations (AI) → Hourly or daily
Ratelimit.slidingWindow(10, '1 h')   // Recipe imports
Ratelimit.slidingWindow(10, '24 h')  // Recipe variations

// Low-cost operations → Per minute
Ratelimit.slidingWindow(100, '1 m')  // General API
```

### 3. Rate Limit by User ID

```typescript
// ✅ Rate limit by user ID (fair per-user limits)
await limiter.limit(userId)

// ❌ Don't rate limit by IP (shared IPs cause issues)
await limiter.limit(ipAddress)
```

### 4. Provide Helpful Error Messages

```typescript
if (!rateLimitResult.success) {
  const resetDate = new Date(rateLimitResult.reset!)
  const minutesUntilReset = Math.ceil(
    (resetDate.getTime() - Date.now()) / 60000
  )

  return {
    error: `Rate limit exceeded. Try again in ${minutesUntilReset} minutes.`
  }
}
```

### 5. Test in Development

Add temporary logging to verify rate limiting:

```typescript
const result = await checkRateLimit(recipeImportLimit, userId, 'recipe import')
console.log('Rate limit result:', result)
```

## Troubleshooting

### Rate Limiting Not Working

1. **Check Environment Variables**:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. **Check Logs**: Look for warnings like:
   ```
   ⚠️  Rate limiting is not configured. recipe import proceeding without limits.
   ```

3. **Verify Database**: Make sure your Upstash database is active in the console

### Users Getting Rate Limited Too Quickly

1. **Check the window**: Maybe `'1 h'` is too strict, try `'24 h'`
2. **Increase the limit**: Change from `10` to `20` requests
3. **Check for duplicate calls**: Make sure you're not calling the API multiple times

### Connection Errors

If you see errors like "Failed to connect to Upstash":

1. **Check your URL**: Make sure it starts with `https://`
2. **Check your token**: Copy it again from Upstash console
3. **Check network**: Upstash needs outbound HTTPS access
4. **Check region**: Use a database in the same region as your deployment

## Testing Rate Limits

### Manual Testing

1. Set a low limit for testing:
   ```typescript
   limiter: Ratelimit.slidingWindow(3, '1 m')  // Only 3 requests per minute
   ```

2. Make multiple requests quickly
3. Verify you get rate limit errors after the 3rd request
4. Wait 1 minute and verify it resets

### Automated Testing

```typescript
import { recipeImportLimit, checkRateLimit } from '@/lib/ratelimit'

async function testRateLimit() {
  const userId = 'test-user-123'

  // Make 11 requests (limit is 10)
  for (let i = 0; i < 11; i++) {
    const result = await checkRateLimit(recipeImportLimit, userId, 'test')
    console.log(`Request ${i + 1}:`, result.success ? '✅' : '❌')
  }
}
```

## Security Considerations

### 1. Don't Expose Redis Credentials

```bash
# ✅ Keep in .env.local (not committed)
UPSTASH_REDIS_REST_TOKEN=secret

# ❌ Don't hardcode in code
const redis = new Redis({ token: 'AYOEasdf...' })
```

### 2. Rate Limit by User ID

```typescript
// ✅ User-specific limits (fair and secure)
await limiter.limit(user.id)

// ❌ Global limits (one user can block everyone)
await limiter.limit('global')
```

### 3. Different Limits for Different Operations

```typescript
// ✅ Higher cost = stricter limits
recipeImportLimit: 10/hour    // AI operation, expensive
apiLimit: 100/minute          // Regular API, cheap
```

## Extending Rate Limiting

### Adding a New Rate Limiter

1. **Create the limiter** in `lib/ratelimit.ts`:
   ```typescript
   export const myNewLimit = redis
     ? new Ratelimit({
         redis,
         limiter: Ratelimit.slidingWindow(20, '1 h'),
         analytics: true,
         prefix: 'ratelimit:my-feature',
       })
     : null
   ```

2. **Use it in your server action**:
   ```typescript
   import { myNewLimit, checkRateLimit } from '@/lib/ratelimit'

   export async function myAction(userId: string) {
     const result = await checkRateLimit(myNewLimit, userId, 'my feature')
     if (!result.success) {
       return { error: result.error }
     }
     // ... proceed
   }
   ```

### Custom Rate Limit Strategies

Upstash supports multiple strategies:

```typescript
// Sliding window (recommended)
Ratelimit.slidingWindow(10, '1 h')

// Fixed window
Ratelimit.fixedWindow(10, '1 h')

// Token bucket (burst allowed)
Ratelimit.tokenBucket(10, '1 h', 5)
```

## Support

- [Upstash Documentation](https://docs.upstash.com/)
- [Upstash Discord](https://upstash.com/discord)
- [Rate Limiting Guide](https://upstash.com/docs/redis/features/ratelimiting)
- [@upstash/ratelimit on GitHub](https://github.com/upstash/ratelimit)

## Summary

Upstash Redis rate limiting provides:
- ✅ **Cost control** for expensive AI operations
- ✅ **Abuse prevention** for public APIs
- ✅ **Fair usage** for all users
- ✅ **Graceful degradation** when not configured
- ✅ **Generous free tier** (10,000 requests/day)
- ✅ **Easy setup** (5 minutes)

Your Recipe Keeper app is now protected from abuse and excessive costs!
