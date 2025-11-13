# Recipe Keeper App - Session Handoff Guide

**Date**: 2025-11-08
**Current Status**: MVP 80-90% complete, dev server running on port **3004** ✅
**Next Steps**: Production prep OR feature enhancements

---

## Quick Context

Recipe Keeper is an AI-powered recipe management app that helps users digitize handwritten family recipes using Google Gemini AI OCR. The app features family cookbook sharing, AI recipe variations, nutrition calculation, and serving size scaling.

**Tech Stack**:
- Next.js 15 + React 19 + TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- Google Gemini 2.0 Flash (recipe import OCR)
- Anthropic Claude Sonnet (recipe variations)
- Tailwind CSS 4

**Current State**:
- ✅ Core features working (recipe CRUD, AI import, family sharing)
- ✅ Clean, well-structured codebase
- ⚠️ Missing production essentials (error monitoring, tests, SEO)
- ⚠️ Some UI/UX polish needed (dark mode, mobile improvements)

---

## Option 1: Production Prep (RECOMMENDED)

**Goal**: Make the app production-ready for soft launch

**What**: Fix critical issues that would prevent safe production deployment

**Duration**: ~3 days (23 hours of work)

### Tasks

#### 1. Add Sentry Error Monitoring (~4 hours)

**Why**: Can't debug production issues without error monitoring

**Steps**:
```bash
# Install Sentry
npm install @sentry/nextjs

# Run Sentry wizard
npx @sentry/wizard@latest -i nextjs
```

**Configuration**:
```typescript
// sentry.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies
    }
    return event
  }
})
```

**Wrap critical functions**:
```typescript
// Example: lib/actions/import-gemini.ts
export async function extractRecipeFromImages(...) {
  try {
    // ... existing code
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'extractRecipeFromImages' },
      extra: { userId: user.id, imageCount: images.length }
    })
    throw error
  }
}
```

**Areas to wrap**:
- `lib/actions/import-gemini.ts` - Recipe import
- `lib/actions/variations.ts` - AI variations
- `lib/actions/recipes.ts` - Recipe CRUD
- `lib/actions/recipe-books.ts` - Cookbook management

#### 2. Configure Resend for Emails (~6 hours)

**Why**: Cookbook invitations currently don't send any notification

**Steps**:
```bash
npm install resend
```

**Create email templates**:
```typescript
// lib/email/templates/cookbook-invite.tsx
import { Html, Button, Text, Section } from '@react-email/components'

export function CookbookInviteEmail(props: {
  cookbookName: string
  inviterName: string
  inviteLink: string
}) {
  return (
    <Html>
      <Section>
        <Text>You're invited!</Text>
        <Text>
          {props.inviterName} has invited you to collaborate on their cookbook
          "{props.cookbookName}".
        </Text>
        <Button href={props.inviteLink}>Accept Invitation</Button>
      </Section>
    </Html>
  )
}
```

**Send emails**:
```typescript
// lib/email/send.ts
import { Resend } from 'resend'
import { CookbookInviteEmail } from './templates/cookbook-invite'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCookbookInvite(params: {
  toEmail: string
  cookbookName: string
  inviterName: string
  inviteLink: string
}) {
  await resend.emails.send({
    from: 'Recipe Keeper <noreply@recipekeeper.com>',
    to: params.toEmail,
    subject: `${params.inviterName} invited you to ${params.cookbookName}`,
    react: CookbookInviteEmail(params)
  })
}
```

**Update invite action**:
```typescript
// lib/actions/recipe-books.ts
export async function inviteMemberToCookbook(...) {
  // ... existing code to add member to database

  // NEW: Send email
  await sendCookbookInvite({
    toEmail: memberEmail,
    cookbookName: cookbook.name,
    inviterName: user.email,
    inviteLink: `${process.env.NEXT_PUBLIC_URL}/cookbooks/${cookbook.id}/accept-invite`
  })
}
```

**Create accept invite page**:
```typescript
// app/cookbooks/[id]/accept-invite/page.tsx
export default async function AcceptInvitePage({ params }) {
  // ... verify token, add user to cookbook
}
```

#### 3. Add Upstash Rate Limiting (~6 hours)

**Why**: Prevent AI API abuse (could cost hundreds of dollars!)

**Steps**:
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Setup**:
```typescript
// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Different limits for different operations
export const recipeImportLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 imports per hour
  analytics: true,
})

export const variationLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 d'), // 10 variations per day
  analytics: true,
})

export const generalAPILimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
})
```

