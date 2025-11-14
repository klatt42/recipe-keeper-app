# Deploy Recipe Keeper App to Netlify - Quick Start

## Step-by-Step Instructions

### 1. Open Netlify Dashboard
Go to: https://app.netlify.com

You'll already be logged in as Ronald Klatt (ppsc.rok@gmail.com)

### 2. Create New Site
1. Click **"Add new site"** button (top right)
2. Select **"Import an existing project"**

### 3. Connect to GitHub
1. Click **"Deploy with GitHub"**
2. Authorize Netlify (if prompted)
3. Search for and select: **`recipe-keeper-app`**
4. Click **Select**

### 4. Configure Build Settings
Netlify should auto-detect these from your `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Production branch**: `main`

✅ Just verify these are correct and click **"Deploy"**

### 5. WAIT - Add Environment Variables First!
⚠️ **IMPORTANT**: Before the build completes, add environment variables:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add each variable below:

#### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
```

#### Stripe (Required)
```
STRIPE_SECRET_KEY = sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET = whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_... (or pk_live_...)
```

#### AI APIs (Required)
```
ANTHROPIC_API_KEY = sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY = AIza...
FAL_KEY = your_fal_key
```

#### Upstash Redis (Required)
```
UPSTASH_REDIS_REST_URL = https://...
UPSTASH_REDIS_REST_TOKEN = ...
```

#### Resend (Required)
```
RESEND_API_KEY = re_...
```

#### Sentry (Optional)
```
NEXT_PUBLIC_SENTRY_DSN = https://...
SENTRY_ORG = your_org
SENTRY_PROJECT = recipe-keeper-app
SENTRY_AUTH_TOKEN = ...
```

### 6. Trigger Redeploy
After adding all environment variables:
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

### 7. Monitor Build
Watch the build logs. The build takes about 2-3 minutes.

✅ **Success indicators**:
- Build completes without errors
- "Published" status shows green checkmark
- You get a URL like: `https://[random-name].netlify.app`

### 8. Test Your Deployment
Visit your new URL and test:
- [ ] Homepage loads
- [ ] Login page works (`/login`)
- [ ] Signup page works (`/signup`)
- [ ] Can create an account
- [ ] Can add a recipe

### 9. Configure Custom Domain (Optional - Do Later)
Once everything works on the temporary URL:

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter: `app.myfamilyrecipekeeper.com`
4. Follow DNS configuration instructions

**DNS Setup:**
Add a CNAME record in your domain registrar:
- Type: `CNAME`
- Name: `app`
- Value: `[your-site-name].netlify.app`

### 10. Update Stripe Webhook (After Deployment)
Once you have your final URL:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Update or create endpoint:
   - URL: `https://app.myfamilyrecipekeeper.com/api/webhooks/stripe`
   - Events: Select these:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Copy the **Signing secret**
4. Update `STRIPE_WEBHOOK_SECRET` in Netlify environment variables
5. Redeploy

## Troubleshooting

### Build Fails
- Check build logs for specific error
- Verify all environment variables are set
- Make sure you're using the `main` branch

### App Loads but Features Don't Work
- Check browser console for errors
- Verify environment variables are correct
- Check Netlify function logs: **Deploys** → Latest deploy → **Functions**

### Supabase Connection Errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project
- Check that both anon key and service role key are correct
- Ensure Supabase project is not paused

### Stripe Errors
- Make sure you're using the correct keys (test vs. live)
- Verify webhook secret matches your endpoint
- Check that webhook URL is correct

## Quick Reference

**Your Netlify Dashboard**: https://app.netlify.com
**Your GitHub Repo**: https://github.com/klatt42/recipe-keeper-app
**Deployment Guide**: See NETLIFY_DEPLOYMENT_GUIDE.md on your Desktop

## What's Next?

After successful deployment:
1. ✅ App is live at temporary Netlify URL
2. ⏭️ Test all features thoroughly
3. ⏭️ Configure custom domain `app.myfamilyrecipekeeper.com`
4. ⏭️ Update Stripe webhook to production URL
5. ⏭️ Test subscription flow end-to-end
6. ⏭️ Monitor for any errors in Sentry

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Next.js on Netlify**: https://docs.netlify.com/frameworks/next-js/
- **Questions?**: Check build logs first, then environment variables
