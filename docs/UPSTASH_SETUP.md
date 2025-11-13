# Upstash Redis Rate Limiting Setup Guide

**Status**: Infrastructure configured, needs Upstash account and credentials
**Time**: ~15 minutes

---

## Why Upstash Rate Limiting?

Without rate limiting, Recipe Keeper is vulnerable to:

**Cost Explosion**:
- Gemini API: $0.0003/import → 1000 imports/day = $0.30/day = **$9/month per user**
- Claude API: $0.015/variation → 1000 variations/day = $15/day = **$450/month per user**
- With 100 malicious users: **$45,900/month** 💸

**With rate limiting**:
- 5 imports/hour = max $0.036/day = **$1.08/month per user**
- 10 variations/day = max $0.15/day = **$4.50/month per user**
- With 100 users: **$558/month** ✅ (98.8% cost savings!)

**Why Upstash Redis**:
- **Serverless** - Pay per request, no idle costs
- **Fast** - < 1ms latency globally
- **Free tier** - 10,000 requests/day (plenty for beta)
- **Simple API** - REST-based, no connection pooling needed
- **Perfect for Next.js** - Designed for serverless/edge environments

---

## Current Rate Limits

### Recipe Import (Gemini AI)
- **Limit**: 5 imports per hour per user
- **Why**: Each import costs ~$0.0003
- **Protection**: Prevents $216/month cost explosion per user
- **Applied to**: `extractRecipeFromImages()`, `extractRecipeFromPDF()`

### Recipe Variations (Claude AI)
- **Limit**: 10 variations per day per user
- **Why**: Each variation costs ~$0.015
- **Protection**: Prevents $450/month cost explosion per user
- **Applied to**: `generateVariations()`
- **Note**: Also has free tier limit of 5/month for non-premium users

### General API
- **Limit**: 100 requests per minute per user
- **Why**: Prevent DoS attacks and database overload
- **Protection**: General abuse prevention

### Authentication
- **Limit**: 5 attempts per 15 minutes per IP
- **Why**: Prevent brute force password attacks
- **Protection**: Account security

---

## Setup Steps

### 1. Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up (free tier is perfect for start)
3. Verify your email

### 2. Create Redis Database

1. Click **Create Database**
2. Settings:
   - **Name**: `recipe-keeper-ratelimit`
   - **Type**: **Regional** (cheaper than global for beta)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **TLS**: Enabled (recommended)
   - **Eviction**: Enable (automatically remove old rate limit data)
3. Click **Create**

### 3. Get Your Credentials

After database is created:

1. Click on your database
2. Scroll to **REST API** section
3. Copy:
   - **UPSTASH_REDIS_REST_URL** (looks like: `https://your-db.upstash.io`)
   - **UPSTASH_REDIS_REST_TOKEN** (long string starting with `AY...`)

### 4. Add to Environment Variables

**Development** (`.env.local`):
```env
UPSTASH_REDIS_REST_URL=https://your-db-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=AYour_token_here...
```

**Production** (Vercel environment variables):
```bash
vercel env add UPSTASH_REDIS_REST_URL
# Paste your URL
# Select: Production, Preview, Development

vercel env add UPSTASH_REDIS_REST_TOKEN
# Paste your token
# Select: Production, Preview, Development
```

### 5. Test Rate Limiting

**Test Recipe Import**:
```bash
# Start dev server
npm run dev

# Try importing 6 recipes quickly (within 1 hour)
# The 6th import should be blocked with rate limit error
```

Expected error on 6th import:
```
Rate limit exceeded. You can try again in 45 minutes (at 3:30 PM).
```

**Test Variations**:
```bash
# Try generating 11 variations in one day
# The 11th should be blocked
```

**Check Upstash Dashboard**:
1. Go to your database in Upstash console
2. Click **Data Browser**
3. You should see keys like:
   - `ratelimit:recipe-import:{user-id}`
   - `ratelimit:recipe-variation:{user-id}`

---

## What's Already Configured

✅ **Upstash SDK installed** (`@upstash/redis@^1.35.6`, `@upstash/ratelimit@^2.0.7`)