**Apply to actions**:
```typescript
// lib/actions/import-gemini.ts
export async function extractRecipeFromImages(...) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // NEW: Check rate limit
  const { success: withinLimit, reset } = await recipeImportLimit.limit(user.id)
  if (!withinLimit) {
    return {
      success: false,
      error: `Rate limit exceeded. Please try again in ${Math.ceil((reset - Date.now()) / 60000)} minutes.`
    }
  }

  // ... existing code
}
```

**Apply to all AI operations**:
- `extractRecipeFromImages()`
- `extractRecipeFromPDFFile()`
- `generateVariations()`

#### 4. Write Privacy Policy + Terms of Service (~4 hours)

**Why**: Legal requirement for collecting user data

**Steps**:
1. Use a template generator (e.g., Termly, iubenda)
2. Customize for your data practices
3. Create pages in app

**Create pages**:
```typescript
// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-gray">
        {/* ... privacy policy content */}
      </div>
    </div>
  )
}

// app/terms/page.tsx
// Similar structure
```

**Add to signup flow**:
```typescript
// app/(auth)/signup/page.tsx
<form>
  {/* ... existing fields */}
  <label className="flex items-start gap-2">
    <input type="checkbox" required />
    <span className="text-sm">
      I agree to the{' '}
      <Link href="/terms" className="text-blue-600">Terms of Service</Link>
      {' '}and{' '}
      <Link href="/privacy" className="text-blue-600">Privacy Policy</Link>
    </span>
  </label>
</form>
```

#### 5. Set Up Database Backups (~1 hour)

**Why**: Don't lose user data!

**Steps** (in Supabase dashboard):
1. Go to Project Settings → Database → Backups
2. Enable daily backups (7-day retention on free tier)
3. Test restore process
4. Document restore procedure

**Create restore docs**:
```markdown
// docs/RESTORE_DATABASE.md
# Database Restore Procedure

## When to Restore
- Data corruption
- Accidental deletion
- Security breach

## Steps
1. Log into Supabase dashboard
2. Go to Database → Backups
3. Select backup to restore
4. Click "Restore"
5. Verify data integrity
6. Notify users if needed
```

#### 6. Configure Production Domain (~2 hours)

**Why**: Can't launch without a domain!

**Steps**:
1. Buy domain (e.g., Namecheap, Google Domains)
2. Add to Vercel project
3. Configure DNS records
4. Add to Supabase allowed origins
5. Update environment variables

**Update env vars**:
```bash
# .env.production
NEXT_PUBLIC_URL=https://recipekeeper.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# ... other vars
```

**Update Supabase**:
- Add production URL to Authentication → URL Configuration → Site URL
- Add to Authentication → URL Configuration → Redirect URLs

---

## Option 2: Feature Enhancements

**Goal**: Add polish and nice-to-have features

**What**: Dark mode, mobile improvements, toast notifications, etc.

**Duration**: ~1 week (34 hours of work)

### Priority 1: Dark Mode (~4 hours)

**Implementation**:
```bash
npm install next-themes
```

```tsx
// components/theme-toggle.tsx
'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  )
}
```

**Update components** (add dark: classes):
```tsx
// Example: HomeClient.tsx
<nav className="bg-white dark:bg-gray-900 shadow-sm">
  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
    Recipe Keeper
  </h1>
</nav>
```

**Areas to update** (~30 components):
- Navigation
- Recipe cards
- Forms
- Modals
- Buttons

### Priority 2: Mobile Improvements (~6 hours)

**1. Mobile Navigation Menu**:
```tsx
// components/mobile-menu.tsx
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <button onClick={() => setIsOpen(!isOpen)}>
        <Menu className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-16 bg-white shadow-lg">
          <Link href="/usage">API Usage</Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit">Sign out</button>
          </form>
        </div>
      )}
    </div>
  )
}
```

**2. Improve Touch Targets**:
```tsx
// Ensure all buttons are at least 44x44px
<button className="min-h-[44px] min-w-[44px] p-3 ...">
```

**3. Better Mobile Keyboard Handling**:
```tsx
// Prevent zoom on input focus (iOS)
<input className="..." style={{ fontSize: '16px' }} />
```

### Priority 3: Toast Notifications (~2 hours)

**Implementation**:
```bash
npm install sonner
```

```tsx
// app/layout.tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

**Replace alerts**:
```tsx
// Before
alert('Variation saved successfully!')

// After
import { toast } from 'sonner'

toast.success('Variation saved successfully!', {
  description: 'Check your cookbook to see the new recipe.',
  action: {
    label: 'View Recipe',
    onClick: () => router.push(`/recipes/${result.recipeId}`)
  }
})
```

**Find and replace** all `alert()` calls (~10 locations)

### Priority 4: Image Optimization (~8 hours)

**Implementation**:
```bash
npm install sharp
```

```typescript
// lib/services/image-optimization.ts
import sharp from 'sharp'

