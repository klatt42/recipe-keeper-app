# Environment Variables Checklist for Netlify Deployment

## ✅ You Already Have These (From .env.local)

### Supabase (REQUIRED) ✅
```
NEXT_PUBLIC_SUPABASE_URL=https://kbksmusflftsakmalgkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtia3NtdXNmbGZ0c2FrbWFsZ2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjgxNDUsImV4cCI6MjA3NjMwNDE0NX0.Aq1Ddn_X5tWOZV1sgT1nzkrUsRltMPLmW4WpJEx6ymg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtia3NtdXNmbGZ0c2FrbWFsZ2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDcyODE0NSwiZXhwIjoyMDc2MzA0MTQ1fQ.kykHvUxsA82alzBc5TYwSPbQLJsIB0efbjJoXrNMwMI
```

### Google AI (REQUIRED - for OCR) ✅
```
GOOGLE_AI_API_KEY=AIzaSyDiq0lChV98MlF_6V1nzGP1ZMWPCzxaCxU
```
Note: Should be `GOOGLE_GENERATIVE_AI_API_KEY` for consistency

### Anthropic Claude (REQUIRED - for AI features) ✅
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```
(You have this in your .env.local)

### Stripe (REQUIRED - TEST MODE) ✅
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
(You have these in your .env.local)

---

## ⚠️ Missing But Used by Code (Need to Set Up)

### FAL AI (Used for image generation)
**Status**: Used in code but NOT in your .env file
**Where it's used**: `lib/services/image-generation.ts`
**Setup**:
1. Sign up at https://www.fal.ai/
2. Get API key from dashboard
3. Add to Netlify:
```
FAL_KEY=your_fal_key_here
```
**Can skip for now?**: YES - Image generation is an optional feature

### Upstash Redis (Used for rate limiting)
**Status**: Empty in your .env file
**Where it's used**: `lib/ratelimit.ts`, `lib/rate-limit/check.ts`
**Setup**: See UPSTASH_SETUP.md on your Desktop
1. Sign up at https://console.upstash.com/
2. Create a Redis database
3. Get REST URL and token
4. Add to Netlify:
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```
**Can skip for now?**: YES - But recommended for production to prevent abuse

### Resend (Used for emails)
**Status**: Empty in your .env file
**Where it's used**: `lib/email/resend.ts`, cookbook invitations
**Setup**: See RESEND_SETUP.md on your Desktop
1. Sign up at https://resend.com/
2. Get API key
3. Add to Netlify:
```
RESEND_API_KEY=re_...
```
**Can skip for now?**: YES - But needed for cookbook sharing emails

### Sentry (Error tracking)
**Status**: Empty in your .env file
**Where it's used**: Error monitoring and reporting
**Setup**: See SENTRY_SETUP.md
1. Sign up at https://sentry.io/
2. Create project
3. Get DSN and auth token
4. Add to Netlify:
```
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=your_org
SENTRY_PROJECT=recipe-keeper-app
SENTRY_AUTH_TOKEN=...
```
**Can skip for now?**: YES - Optional, but very helpful for production

---

## 🚀 Minimum Required for Initial Deployment

For your FIRST deployment to test the app, you only need:

### Required (You have these ✅):
1. ✅ Supabase keys
2. ✅ Google AI key
3. ✅ Anthropic key
4. ✅ Stripe keys (test mode)

### Can Skip for Now:
1. ❌ FAL_KEY (image generation - not critical)
2. ❌ UPSTASH (rate limiting - can add later)
3. ❌ RESEND (emails - can add later)
4. ❌ SENTRY (error tracking - can add later)

---

## 📝 Action Plan

### Phase 1: Deploy with What You Have (NOW)
1. Go to Netlify Dashboard
2. Import GitHub repo
3. Add ONLY these environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - GOOGLE_GENERATIVE_AI_API_KEY (use your GOOGLE_AI_API_KEY value)
   - ANTHROPIC_API_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
4. Deploy and test

### Phase 2: Add Optional Services (LATER)
After initial deployment works:
1. Set up Upstash Redis for rate limiting
2. Set up Resend for emails
3. Set up Sentry for error tracking
4. Set up FAL if you want image generation

---

## 🔧 Setup Guides on Your Desktop

All these guides are in:
`C:\Users\RonKlatt_3qsjg34\Desktop\Recipe Keeper\Environment Variables\`

- **DEPLOY_NOW.md** - Quick deployment steps
- **NETLIFY_DEPLOYMENT_GUIDE.md** - Full deployment reference
- **netlify.toml** - Netlify configuration

Additional setup guides in the repo:
- **UPSTASH_SETUP.md** - Redis rate limiting setup
- **RESEND_SETUP.md** - Email service setup
- **SENTRY_SETUP.md** - Error tracking setup

---

## 🎯 Recommendation

**Start Simple**: Deploy with just the required variables you already have. This will:
- Get your app live quickly
- Let you test core functionality (auth, recipes, OCR, AI)
- Avoid setup overhead for services you might not need yet

**Add Later**: Once the app is working, you can add:
- Upstash (prevents rate limit abuse)
- Resend (enables cookbook sharing emails)
- Sentry (helps catch production errors)
- FAL (if you want AI image generation)

You can add environment variables in Netlify at any time and redeploy!

---

## ⚠️ Note About GOOGLE_AI_API_KEY

Your .env.local has:
```
GOOGLE_AI_API_KEY=...
```

But the code might expect:
```
GOOGLE_GENERATIVE_AI_API_KEY=...
```

**Solution**: In Netlify, add it as `GOOGLE_GENERATIVE_AI_API_KEY` using the same value.