✅ **Rate limit client** (`lib/rate-limit/client.ts`):
  - `recipeImportLimiter` - 5/hour for imports
  - `recipeVariationLimiter` - 10/day for variations
  - `apiLimiter` - 100/min for general API
  - `authLimiter` - 5/15min for auth attempts
  - `verifyRedisConnection()` - Health check

✅ **Rate limit checker** (`lib/rate-limit/check.ts`):
  - `checkRateLimit()` - Check user-based limits
  - `checkRateLimitByIP()` - Check IP-based limits (for auth)
  - `formatRateLimitError()` - User-friendly error messages
  - Sentry integration for monitoring

✅ **Applied to endpoints**:
  - `lib/actions/import-gemini.ts:44` - Recipe import protected
  - `lib/actions/variations.ts:99` - Recipe variations protected

✅ **Graceful degradation**:
  - If Upstash is down, requests are allowed (fail open)
  - Errors logged to Sentry for investigation
  - Users aren't blocked by infrastructure issues

---

## Rate Limit Behavior

### User Experience

**Before limit**:
```
✓ Recipe imported successfully! (4 of 5 imports remaining this hour)
```

**At limit**:
```
✗ Rate limit exceeded. You can try again in 45 minutes (at 3:30 PM).
```

**After reset**:
```
✓ Recipe imported successfully! (4 of 5 imports remaining this hour)
```

### Error Handling