export async function optimizeRecipeImage(file: File) {
  const buffer = await file.arrayBuffer()

  const sizes = [
    { width: 400, suffix: '-thumb' },
    { width: 800, suffix: '-medium' },
    { width: 1600, suffix: '-large' },
  ]

  const optimized = await Promise.all(
    sizes.map(({ width, suffix }) =>
      sharp(Buffer.from(buffer))
        .resize(width, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer()
    )
  )

  return optimized
}
```

**Update upload component**:
```typescript
// components/recipes/ImageUpload.tsx
async function handleUpload(file: File) {
  const optimized = await optimizeRecipeImage(file)
  const urls = await Promise.all(
    optimized.map((buffer, i) =>
      uploadToSupabase(`recipe-${Date.now()}-${sizes[i].suffix}.webp`, buffer)
    )
  )

  return {
    thumb: urls[0],
    medium: urls[1],
    large: urls[2]
  }
}
```

**Update components to use responsive images**:
```tsx
// Use srcSet for responsive images
<img
  src={recipe.image_url.medium}
  srcSet={`
    ${recipe.image_url.thumb} 400w,
    ${recipe.image_url.medium} 800w,
    ${recipe.image_url.large} 1600w
  `}
  sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1600px"
  alt={recipe.title}
/>
```

### Priority 5: SEO Optimization (~8 hours)

**1. Dynamic Meta Tags**:
```tsx
// app/recipes/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { recipe } = await getRecipe(params.id)

  return {
    title: `${recipe.title} | Recipe Keeper`,
    description: recipe.notes || `${recipe.category} recipe with ${recipe.servings} servings`,
    openGraph: {
      title: recipe.title,
      description: recipe.notes,
      images: [{ url: recipe.image_url, width: 1200, height: 630 }],
    },
  }
}
```

**2. Structured Data (schema.org)**:
```tsx
// Add to recipe detail page
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Recipe',
  name: recipe.title,
  image: recipe.image_url,
  author: { '@type': 'Person', name: recipe.submitter.email },
  datePublished: recipe.created_at,
  prepTime: `PT${recipe.prep_time}M`,
  cookTime: `PT${recipe.cook_time}M`,
  recipeIngredient: recipe.ingredients.split('\n'),
  recipeInstructions: recipe.instructions.split('\n').map(step => ({
    '@type': 'HowToStep',
    text: step
  }))
}

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
```

**3. Sitemap**:
```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getAllPublicRecipes()

  return [
    { url: 'https://recipekeeper.com', changeFrequency: 'daily', priority: 1 },
    { url: 'https://recipekeeper.com/about', changeFrequency: 'monthly', priority: 0.8 },
    ...recipes.map(recipe => ({
      url: `https://recipekeeper.com/recipes/${recipe.id}`,
      lastModified: recipe.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  ]
}
```

**4. robots.txt**:
```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://recipekeeper.com/sitemap.xml',
  }
}
```

### Priority 6: Accessibility Audit (~6 hours)

**1. Add Focus Indicators**:
```tsx
// Update all interactive elements
<button className="... focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

**2. Fix Color Contrast**:
```tsx
// Before: Low contrast
<span className="text-amber-700 bg-amber-100">

// After: Better contrast
<span className="text-amber-900 bg-amber-100">
```

**3. Add Skip Link**:
```tsx
// app/layout.tsx
<body>
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
  >
    Skip to main content
  </a>
  <main id="main-content">{children}</main>
</body>
```

**4. Add Keyboard Shortcuts**:
```tsx
// components/keyboard-shortcuts.tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch(e.key) {
        case 'k': // Search
          e.preventDefault()
          searchInputRef.current?.focus()
          break
        case 'n': // New recipe
          e.preventDefault()
          router.push('/recipes/new')
          break
      }
    }
  }
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

**5. Test with Screen Reader**:
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free)
- Test navigation, forms, error messages

---

## Option 3: Advanced Features

**Goal**: Add creative new features

**What**: Recipe timeline, shopping mode, cook mode, social sharing

**Duration**: ~2 weeks (80 hours of work)

See "Part 8: Creative UI/UX Enhancements" in COMPREHENSIVE_MVP_REVIEW.md for detailed specifications.

**Quick List**:
1. Recipe Timeline View (4 hours)
2. Ingredient Shopping Mode (6 hours)
3. Recipe Story Cards (4 hours)
4. Quick Cook Mode (8 hours)
5. Social Sharing Cards (6 hours)
6. Stripe Payment Integration (12 hours)
7. Advanced Search Filters (12 hours)
8. Unit + E2E Tests (28 hours)

---

## How to Start a New Session

### For Production Prep (Option 1):

```bash
cd ~/projects/recipe-keeper-app
cc

