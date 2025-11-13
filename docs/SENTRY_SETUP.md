# Sentry Error Monitoring Setup Guide

**Status**: Infrastructure configured, needs Sentry account setup
**Time**: ~30 minutes

---

## Why Sentry?

Sentry provides:
- **Real-time error tracking** - Know when something breaks before users complain
- **Stack traces** - See exactly where errors occur with source maps
- **User context** - Know which users are affected
- **Performance monitoring** - Track slow API calls and database queries
- **Release tracking** - Associate errors with specific deployments

**Cost**: Free tier includes 5,000 errors/month (enough for beta launch)

---

## Setup Steps

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up (free tier is fine for start)
3. Create a new project:
   - Platform: **Next.js**
   - Name: **Recipe Keeper**
   - Alert frequency: **On every new issue**

### 2. Get Your DSN

After creating the project:
1. Go to **Settings** → **Projects** → **Recipe Keeper** → **Client Keys (DSN)**
2. Copy the **DSN** (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### 3. Configure Environment Variables

Add to `.env.local`:

```env
# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_DSN_HERE@o123456.ingest.sentry.io/789012
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=recipe-keeper
```

For **production** (Vercel environment variables):
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=recipe-keeper
SENTRY_AUTH_TOKEN=your-auth-token  # See step 4
```

### 4. Create Auth Token (For Source Maps)

Source maps let you see readable stack traces instead of minified code.

1. Go to **Settings** → **Account** → **API** → **Auth Tokens**
2. Click **Create New Token**
3. Name: `Recipe Keeper Vercel Deployment`
4. Scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
5. Copy the token and add to Vercel:
   ```bash
   vercel env add SENTRY_AUTH_TOKEN
   # Paste your token when prompted
   # Select: Production, Preview, Development
   ```

### 5. Configure Sentry Dashboard

**Alerts**:
1. Go to **Alerts** → **Create Alert**
2. Template: **Issues**
3. Conditions: "When an event is first seen"
4. Actions: Send notification to email and Slack (if you have one)

**Notifications**:
1. Go to **Settings** → **Notifications**
2. Enable:
   - New issues
   - Regressions (errors that came back after being resolved)
   - Workflow (when issues are assigned, resolved, etc.)

**Integrations** (Optional):
- **Slack**: Get errors posted to a #alerts channel
- **GitHub**: Link errors to commits and releases
- **Vercel**: Automatic release tracking

### 6. Test Error Tracking

**Development test**:
```bash
# Start dev server
npm run dev

# In browser console:
throw new Error("Test Sentry integration")
```

Check Sentry dashboard - you should see the error appear within seconds.

**Server action test**:

Create a test file `app/api/test-sentry/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    throw new Error('Test server error for Sentry')
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: 'Error captured' }, { status: 500 })
  }
}
```

Visit: `http://localhost:3004/api/test-sentry`

Check Sentry dashboard for the error.

### 7. Verify Configuration

**Check that Sentry is working**:
1. Trigger an error (import a recipe with invalid image, etc.)
2. Go to Sentry dashboard → **Issues**
3. You should see the error with:
   - Full stack trace
   - User ID (if logged in)
   - Browser info
   - Breadcrumbs (what user did before error)

---

## What's Already Configured

✅ **Sentry SDK installed** (`@sentry/nextjs`)
✅ **Config files created**:
  - `sentry.client.config.ts` - Browser error tracking
  - `sentry.server.config.ts` - Server error tracking
  - `sentry.edge.config.ts` - Edge runtime errors
  - `instrumentation.ts` - Auto-initialization

✅ **Next.config.ts** - Webpack plugin for source maps

✅ **Error handler utility** (`lib/utils/error-handler.ts`):
  - `captureError()` - Capture errors with context
  - `captureMessage()` - Log messages to Sentry
  - `startTransaction()` - Performance monitoring

✅ **Error Boundary component** (`components/error-boundary.tsx`):
  - Catches React errors
  - Shows user-friendly fallback
  - Reports to Sentry automatically

