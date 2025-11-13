# Sentry Error Monitoring Setup

This guide explains how to set up Sentry for production error monitoring in Recipe Keeper.

## Why Sentry?

Sentry provides:
- **Real-time error tracking** - See errors as they happen in production
- **Stack traces** - Debug issues with full context
- **Performance monitoring** - Track slow API calls and page loads
- **Session replay** - Watch exactly what users experienced before errors
- **Release tracking** - Know which version has bugs

## Setup Steps

### 1. Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Create a free account (up to 5,000 errors/month)
3. Create a new project and select "Next.js"
4. Copy your DSN (Data Source Name)

### 2. Add Environment Variables

Add the following to your `.env.local` file:

```bash
# Sentry Error Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=recipe-keeper
```

For CI/CD (optional):
```bash
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Configuration Files

The following files have been configured for you:

- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Server instrumentation
- `next.config.ts` - Webpack plugin configuration

### 4. Usage in Server Actions

Wrap server actions with the `withSentry` helper:

```typescript
import { withSentry } from '@/lib/utils/sentry'

export const createRecipe = withSentry(
  async (formData: RecipeFormData) => {
    'use server'

    // Your action code here
    // If an error occurs, it will be automatically reported to Sentry

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('recipes')
      .insert([formData])

    if (error) throw error

    return { success: true, data }
  },
  'createRecipe' // Action name for Sentry
)
```

### 5. Manual Error Reporting

Capture errors manually when needed:

```typescript
import { captureError, captureMessage } from '@/lib/utils/sentry'

try {
  await someRiskyOperation()
} catch (error) {
  captureError(error as Error, {
    tags: { feature: 'recipe-import' },
    extra: { recipeId: '123' },
    user: { id: userId }
  })
  throw error
}

// Or capture informational messages
captureMessage('User imported 100th recipe', 'info')
```

### 6. Client-Side Error Tracking

Client-side errors are automatically captured. You can also manually capture:

```typescript
'use client'
import * as Sentry from '@sentry/nextjs'

function MyComponent() {
  try {
    // risky client code
  } catch (error) {
    Sentry.captureException(error)
  }
}
```

## Features Configured

### Performance Monitoring
- **Traces Sample Rate**: 10% (adjust in production based on traffic)
- **Transaction Tracking**: API routes, server actions, page loads

### Session Replay
- **10%** of normal sessions recorded
- **100%** of error sessions recorded
- Great for debugging user issues

### Privacy & Security
- **Cookies**: Automatically filtered out
- **Headers**: Automatically filtered out
- **User emails**: Filtered from server-side events
- **Request bodies**: Not captured by default

### Error Filtering
- Common browser errors ignored (ResizeObserver, etc.)
- Development errors ignored (EADDRINUSE)

## Sentry Dashboard

Once configured, visit your Sentry dashboard to:
1. **View errors** - See all errors with stack traces
2. **Set up alerts** - Get notified via email/Slack
3. **Track releases** - Know which deploy broke what
4. **Monitor performance** - Find slow queries
5. **Watch session replays** - See exactly what users did

## Cost

Sentry Free Tier:
- 5,000 errors/month
- 10,000 transactions/month
- 50 replays/month

For production with higher traffic, upgrade to:
- **Team**: $26/month (50k errors)
- **Business**: $80/month (100k errors)

## Testing

To test Sentry is working:

```typescript
// In a server action
import { captureMessage } from '@/lib/utils/sentry'

captureMessage('Sentry test message', 'info')

// Or throw a test error
throw new Error('Test error for Sentry')
```

Check your Sentry dashboard to see the error appear!

## Best Practices

1. **Don't log PII** - User emails, passwords, etc. are already filtered
2. **Add context** - Use tags and extra data to help debugging
3. **Set up alerts** - Get notified of critical errors immediately
4. **Review weekly** - Check dashboard for patterns
5. **Fix high-frequency errors first** - Focus on what affects most users

## Support

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Support](https://sentry.io/support/)
