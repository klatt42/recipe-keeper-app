# Production Domain Setup Guide

**Status**: Ready for domain purchase and configuration
**Time**: ~2 hours for initial setup
**Cost**: $10-15/year for domain

---

## Overview

This guide covers setting up a custom domain for Recipe Keeper in production, including:
- Domain registration
- DNS configuration
- SSL/TLS certificates
- Deployment to Vercel/Netlify
- Environment variable updates
- Testing and verification

---

## Domain Selection

### Recommended Domain Options

**Primary Choice**: `recipekeeper.app`
- Modern .app TLD (secure by default, requires HTTPS)
- Memorable and brand-appropriate
- Cost: ~$15/year

**Alternative Options**:
- `recipekeeper.io` - Tech-focused
- `recipekeeper.co` - Short and clean
- `familyrecipekeeper.com` - Descriptive
- `keepyourrecipes.com` - Action-oriented
- `recipearchive.io` - Archival focus

### Domain Registrars (Recommended)

**1. Namecheap** (Recommended)
- Pros: Cheap, reliable, good UI
- Free WHOIS privacy
- Easy DNS management
- Cost: $10-15/year
- Link: https://www.namecheap.com/

**2. Google Domains** (Now Squarespace Domains)
- Pros: Simple, integrated with Google services
- Free WHOIS privacy
- Good documentation
- Cost: $12-15/year
- Link: https://domains.squarespace.com/

**3. Cloudflare Registrar**
- Pros: At-cost pricing (no markup)
- Built-in CDN and security
- Advanced DNS features
- Cost: $8-10/year
- Link: https://www.cloudflare.com/products/registrar/

**Avoid**: GoDaddy (upsells), Network Solutions (expensive)

---

## Step-by-Step Setup

### Step 1: Purchase Domain (15 minutes)

1. **Choose Registrar**: Namecheap (recommended for simplicity)

2. **Search for Domain**:
   - Go to https://www.namecheap.com/
   - Search for your desired domain
   - Check availability

3. **Purchase**:
   - Add to cart
   - **Enable WHOIS Privacy** (free)
   - **Disable auto-renewal upsells** (hosting, email, etc.)
   - Checkout

4. **Verify Email**:
   - Check email for verification link
   - Click to verify domain ownership

### Step 2: Deploy to Vercel (30 minutes)

Vercel is recommended for Next.js applications (automatic SSL, CDN, easy deployment).

#### A. Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

#### B. Link Project

```bash
# Navigate to project
cd ~/projects/recipe-keeper-app

# Initialize Vercel project
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? recipe-keeper
# - Directory? ./
# - Override settings? N
```

#### C. Add Environment Variables

```bash
# Add production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://kbksmusflftsakmalgkl.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: your-anon-key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: your-service-role-key

vercel env add GOOGLE_AI_API_KEY production
# Paste: your-gemini-key

vercel env add ANTHROPIC_API_KEY production
# Paste: your-claude-key

vercel env add ANTHROPIC_MODEL production
# Paste: claude-sonnet-4-20250514

# Sentry (if configured)
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste: your-sentry-dsn

vercel env add SENTRY_ORG production
# Paste: your-org

vercel env add SENTRY_PROJECT production
# Paste: recipe-keeper

vercel env add SENTRY_AUTH_TOKEN production
# Paste: your-auth-token

# Resend (if configured)
vercel env add RESEND_API_KEY production
# Paste: your-resend-key

vercel env add RESEND_DOMAIN production
# Paste: your-domain.com (or resend.dev for testing)

# Upstash (if configured)
vercel env add UPSTASH_REDIS_REST_URL production
# Paste: your-upstash-url

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Paste: your-upstash-token

# Production URL (will update after domain is configured)
vercel env add NEXT_PUBLIC_APP_URL production
# Paste: https://yourdomain.com
```

#### D. Deploy to Production

```bash
# Build and deploy to production
vercel --prod

# Output will show:
# ✓ Production: https://recipe-keeper-xxx.vercel.app
```

### Step 3: Configure DNS (20 minutes)

Now connect your custom domain to Vercel.

#### A. Add Domain in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select **recipe-keeper** project
3. Click **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain: `yourdomain.com`
6. Click **Add**

Vercel will show DNS records you need to add.