✅ **Server actions enhanced**:
  - `lib/actions/import-gemini.ts` - Uses captureError()
  - Other actions can follow same pattern

---

## Usage Examples

### In Server Actions

```typescript
'use server'

import { captureError } from '@/lib/utils/error-handler'

export async function myAction() {
  try {
    // Your code here
    const result = await riskyOperation()
    return { success: true, data: result }
  } catch (error) {
    const message = captureError(error, {
      userId: user?.id,
      action: 'myAction',
      metadata: { someContext: 'value' }
    })

    return { success: false, error: message }
  }
}
```

### In Client Components

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'

export function MyComponent() {
  const handleClick = async () => {
    try {
      await someAsyncOperation()
    } catch (error) {
      Sentry.captureException(error)
      toast.error('Something went wrong')
    }
  }

  return <button onClick={handleClick}>Click me</button>
}
```

### With Error Boundary

```typescript
import { ErrorBoundary } from '@/components/error-boundary'

export function MyPage() {
  return (
    <ErrorBoundary>
      <SomeComponentThatMightError />
    </ErrorBoundary>
  )
}
```

### Performance Monitoring

```typescript
import { startTransaction } from '@/lib/utils/error-handler'

export async function expensiveOperation() {
  const transaction = startTransaction('expensiveOperation', 'task')

  try {
    const result = await doWork()
    transaction.finish()
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    transaction.finish()
    throw error
  }
}
```

---

## Best Practices

### DO:
- ✅ Add user context when available (userId, email)
- ✅ Include relevant metadata (action name, input parameters)
- ✅ Filter out sensitive data (passwords, API keys)
- ✅ Set up alerts for critical errors
- ✅ Review errors weekly and fix high-priority issues

### DON'T:
- ❌ Log every single error (use sampling for high-volume)
- ❌ Include PII (Personally Identifiable Information) in error context
- ❌ Ignore errors - review them regularly
- ❌ Leave test errors in production
- ❌ Forget to update SENTRY_RELEASE on deployments

---

## Monitoring Strategy

### Beta Launch (Month 1)
- Review errors **daily**
- Fix critical errors within 24 hours
- Acceptable error rate: <1%
- Set up Slack alerts for new errors

### Production (Month 2+)
- Review errors **weekly**
- Prioritize by:
  - Number of users affected
  - Frequency
  - Severity (crashes vs warnings)
- Target error rate: <0.1%
- Set up automated alerts for spikes

### Metrics to Track
- Error rate (errors per request)
- Unique users affected
- MTTR (Mean Time To Resolution)
- Most common errors
- Error trends (increasing/decreasing)

---

## Next Steps

1. **Sign up for Sentry** (5 min)
2. **Add DSN to .env.local** (1 min)
3. **Test error tracking** (5 min)
4. **Set up alerts** (10 min)
5. **Add error boundaries** to critical pages (15 min)
6. **Update remaining server actions** with captureError() (30 min)

---

## Cost Estimate

**Free Tier**:
- 5,000 errors/month
- 10,000 transactions/month
- 7-day data retention
- Enough for beta launch

**Team Plan** ($26/month when needed):
- 50,000 errors/month
- 100,000 transactions/month
- 90-day data retention
- Needed around 1,000 users

---

## Troubleshooting

### Errors not appearing in Sentry

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Verify Sentry is initialized (check browser console)
3. Check network tab for sentry.io requests
4. Ensure error isn't filtered by `ignoreErrors` in config

### Source maps not working

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check Vercel build logs for "Uploading source maps"
3. Ensure `hideSourceMaps: true` in next.config.ts
4. Check Sentry → Settings → Source Maps

### Too many errors

1. Add to `ignoreErrors` in sentry.client.config.ts
2. Lower sampling rate (tracesSampleRate)
3. Add error grouping rules
4. Upgrade to paid plan if legitimate traffic

---

**Status**: Ready for setup! Just needs Sentry account and DSN.
**Priority**: HIGH - Required before production launch
