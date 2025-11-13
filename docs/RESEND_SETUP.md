# Resend Email Service Setup Guide

**Status**: Infrastructure configured, needs Resend account and API key
**Time**: ~20 minutes

---

## Why Resend?

Resend provides:
- **Simple API** - Easy to integrate, no complicated setup
- **Beautiful emails** - React Email support for stunning HTML emails
- **Developer-friendly** - Great testing and debugging tools
- **Generous free tier** - 3,000 emails/month for free
- **High deliverability** - Built-in SPF/DKIM configuration

**Cost**: Free tier includes 3,000 emails/month (more than enough for beta launch)

---

## Setup Steps

### 1. Create Resend Account

1. Go to [resend.com/signup](https://resend.com/signup)
2. Sign up with your email (free tier is perfect for start)
3. Verify your email address

### 2. Get Your API Key

1. After logging in, go to **API Keys**
2. Click **Create API Key**
3. Name: `Recipe Keeper Production`
4. Permission: **Full access** (for development) or **Sending access** (for production)
5. Copy the API key (starts with `re_`)
6. **IMPORTANT**: Save it somewhere safe - you won't be able to see it again

### 3. Add to Environment Variables

**Development** (`.env.local`):
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_DOMAIN=resend.dev  # Use this for testing without domain verification
```

**Production** (Vercel environment variables):
```bash
vercel env add RESEND_API_KEY
# Paste your API key
# Select: Production, Preview

vercel env add RESEND_DOMAIN
# Enter: yourdomain.com (after domain verification - see step 4)
# Select: Production, Preview
```

### 4. Domain Verification (Optional for Beta, Required for Production)

**For testing/beta**, you can skip this and use `resend.dev` as the sending domain.

**For production**:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `recipekeep er.com`)
4. Add the DNS records shown to your domain provider:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
5. Wait for verification (usually 15-30 minutes)
6. Update `RESEND_DOMAIN` in production to your verified domain

---

## Test Email Functionality

### 1. Test Cookbook Invitation

```bash
# Start dev server
npm run dev

# In your browser:
# 1. Log in to Recipe Keeper
# 2. Create a cookbook
# 3. Invite someone by email
# 4. Check that user's inbox for the invitation email
```

### 2. Test Welcome Email (Optional)

Create a test API route `app/api/test-email/route.ts`:

```typescript
import { sendWelcomeEmail } from '@/lib/email/send-invitation'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email') || 'test@example.com'

  const result = await sendWelcomeEmail(email, 'Test User')

  if (result.success) {
    return NextResponse.json({ success: true, message: 'Email sent!' })
  } else {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }
}
```

Visit: `http://localhost:3004/api/test-email?email=your@email.com`

Check your inbox for the welcome email.

### 3. Check Resend Dashboard

1. Go to **Emails** in Resend dashboard
2. You should see your sent emails
3. Click on an email to see:
   - Delivery status
   - Opens/clicks (if tracking enabled)
   - Full email preview
   - Raw HTML/text

---

## What's Already Configured

✅ **Resend SDK installed** (`resend@^6.4.2`)

✅ **Email client** (`lib/email/client.ts`):
  - `sendEmail()` - Send any email
  - `verifyEmailConfig()` - Check API key is valid

✅ **Email templates**:
  - **Cookbook Invitation** (`lib/email/templates/cookbook-invitation.ts`)
    - Beautiful HTML design
    - Dynamic content (cookbook name, role, recipe count)
    - Mobile-responsive
    - Role-specific permissions description
  - **Welcome Email** (`lib/email/send-invitation.ts`)
    - Sent to new users on signup

✅ **Integration with cookbook invitations**:
  - `inviteToBook()` now automatically sends email (lib/actions/recipe-books.ts:307)
  - Email failure won't prevent invitation (graceful degradation)
  - Sentry captures email errors for debugging

---

## Email Templates

### Cookbook Invitation Email

**Features**:
- 📧 Professional HTML design
- 📱 Mobile-responsive
- 🎨 Branded with Recipe Keeper colors
- 📊 Shows recipe count if cookbook has recipes
- 🔑 Role-based permissions explanation
- 🔗 One-click accept button
- 📋 Plain text fallback

**Props**:
```typescript
{
  inviterName: string        // "John Doe"
  cookbookName: string       // "Family Favorites"
  role: 'owner' | 'editor' | 'viewer'
  acceptUrl: string          // Link to cookbook
  recipesCount?: number      // Optional: 42
}
```

**Preview**:
```
Subject: John Doe invited you to "Family Favorites" cookbook

┌─────────────────────────────────────┐
│           📚                        │
│      Cookbook Invitation            │
└─────────────────────────────────────┘

John Doe has invited you to collaborate
on their family cookbook!

You've been given access to "Family Favorites".
This cookbook already has 15 recipes waiting
for you to explore.

Your Role: Editor
Permissions: You can add and edit recipes

        [View Cookbook →]
```

### Welcome Email