#### B. Configure DNS at Registrar

**For Namecheap**:

1. Login to Namecheap
2. **Domain List** → Click **Manage** next to your domain
3. **Advanced DNS** tab
4. **Delete default records** (parking page)
5. **Add New Record**:

**Option 1: Using Vercel Nameservers (Recommended)**

Vercel will show nameservers like:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

In Namecheap:
- **Domain** tab → **Nameservers** → **Custom DNS**
- Add Vercel's nameservers
- Save

**Option 2: Using A/CNAME Records**

Add these records in Namecheap Advanced DNS:

| Type  | Host | Value                | TTL       |
|-------|------|----------------------|-----------|
| A     | @    | 76.76.21.21         | Automatic |
| CNAME | www  | cname.vercel-dns.com | Automatic |

**For Cloudflare**:

1. Login to Cloudflare
2. Select your domain
3. **DNS** → **Records**
4. Add records:

| Type  | Name | Content              | Proxy Status |
|-------|------|----------------------|--------------|
| A     | @    | 76.76.21.21         | Proxied      |
| CNAME | www  | cname.vercel-dns.com | Proxied      |

**For Google Domains**:

1. Login to Squarespace Domains
2. Select domain → **DNS**
3. **Custom Records**:

| Type  | Name | Data                 | TTL |
|-------|------|----------------------|-----|
| A     | @    | 76.76.21.21         | 1h  |
| CNAME | www  | cname.vercel-dns.com | 1h  |

#### C. Wait for DNS Propagation

DNS changes can take **5 minutes to 48 hours** to propagate.

**Check DNS propagation**:
```bash
# Check if DNS is resolving
nslookup yourdomain.com

# Or use online tool
# https://www.whatsmydns.net/
```

### Step 4: Verify SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates using Let's Encrypt.

1. **Wait for SSL**: Usually takes 5-10 minutes after DNS propagates
2. **Check Status**: Vercel Dashboard → Domains → should show "Valid Certificate"
3. **Test HTTPS**:
   ```bash
   curl -I https://yourdomain.com
   # Should return 200 OK with SSL headers
   ```

### Step 5: Update Environment Variables (5 minutes)

Update production URLs to use your custom domain:

```bash
# Update app URL
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://yourdomain.com

# Update Resend domain (if using custom domain for emails)
vercel env rm RESEND_DOMAIN production
vercel env add RESEND_DOMAIN production
# Enter: yourdomain.com
```

### Step 6: Update Supabase Allowed URLs (10 minutes)

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. Select project: `kbksmusflftsakmalgkl`
3. **Settings** → **Authentication**
4. **Site URL**:
   - Update to: `https://yourdomain.com`