# Then say:
"I want to prepare Recipe Keeper for production launch.

Please read:
- /home/klatt42/projects/recipe-keeper-app/COMPREHENSIVE_MVP_REVIEW.md
- /home/klatt42/projects/recipe-keeper-app/HANDOFF_TO_NEW_SESSION.md

Let's start with Option 1: Production Prep. Follow the 6 tasks in order:
1. Add Sentry error monitoring
2. Configure Resend for emails
3. Add Upstash rate limiting
4. Write privacy policy + ToS
5. Set up database backups
6. Configure production domain

Ready to begin!"
```

### For Feature Enhancements (Option 2):

```bash
cd ~/projects/recipe-keeper-app
cc

# Then say:
"I want to add polish features to Recipe Keeper.

Please read:
- /home/klatt42/projects/recipe-keeper-app/COMPREHENSIVE_MVP_REVIEW.md
- /home/klatt42/projects/recipe-keeper-app/HANDOFF_TO_NEW_SESSION.md

Let's work on Option 2: Feature Enhancements. Priorities:
1. Dark mode support
2. Mobile navigation improvements
3. Toast notifications
4. Image optimization
5. SEO optimization
6. Accessibility audit

Ready to begin!"
```

### For Advanced Features (Option 3):

```bash
cd ~/projects/recipe-keeper-app
cc

# Then say:
"I want to add creative features to Recipe Keeper.

Please read:
- /home/klatt42/projects/recipe-keeper-app/COMPREHENSIVE_MVP_REVIEW.md
- /home/klatt42/projects/recipe-keeper-app/HANDOFF_TO_NEW_SESSION.md

From Option 3, I want to implement:
[Choose 1-3 features from the list]

Let's start with [feature name]. Ready to begin!"
```

---

## Environment Variables Needed

### Current (already configured):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://kbksmusflftsakmalgkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Google AI
GOOGLE_AI_API_KEY=<your-google-ai-key>
```

### Production Prep (Option 1) Additions:
```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=<get-from-sentry>
SENTRY_AUTH_TOKEN=<get-from-sentry>

# Resend
RESEND_API_KEY=<get-from-resend>

# Upstash
UPSTASH_REDIS_REST_URL=<get-from-upstash>
UPSTASH_REDIS_REST_TOKEN=<get-from-upstash>

# Production
NEXT_PUBLIC_URL=https://your-domain.com
```

### Payment Integration (Future):
```bash
# Stripe
STRIPE_SECRET_KEY=<get-from-stripe>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<get-from-stripe>
STRIPE_WEBHOOK_SECRET=<get-from-stripe>
```

---

## Quick Reference

### Dev Server
```bash
cd ~/projects/recipe-keeper-app
npm run dev  # Port 3004 (auto from .env.local)
# OR manually:
# PORT=3004 npm run dev
```

### Database Migrations
```bash
# List migrations
cd ~/projects/recipe-keeper-app
supabase migration list

# Apply migrations
supabase db push
```

### Key Files
- **Comprehensive Review**: `COMPREHENSIVE_MVP_REVIEW.md` (30,000 words)
- **This Handoff**: `HANDOFF_TO_NEW_SESSION.md`
- **Project Status**: `PROJECT_STATUS.md`
- **Context Recovery**: `CONTEXT_RECOVERY.md`

### Important Directories
- `app/` - Next.js pages and API routes
- `components/` - React components
- `lib/actions/` - Server actions (Supabase)
- `lib/ai/` - AI integrations (Gemini, Claude)
- `migrations/` - Database schema

---

## Final Notes

**Current State**: This is a **polished MVP** with excellent AI features and clean code. Choose your path based on your goals:

- **Want to launch soon?** → Option 1 (Production Prep) - 3 days
- **Want more polish?** → Option 2 (Feature Enhancements) - 1 week
- **Want to impress?** → Option 3 (Advanced Features) - 2 weeks

**Recommendation**: Do Option 1 first (production prep), then soft launch, then add features based on user feedback.

**Questions?** All details are in `COMPREHENSIVE_MVP_REVIEW.md` - it's a 30,000-word deep dive into every aspect of the app.

---

**Good luck with the launch!** 🚀

---

**Handoff created**: 2025-11-08
**Created by**: Claude Code (ROK Copilot)
**Project**: Recipe Keeper App
**Status**: Ready for new CC session
