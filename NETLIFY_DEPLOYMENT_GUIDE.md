# Netlify Deployment Guide - Recipe Keeper App

## Overview
This guide will help you deploy the Recipe Keeper App to Netlify as a **separate deployment** from your landing page.

## Deployment Architecture
- **Landing Page**: `recipe-keeper-landing` (already deployed)
- **App**: `recipe-keeper-app` (this deployment - NEW)

## Step-by-Step Deployment

### 1. Install Netlify CLI (if not already installed)
```bash
npm install -g netlify-cli
```

### 2. Login to Netlify
```bash
netlify login
```

### 3. Initialize Netlify Site (from app directory)
```bash
cd ~/projects/recipe-keeper-app
netlify init
```

**During initialization, select:**
- "Create & configure a new site"
- Choose your team
- Site name: `recipe-keeper-app` (or your preferred name)
- Build command: `npm run build`
- Publish directory: `.next`

### 4. Set Environment Variables

You'll need to set all environment variables in Netlify. You can do this either:

**Option A: Via Netlify CLI**
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your_supabase_url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your_anon_key"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your_service_role_key"
netlify env:set STRIPE_SECRET_KEY "your_stripe_secret"
netlify env:set STRIPE_WEBHOOK_SECRET "your_webhook_secret"
netlify env:set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "your_publishable_key"
netlify env:set ANTHROPIC_API_KEY "your_anthropic_key"
netlify env:set GOOGLE_GENERATIVE_AI_API_KEY "your_google_key"
netlify env:set FAL_KEY "your_fal_key"
netlify env:set UPSTASH_REDIS_REST_URL "your_upstash_url"
netlify env:set UPSTASH_REDIS_REST_TOKEN "your_upstash_token"
netlify env:set RESEND_API_KEY "your_resend_key"
```

**Option B: Via Netlify Dashboard**
1. Go to your Netlify dashboard
2. Select your `recipe-keeper-app` site
3. Go to **Site settings** → **Environment variables**
4. Add all the variables listed above

### 5. Deploy

**Manual Deploy:**
```bash
netlify deploy --prod
```

**Automatic Deploy (recommended):**
Netlify will automatically deploy when you push to main branch on GitHub.

### 6. Configure Custom Domain (when ready)

**Option 1: Via Netlify Dashboard**
1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter: `app.myfamilyrecipekeeper.com`
4. Follow DNS configuration instructions

**Option 2: Via CLI**
```bash
netlify domains:add app.myfamilyrecipekeeper.com
```

**DNS Configuration:**
Add a CNAME record to your domain:
- Type: `CNAME`
- Name: `app`
- Value: `[your-site-name].netlify.app`

### 7. Enable HTTPS
Netlify automatically provisions SSL certificates for custom domains. This usually takes a few minutes.

## Required Environment Variables

### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Stripe (Required)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### AI APIs (Required)
```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
FAL_KEY=your_fal_key
```

### Upstash Redis (Required for rate limiting)
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Resend (Required for emails)
```
RESEND_API_KEY=re_...
```

### Sentry (Optional - for error tracking)
```
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=your_org
SENTRY_PROJECT=recipe-keeper-app
SENTRY_AUTH_TOKEN=...
```

## Post-Deployment Checklist

- [ ] App loads at `https://[your-site].netlify.app`
- [ ] Signup page works: `/signup`
- [ ] Login page works: `/login`
- [ ] Authentication works (test signup/login)
- [ ] Admin dashboard accessible (for admin users)
- [ ] Recipe creation works (OCR, manual)
- [ ] AI features work (variations, nutrition)
- [ ] Stripe checkout works
- [ ] Email notifications work (via Resend)
- [ ] Custom domain configured (when ready)
- [ ] SSL certificate active

## Webhook Configuration

### Stripe Webhook
After deployment, update your Stripe webhook endpoint:
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Update or create webhook endpoint:
   - URL: `https://app.myfamilyrecipekeeper.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Netlify

## Monitoring

### Build Logs
```bash
netlify watch
```

### Function Logs
```bash
netlify functions:log
```

### Deploy Log
```bash
netlify deploy:show
```

## Troubleshooting

### Build Fails
1. Check build logs in Netlify dashboard
2. Verify all environment variables are set
3. Try building locally: `npm run build`

### Environment Variables Not Working
1. Ensure variables are set for "Production" scope
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### App Doesn't Load
1. Check browser console for errors
2. Verify Supabase URL and keys are correct
3. Check Netlify function logs for API errors

### 404 Errors on Routes
1. Ensure Next.js plugin is installed
2. Check `netlify.toml` configuration
3. Verify `.next` directory is being published

## Deployment URLs

### Development/Testing
- Netlify preview: `https://[site-name].netlify.app`

### Production (after custom domain)
- App: `https://app.myfamilyrecipekeeper.com`
- Landing page: `https://myfamilyrecipekeeper.com` (separate deployment)

## Support

- Netlify Docs: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/overview/
- Supabase + Netlify: https://supabase.com/docs/guides/hosting/netlify

## Notes

- The app and landing page are **separate deployments**
- Each has its own environment variables and build settings
- Use different Git branches if needed for independent deployments
- Landing page can remain on a different domain or subdomain