5. **Redirect URLs** (add):
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/**
   ```

6. **Save**

### Step 7: Redeploy Application (5 minutes)

```bash
# Trigger new deployment with updated env vars
vercel --prod

# Or via Vercel Dashboard:
# Deployments → latest deployment → ⋮ → Redeploy
```

### Step 8: Test Everything (20 minutes)

#### A. DNS and SSL

```bash
# Test DNS resolution
dig yourdomain.com

# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Test HTTP redirect to HTTPS
curl -I http://yourdomain.com
# Should show 301/308 redirect to https://
```

#### B. Application Functionality

1. **Visit**: https://yourdomain.com
2. **Test Signup**:
   - Create new account
   - Check email verification works
3. **Test Login**:
   - Login with created account
   - Verify redirect works
4. **Test Recipe Import**:
   - Upload recipe image
   - Verify Gemini API works
5. **Test Sharing**:
   - Create cookbook
   - Invite another user
   - Verify invitation email sends
6. **Test Rate Limiting**:
   - Try 6 imports quickly
   - Should see rate limit error on 6th

#### C. Third-Party Service URLs

Update OAuth redirect URIs if using social login:

**Google OAuth** (if implemented):
- Console: https://console.cloud.google.com/
- APIs & Services → Credentials
- OAuth 2.0 Client IDs → Edit
- Authorized redirect URIs:
  - Add: `https://yourdomain.com/auth/callback`

**GitHub OAuth** (if implemented):
- Settings → Developer settings → OAuth Apps
- Update callback URL:
  - `https://yourdomain.com/auth/callback`

---

## Alternative: Netlify Deployment

If you prefer Netlify over Vercel:

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Follow prompts:
# - Create & configure new site? Y
# - Team? (select your team)
# - Site name? recipe-keeper
# - Build command? npm run build
# - Publish directory? .next

# Deploy
netlify deploy --prod
```

### Add Environment Variables

```bash
# Or via Netlify Dashboard:
# Site settings → Environment variables → Add

netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://kbksmusflftsakmalgkl.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key"
# ... add all env vars
```

### Add Custom Domain

1. Netlify Dashboard → Domain settings
2. Add custom domain → Enter domain
3. Follow DNS configuration steps (similar to Vercel)

---

## Email Domain Configuration (Optional)

If you want to send emails from your custom domain (instead of resend.dev):

### Step 1: Verify Domain in Resend

1. **Resend Dashboard**: https://resend.com/domains
2. Click **Add Domain**
3. Enter: `yourdomain.com`
4. Resend will show DNS records to add

### Step 2: Add DNS Records

Add these records to your DNS:

| Type | Host              | Value                          | Priority |
|------|-------------------|--------------------------------|----------|
| TXT  | @                 | resend-verify=xxx              | -        |
| MX   | @                 | feedback-smtp.resend.com       | 10       |
| TXT  | resend._domainkey | (DKIM key from Resend)         | -        |

### Step 3: Verify

1. Wait 5-10 minutes for DNS propagation
2. Resend Dashboard → Click **Verify**
3. Status should change to "Verified"

### Step 4: Update Email Templates

```typescript
// lib/email/send-invitation.ts

// Change from:
from: 'Recipe Keeper <noreply@resend.dev>'

// To:
from: 'Recipe Keeper <noreply@yourdomain.com>'
```

Redeploy after updating.

---

## Custom Domain for Supabase (Advanced)

If you want custom domain for Supabase API:

**Pro Plan Feature** ($25/month):
- Supabase Dashboard → Settings → Custom Domains
- Add: `api.yourdomain.com`
- Configure CNAME: `api.yourdomain.com` → `kbksmusflftsakmalgkl.supabase.co`

**Benefits**:
- Branded API URLs
- Easier to migrate in future
- Professional appearance

---

## Monitoring Production Domain

### Health Checks

Create health check endpoint:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check database connection
    const supabase = await createClient()
    const { error } = await supabase.from('profiles').select('count').limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    )
  }
}
```

### Uptime Monitoring

**Free Options**:
1. **UptimeRobot** (https://uptimerobot.com/)
   - Free: 50 monitors, 5-minute checks
   - Monitor: `https://yourdomain.com/api/health`

2. **Better Uptime** (https://betteruptime.com/)
   - Free: 10 monitors, 3-minute checks
   - SMS alerts on downtime

3. **Vercel Built-in Monitoring**
   - Automatic checks
   - Dashboard → Analytics

### SSL Certificate Monitoring

```bash
# Check SSL expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Should show:
# notBefore=...
# notAfter=... (should be ~90 days in future for Let's Encrypt)
```

Vercel automatically renews Let's Encrypt certificates before expiry.

---

## Security Headers

Add security headers in `next.config.ts`:

```typescript
// next.config.ts
const nextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://*.sentry.io",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

Test security headers: https://securityheaders.com/

---

## Troubleshooting

### Domain Not Resolving

**Issue**: Domain doesn't load after DNS configuration

**Solutions**:
1. **Wait longer**: DNS can take up to 48 hours
2. **Check DNS propagation**: https://www.whatsmydns.net/
3. **Verify records**: Use `dig yourdomain.com`
4. **Clear DNS cache**:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Linux
   sudo systemd-resolve --flush-caches

   # Windows
   ipconfig /flushdns
   ```

### SSL Certificate Not Provisioning

**Issue**: HTTPS doesn't work, certificate pending

**Solutions**:
1. **Wait**: Can take 5-15 minutes after DNS propagates
2. **Verify DNS**: Domain must resolve before SSL can provision
3. **Check CAA records**: Shouldn't block Let's Encrypt
   ```bash
   dig CAA yourdomain.com
   # Should be empty or allow letsencrypt.org
   ```
4. **Remove and re-add domain** in Vercel dashboard

### WWW vs Non-WWW Redirect

**Issue**: www.yourdomain.com doesn't redirect to yourdomain.com

**Solution**: Add both domains in Vercel, set one as primary:
1. Vercel Dashboard → Domains
2. Add both `yourdomain.com` and `www.yourdomain.com`
3. Set `yourdomain.com` as primary
4. Vercel automatically redirects www to non-www

### Email Sending Failed After Domain Change

**Issue**: Resend emails fail with "Domain not verified"

**Solutions**:
1. Verify domain in Resend dashboard
2. Check DNS records are correct (TXT, MX, DKIM)
3. Wait for DNS propagation
4. Test with Resend's test send feature

### Environment Variables Not Working

**Issue**: App doesn't use new environment variables

**Solutions**:
1. **Redeploy**: Changes require new deployment
   ```bash
   vercel --prod
   ```
2. **Check scope**: Ensure vars are added to "Production"
3. **Verify in dashboard**: Settings → Environment Variables
4. **Check builds**: Deployments → Build Logs

---

## Cost Summary

### Domain Registration
- **.com/.io/.app**: $10-15/year
- **WHOIS Privacy**: Free (with most registrars)
- **Total**: ~$12/year

### Hosting (Vercel)
- **Free Tier**: Perfect for beta (100GB bandwidth, unlimited requests)
- **Pro Tier** ($20/month): If you need more
  - 1TB bandwidth
  - Advanced analytics
  - Password protection

### SSL Certificate
- **Free**: Automatic Let's Encrypt via Vercel
- **Auto-renewal**: No management needed

### DNS
- **Free**: Included with domain
- **Cloudflare**: Free (optional, for CDN/DDoS protection)

### Email Domain (Optional)
- **Free**: Resend verification included
- **Sending**: Free tier (3,000 emails/month)

**Total First Year**: ~$12 (domain only) + $0 (free tier hosting)

---

## Launch Day Checklist

Before you point your domain to production:

- [ ] All environment variables configured in Vercel
- [ ] Sentry DSN added and tested
- [ ] Resend API key added and tested
- [ ] Upstash Redis credentials added
- [ ] Database backups enabled
- [ ] Health check endpoint working
- [ ] Security headers configured
- [ ] Legal pages customized (/privacy, /terms)
- [ ] Legal links in footer and signup
- [ ] Test user flow (signup → login → import → share)
- [ ] Rate limiting tested
- [ ] Error reporting tested (Sentry)
- [ ] Email sending tested (Resend)
- [ ] Mobile responsiveness verified
- [ ] Performance audit completed (Lighthouse)
- [ ] Supabase redirect URLs updated
- [ ] Social OAuth redirects updated (if applicable)

---

## Post-Launch

### Day 1
- [ ] Monitor error rates in Sentry
- [ ] Check deployment logs in Vercel
- [ ] Verify SSL certificate is valid
- [ ] Test all user flows
- [ ] Monitor API costs

### Week 1
- [ ] Review Sentry errors daily
- [ ] Check Upstash rate limit hits
- [ ] Monitor database performance
- [ ] Gather user feedback
- [ ] Fix critical bugs

### Month 1
- [ ] Review domain analytics (Vercel Analytics)
- [ ] Check SSL certificate renewal
- [ ] Test backup restore procedure
- [ ] Review and optimize costs
- [ ] Plan feature updates

---

## Resources

- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Namecheap DNS Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/)
- [Let's Encrypt Certificate Info](https://letsencrypt.org/docs/)
- [Resend Domain Verification](https://resend.com/docs/dashboard/domains/introduction)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Status**: Ready for domain purchase and deployment
**Priority**: MEDIUM - Required for production, but can launch on vercel.app subdomain first
**Estimated time**: 2 hours
**Estimated cost**: $12/year (domain) + $0/month (free tier hosting)

---

## Quick Reference

### Deploy to Production
```bash
vercel --prod
```

### Add Environment Variable
```bash
vercel env add VARIABLE_NAME production
```

### Check DNS
```bash
dig yourdomain.com
nslookup yourdomain.com
```

### Test SSL
```bash
curl -I https://yourdomain.com
```

### Redeploy
```bash
vercel --prod
```

**🚀 You're ready to launch! Good luck with Recipe Keeper!**
