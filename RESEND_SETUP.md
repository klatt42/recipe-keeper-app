# Resend Email Service Setup

This guide explains how to set up Resend for sending cookbook invitation emails.

## Why Resend?

Resend provides:
- **Simple API** - Send emails with just a few lines of code
- **React Email Templates** - Use React components for beautiful emails
- **Generous Free Tier** - 100 emails/day for free, 3,000/month
- **Great Deliverability** - High inbox placement rates
- **No credit card required** - for the free tier

## Setup Steps

### 1. Create a Resend Account

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Go to [API Keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "Recipe Keeper Production")
4. Copy the API key (it starts with `re_`)

### 3. Add Environment Variables

Add to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=Recipe Keeper <noreply@yourdomain.com>
```

**Note**: For development, you can use `onboarding@resend.dev` as the FROM address. For production, you'll need to verify your own domain.

### 4. (Production Only) Verify Your Domain

For production emails, you need to verify your domain:

1. Go to [Domains](https://resend.com/domains) in Resend
2. Click "Add Domain"
3. Enter your domain (e.g., `recipekeeper.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually a few minutes)

Once verified, update your `.env` file:

```bash
EMAIL_FROM=Recipe Keeper <noreply@recipekeeper.com>
```

## Email Templates

The following email templates are configured:

### Cookbook Invitation Email

Located at: `lib/email/templates/cookbook-invitation.tsx`

**Features**:
- Beautiful gradient design
- Responsive layout
- Clear call-to-action button
- Role description (Editor vs Viewer)
- Recipe Keeper branding

**Preview**:
```
Subject: [Inviter Name] invited you to [Cookbook Name]

Body:
- Header with Recipe Keeper logo
- Personalized invitation message
- Highlighted cookbook name with family emoji ❤️
- Role badge (Editor/Viewer)
- Permission list
- Accept Invitation button
- Fallback URL link
- Footer with sender info
```

## Testing

### Development Testing

During development, Resend allows sending to ANY email address without domain verification:

```typescript
// This works in development without domain verification
await resend.emails.send({
  from: 'Recipe Keeper <onboarding@resend.dev>',
  to: 'anyone@example.com',
  subject: 'Test Invitation',
  react: CookbookInvitationEmail({ ... })
})
```

### Test the Integration

1. Set up your `RESEND_API_KEY` in `.env.local`
2. Start the dev server: `npm run dev`
3. Create a shared cookbook
4. Invite a user by email
5. Check the Resend dashboard to see the email was sent
6. Check the recipient's inbox

### Resend Dashboard

View sent emails at: [https://resend.com/emails](https://resend.com/emails)

You can see:
- Delivery status
- Open rates (if tracking enabled)
- Click rates
- Bounce/spam reports

## Error Handling

The invitation system is designed to gracefully handle email failures:

```typescript
// If email service is not configured
if (!isEmailEnabled()) {
  console.warn('Email service not configured. Skipping email.')
  return {
    success: false,
    message: 'Invitation created but email was not sent.'
  }
}

// If email fails to send
if (error) {
  console.error('Failed to send email:', error)
  captureError(error) // Logged to Sentry
  return {
    success: false,
    message: 'User added but email notification failed.'
  }
}
```

**Important**: The invitation still works even if the email fails to send. The user is added to the cookbook - they just won't receive an email notification.

## Email Limits & Pricing

### Free Tier
- 100 emails/day
- 3,000 emails/month
- No credit card required
- All features included

### Paid Plans
- **Pro**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing for higher volumes

For most Recipe Keeper instances, the free tier is sufficient.

## Features

### What's Implemented
- ✅ Cookbook invitation emails
- ✅ Beautiful React email templates
- ✅ Error handling and logging
- ✅ Graceful degradation (works without email service)
- ✅ Sentry integration for error tracking

### What Could Be Added
- 📧 Welcome emails for new users
- 📧 Weekly recipe digest emails
- 📧 Password reset emails (via Supabase)
- 📧 Recipe share emails
- 📧 Comment notifications

## Customizing Email Templates

Edit the template at `lib/email/templates/cookbook-invitation.tsx`:

```tsx
export const CookbookInvitationEmail = ({
  inviterName,
  cookbookName,
  role,
  acceptUrl,
}: CookbookInvitationEmailProps) => {
  return (
    <div style={styles.container}>
      {/* Your custom email content */}
    </div>
  )
}
```

**Tips**:
- Use inline styles (email clients don't support external CSS)
- Test across email clients (Gmail, Outlook, Apple Mail)
- Keep it simple - complex layouts may break
- Use web-safe fonts
- Include a plain text fallback

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly
2. **Check Logs**: Look for error messages in the console
3. **Check Resend Dashboard**: See if the email appears in the logs
4. **Verify Domain**: For production, make sure your domain is verified

### Emails Going to Spam

1. **Verify Your Domain**: Use SPF/DKIM records
2. **Use a Real FROM Address**: Not `noreply@gmail.com`
3. **Avoid Spam Triggers**: Don't use all caps, excessive exclamation marks
4. **Include Unsubscribe Link**: (For marketing emails)

### Rate Limiting

If you hit the 100 emails/day limit:
- Upgrade to Pro plan
- Implement queuing system
- Batch invitation emails

## Support

- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)
- [React Email Templates](https://react.email/)