Rate limit errors are:
- ✅ User-friendly (shows time remaining)
- ✅ Non-blocking (doesn't crash the app)
- ✅ Logged to Sentry (for monitoring abuse)
- ✅ Tracked per user ID (authenticated)
- ✅ Tracked per IP (for auth endpoints)

---

## Monitoring & Analytics

### Upstash Dashboard

1. **Data Browser**:
   - View all rate limit keys
   - See current counts
   - Manually reset limits if needed

2. **Metrics**:
   - Total requests/day
   - Command distribution
   - Latency (should be < 10ms)

3. **Logs**:
   - Request logs (last 1000)
   - Error logs
   - Slow queries

### Sentry Integration

Rate limit hits are logged to Sentry as **warnings**:

```
Message: "Rate limit exceeded for recipe-import"
Level: warning
User ID: abc-123
Metadata: {
  limit: 5,
  remaining: 0,
  reset: 1699564800000
}
```

You can create Sentry alerts for:
- More than 10 rate limit hits/hour (possible attack)
- Same user hitting limits repeatedly (adjust limits?)
- Specific endpoints being abused

---

## Adjusting Limits

To change rate limits, edit `lib/rate-limit/client.ts`:

```typescript
// Change from 5/hour to 10/hour
export const recipeImportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // ← Change here
  analytics: true,
  prefix: 'ratelimit:recipe-import',
})
```

**Window types**:
- `slidingWindow(n, '1 h')` - Sliding window (recommended)
- `fixedWindow(n, '1 h')` - Fixed window (simpler, but can be gamed)
- `tokenBucket(n, '1 h', m)` - Token bucket (burst allowed)

**Time units**:
- `'1 s'` - 1 second
- `'1 m'` - 1 minute
- `'1 h'` - 1 hour
- `'1 d'` - 1 day (use '24 h' for better precision)

---

## Premium User Handling

Premium users should have higher limits. Update rate limits based on user tier:

```typescript
// In lib/rate-limit/check.ts

export async function checkRateLimitWithTier(
  baseLimiter: Ratelimit,
  premiumLimiter: Ratelimit,
  action: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if premium
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  const limiter = profile?.is_premium ? premiumLimiter : baseLimiter

  return checkRateLimit(limiter, action)
}
```

**Recommended premium limits**:
- Recipe imports: 50/hour (vs 5/hour free)
- Recipe variations: 100/day (vs 10/day free)
- General API: 500/min (vs 100/min free)

---

## Cost Estimates

### Free Tier (Perfect for Beta):
- 10,000 requests/day
- 256 MB storage
- Regional database
- **Cost**: $0/month

**Your usage** (at 100 users, beta):
- ~500 imports/day (5/user/week)
- ~200 variations/day (2/user/week)
- ~1,000 general API checks/day
- **Total**: ~1,700 requests/day ✅ Well within free tier!

### Pay-As-You-Go (When Needed):
- $0.2 per 100,000 requests
- At 1,000 users:
  - ~5,000 imports/day
  - ~2,000 variations/day
  - ~10,000 API checks/day
  - **Total**: ~17,000 requests/day = ~510K/month
  - **Cost**: $1.02/month ✅ Extremely cheap!

### At Scale (10,000 users):
- ~170,000 requests/day = ~5.1M/month
- **Cost**: $10.20/month ✅ Still very cheap!

---

## Troubleshooting

### Rate limits not working

1. **Check credentials**:
   ```bash
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   ```

2. **Test connection**:
   Create `app/api/test-redis/route.ts`:
   ```typescript
   import { verifyRedisConnection } from '@/lib/rate-limit/client'
   import { NextResponse } from 'next/server'

   export async function GET() {
     const result = await verifyRedisConnection()
     return NextResponse.json(result)
   }
   ```
   Visit: `http://localhost:3004/api/test-redis`

3. **Check Upstash dashboard**:
   - Database status should be "Active"
   - Check metrics for recent requests
   - Look for error logs

### Users getting false rate limit errors

1. **Check time zones**: Rate limits use UTC
2. **Clear Redis keys** (in Upstash Data Browser):
   - Find the user's rate limit key
   - Delete it to reset
3. **Adjust limits** if too restrictive

### High latency

1. **Use regional database** (not global) for better speed
2. **Check Upstash status**: status.upstash.com
3. **Consider upgrading** to global database if users are worldwide

---

## Security Best Practices

### DO:
- ✅ Use different limits for different tiers (free vs premium)
- ✅ Log rate limit hits to Sentry
- ✅ Show users remaining quota
- ✅ Reset limits on tier upgrades
- ✅ Use IP-based limits for auth endpoints

### DON'T:
- ❌ Make limits too strict (frustrates users)
- ❌ Make limits too loose (costs explode)
- ❌ Hardcode limits (use environment variables for flexibility)
- ❌ Ignore rate limit patterns (monitor for abuse)
- ❌ Block all requests if Redis is down (fail open, not closed)

---

## Advanced: Custom Rate Limits

### Per-Recipe Limit (Prevent Spam)

```typescript
// Limit 3 variations per recipe per day
export async function checkPerRecipeLimit(recipeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '24 h'),
    analytics: true,
    prefix: 'ratelimit:per-recipe',
  })

  return await limiter.limit(`${user.id}:${recipeId}`)
}
```

### Burst Allowance

```typescript
// Allow burst of 10 imports, then 5/hour sustained
export const recipeImportBurstLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(5, '1 h', 10), // 5/hour, 10 burst
  analytics: true,
  prefix: 'ratelimit:recipe-import-burst',
})
```

---

## Next Steps

1. **Sign up for Upstash** (5 min) ✓
2. **Create Redis database** (2 min) ✓
3. **Get credentials** (1 min) ✓
4. **Add to .env.local** (1 min) ✓
5. **Test rate limiting** (5 min)
6. **Monitor in Upstash dashboard** (ongoing)
7. **Set up Sentry alerts** for rate limit abuse (15 min)

---

## Resources

- [Upstash Documentation](https://docs.upstash.com/)
- [Rate Limiting Guide](https://upstash.com/docs/redis/features/ratelimiting)
- [Pricing Calculator](https://upstash.com/pricing)
- [Status Page](https://status.upstash.com/)

---

**Status**: Ready for setup! Just needs Upstash account and credentials.
**Priority**: CRITICAL - Required before production launch (prevents cost explosion)
**Estimated setup time**: 15 minutes
**Estimated cost**: $0/month (free tier sufficient for beta)

---

## Cost Savings Summary

**Without Rate Limiting** (worst case with 100 malicious users):
- Recipe imports: $9/month × 100 = **$900/month**
- Recipe variations: $450/month × 100 = **$45,000/month**
- **Total**: **$45,900/month** 💸

**With Rate Limiting**:
- Recipe imports: $1.08/month × 100 = **$108/month**
- Recipe variations: $4.50/month × 100 = **$450/month**
- Upstash cost: **$0/month** (free tier)
- **Total**: **$558/month** ✅

**Savings**: **$45,342/month (98.8%)**
**ROI**: Infinite (free tier covers beta launch)

**This is why rate limiting is non-negotiable for production!** 🛡️