Sent when users sign up (you can hook this into Supabase Auth triggers).

**Features**:
- 🎉 Warm welcome
- 📋 Feature highlights
- 🚀 CTA to get started

---

## Resend Dashboard Features

### Emails Tab
- View all sent emails
- Filter by status (sent, delivered, bounced, etc.)
- Search by recipient
- See open/click rates

### Logs Tab
- Real-time delivery logs
- Error messages
- Webhook events

### Analytics
- Total emails sent
- Delivery rate
- Open rate (if tracking enabled)
- Click rate (if tracking enabled)
- Bounce rate

---

## Best Practices

### DO:
- ✅ Use descriptive subject lines
- ✅ Include plain text version
- ✅ Test emails before production launch
- ✅ Monitor bounce rate (should be <2%)
- ✅ Use verified domain for production
- ✅ Handle email errors gracefully (don't fail the action)

### DON'T:
- ❌ Send emails without user consent
- ❌ Use generic "noreply" addresses (use "hello@" or "support@")
- ❌ Include too many images (affects load time)
- ❌ Send test emails to production lists
- ❌ Ignore bounces (remove invalid emails)

---

## Email Types to Implement

### Already Implemented:
1. ✅ **Cookbook Invitation** - Sent when inviting members
2. ✅ **Welcome Email** - Sent to new users (optional)

### Future Additions:
3. **Password Reset** - Send magic link for password reset
4. **Recipe Shared** - Notify when someone shares a recipe
5. **Weekly Digest** - Summary of new recipes in shared cookbooks
6. **Premium Upgrade** - Confirmation of premium subscription
7. **Payment Receipt** - Stripe payment confirmation
8. **Activity Notifications** - Someone added a recipe to your cookbook

---

## Troubleshooting

### Emails not sending

1. **Check API key**:
   ```bash
   # In your .env.local
   echo $RESEND_API_KEY
   # Should start with "re_"
   ```

2. **Check logs**:
   - Server console for errors
   - Resend dashboard → Logs
   - Sentry for captured errors

3. **Verify domain** (if using custom domain):
   - Resend dashboard → Domains
   - Check DNS records are correct
   - Wait 15-30 minutes after adding records

### Emails going to spam

1. **Use verified domain** (not resend.dev)
2. **Set up SPF and DKIM** (automatic with Resend)
3. **Include unsubscribe link** (required for bulk emails)
4. **Avoid spammy words** (FREE, URGENT, CLICK HERE)
5. **Test with Mail Tester** (mail-tester.com)

### High bounce rate

1. **Remove invalid emails** from database
2. **Use email validation** on signup
3. **Monitor bounce reasons** in Resend dashboard
4. **Set up webhook** to auto-remove bounced emails

---

## Cost Estimates

### Free Tier (Perfect for Beta):
- 3,000 emails/month
- All features included
- Email support

### Pro Plan ($20/month, when needed):
- 50,000 emails/month
- ~1,000 users with:
  - Signup welcome (1,000 emails)
  - Cookbook invites (~2/user = 2,000 emails)
  - Weekly digest (~800 emails/month)
  - Misc notifications (~1,000 emails)
  - **Total: ~4,800 emails/month** ✅ Still free tier!

### At 10,000 users:
- ~50,000 emails/month → **Pro Plan ($20/month)**
- Still very affordable!

---

## Webhook Setup (Advanced)

To automatically handle bounces and complaints:

1. Go to **Webhooks** in Resend
2. Add webhook URL: `https://yourdomain.com/api/webhooks/resend`
3. Select events:
   - `email.bounced` - Remove from list
   - `email.complained` - Unsubscribe user
   - `email.delivered` - Update stats

4. Create webhook handler `app/api/webhooks/resend/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = await createClient()

  switch (body.type) {
    case 'email.bounced':
      // Mark email as bounced in database
      await supabase
        .from('users')
        .update({ email_bounced: true })
        .eq('email', body.data.to)
      break

    case 'email.complained':
      // Unsubscribe user from emails
      await supabase
        .from('users')
        .update({ email_unsubscribed: true })
        .eq('email', body.data.to)
      break
  }

  return NextResponse.json({ success: true })
}
```

---

## Next Steps

1. **Sign up for Resend** (5 min) ✓
2. **Get API key** (2 min) ✓
3. **Add to .env.local** (1 min) ✓
4. **Test cookbook invitation** (5 min)
5. **Verify domain** (optional, for production) (30 min)
6. **Monitor emails** in Resend dashboard (ongoing)

---

## Resources

- [Resend Documentation](https://resend.com/docs)
- [React Email Examples](https://react.email/examples)
- [Email Best Practices](https://resend.com/docs/send-with-best-practices)
- [Domain Verification Guide](https://resend.com/docs/dashboard/domains/introduction)

---

**Status**: Ready for setup! Just needs Resend account and API key.
**Priority**: HIGH - Required for cookbook invitations (core feature)
**Estimated setup time**: 20 minutes
