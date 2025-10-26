# Context Recovery Guide - Recipe Keeper App

**Purpose:** Quickly restore full project context for AI assistants or developers
**Project Type:** SaaS Application (Genesis v1.1.0)
**Last Updated:** 2025-10-25

---

## Quick Context Restoration

### TL;DR
Recipe Keeper is a **Next.js 15 + Supabase SaaS app** for managing and digitizing recipes using AI-powered OCR (Gemini 2.0 Flash). Features include recipe CRUD, family cookbook sharing with permissions, public sharing, and API usage analytics. **~80-90% MVP complete**, production-ready core features, ready for pre-launch polish.

### Key Facts at a Glance
- **Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Google Gemini AI
- **Port:** 3003 (dev server)
- **Database:** Supabase PostgreSQL with RLS
- **AI Service:** Gemini 2.0 Flash (~$0.0003/recipe)
- **Status:** MVP complete, needs pre-launch polish
- **Codebase Size:** ~40 files, well-organized Genesis structure

---

## Essential Commands

### Restart Project
```bash
cd ~/Developer/projects/recipe-keeper-app
./restart-project.sh
```

### Manual Commands
```bash
# Install dependencies
npm install

# Start dev server
PORT=3003 npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Database Migrations
```bash
# Apply via Supabase Dashboard SQL Editor
# https://supabase.com/dashboard/project/kbksmusflftsakmalgkl/sql

# Migration files in: ./migrations/
# Apply in order:
# 001_initial_schema.sql
# 002_add_categories.sql
# 003_add_recipe_images.sql
# 004_add_recipe_books.sql
# 005_fix_rls_policies.sql
# 006_add_usage_tracking.sql
```

---

## Project Context Map

### What is Recipe Keeper?
A SaaS application that helps users:
1. Digitize handwritten/printed recipes using AI OCR
2. Organize recipes with categories, tags, ratings
3. Share recipes with family via cookbooks with permissions
4. Track API usage and costs
5. Generate public sharing links

### Why was it built?
- Preserve family recipe heritage
- Eliminate manual recipe transcription
- Enable family recipe collaboration
- Provide cost-effective AI-powered digitization

### How does it work?

#### Core Flow
```
User signs up
  → Creates/imports recipes (AI OCR or manual)
  → Organizes in cookbooks
  → Shares with family members
  → Tracks usage/costs
```

#### AI Import Flow
```
Upload photo/PDF
  → Supabase Storage
  → Gemini 2.0 Flash API (OCR + parse)
  → Structured JSON response
  → User reviews/edits
  → Save to database
  → Track API usage
```

---

## Critical File Locations

### Configuration
```
.env.local              # Environment variables (REQUIRED)
.env.example            # Template for env vars
next.config.ts          # Next.js configuration
tsconfig.json           # TypeScript configuration
tailwind.config.js      # Tailwind CSS config (in postcss.config.mjs)
middleware.ts           # Auth middleware for protected routes
```

### Entry Points
```
app/layout.tsx          # Root layout (needs metadata update)
app/page.tsx            # Home page (protected, recipe list)
app/(auth)/login/       # Login page
app/(auth)/signup/      # Signup page
```

### Core Features
```
app/recipes/new/        # Create recipe form
app/recipes/[id]/       # Recipe detail & edit
app/recipes/import/     # AI-powered import
app/share/[token]/      # Public recipe sharing
app/usage/              # API usage dashboard
```

### Server Actions (Backend Logic)
```
lib/actions/recipes.ts          # Recipe CRUD operations
lib/actions/import-gemini.ts    # AI import with Gemini
lib/actions/recipe-books.ts     # Cookbook management
lib/actions/share.ts            # Public sharing
lib/actions/usage-tracking.ts   # API cost tracking
lib/actions/upload.ts           # Image uploads
```

### Database
```
lib/supabase/client.ts          # Browser client
lib/supabase/server.ts          # Server client
migrations/*.sql                # Database migrations
```

### Services
```
lib/services/gemini.ts          # Google AI integration
lib/services/fal.ts             # FAL.ai image generation (optional)
```

### Schemas & Types
```
lib/schemas/recipe.ts           # Zod validation schemas
lib/types/index.ts              # TypeScript type definitions
```

### Components
```
components/recipes/             # Recipe-specific components
components/cookbooks/           # Cookbook/sharing components
components/usage/               # Usage analytics components
components/home/                # Home page client component
```

---

## Database Schema Quick Reference

### Main Tables
1. **profiles** - User data (extends auth.users)
2. **recipes** - Recipe data with user_id, book_id, submitted_by
3. **categories** - 10 predefined categories
4. **recipe_images** - Additional images for recipes
5. **recipe_books** - Personal & family cookbooks
6. **book_members** - Cookbook sharing (owner/editor/viewer roles)
7. **shared_recipes** - Public sharing tokens
8. **api_usage** - Cost tracking for Gemini/FAL.ai

### Key Relationships
```
users (auth.users)
  ├── profiles (1:1)
  ├── recipes (1:many) via user_id
  ├── recipe_books (1:many) via owner_id
  └── api_usage (1:many) via user_id

recipe_books
  ├── book_members (1:many) - sharing
  └── recipes (1:many) via book_id

recipes
  ├── recipe_images (1:many)
  ├── shared_recipes (1:many)
  └── categories (many:1)
```

### RLS Policies
All tables have Row Level Security enabled:
- Users can only see their own data
- Shared cookbooks: members see based on role
- Public shares: anyone with token can view

---

## Environment Variables

### Required for Core Features
```env
NEXT_PUBLIC_SUPABASE_URL=https://kbksmusflftsakmalgkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase dashboard>
GOOGLE_AI_API_KEY=<get from Google AI Studio>
```

### Optional (For Additional Features)
```env
FAL_KEY=<for AI image generation>
ANTHROPIC_API_KEY=<for future recipe variations>
```

### Where to Get Keys
- **Supabase:** https://supabase.com/dashboard/project/kbksmusflftsakmalgkl/settings/api
- **Google AI:** https://aistudio.google.com/app/apikey
- **FAL.ai:** https://fal.ai/dashboard
- **Anthropic:** https://console.anthropic.com/

---

## Feature Implementation Status

### ✅ Production Ready (Core MVP)
- User authentication (email/password)
- Recipe CRUD (create, read, update, delete)
- AI-powered recipe import (Gemini 2.0 Flash)
- Image upload & management
- Search & filtering
- Category management
- Family cookbooks with permissions
- Public recipe sharing
- API usage dashboard & cost tracking

### 🟡 Partially Implemented
- Recipe variations (schema exists, UI incomplete)
- AI image generation (FAL.ai code exists, optional)
- Print functionality (basic implementation)
- View/cook tracking (fields exist, not actively used)

### ❌ Planned / Not Started
- Recipe export (PDF)
- Batch import
- Email notifications
- Recipe comments
- Meal planning
- Shopping list generation
- Nutritional info
- Multi-language support

---

## Common Development Tasks

### Adding a New Recipe Field
1. Add column to `recipes` table (migration)
2. Update Zod schema in `lib/schemas/recipe.ts`
3. Update TypeScript type in `lib/types/index.ts`
4. Update form in `app/recipes/new/page.tsx`
5. Update detail view in `app/recipes/[id]/page.tsx`
6. Update server action in `lib/actions/recipes.ts`

### Adding a New Category
1. Insert into `categories` table via SQL:
```sql
INSERT INTO categories (name, icon, color) VALUES
('New Category', 'icon-name', '#hexcolor');
```

### Debugging AI Import Issues
1. Check `GOOGLE_AI_API_KEY` in `.env.local`
2. Verify API quota: https://aistudio.google.com/app/apikey
3. Check error logs in browser console
4. Review `lib/actions/import-gemini.ts` for error handling
5. Test with simple image first
6. Check `api_usage` table for logged errors

### Database RLS Issues
1. Verify user is authenticated (check session)
2. Review RLS policies in Supabase dashboard
3. Check that `user_id` matches authenticated user
4. Test query in Supabase SQL editor with `auth.uid()`
5. Review policies in migration files

---

## Known Issues & Gotchas

### 1. Default Metadata (Minor)
**Issue:** Root layout still shows "Create Next App" title
**Location:** app/layout.tsx:9
**Fix:** Update metadata object

### 2. Python Services Directory (Minor)
**Issue:** Legacy DocTR OCR service exists but deprecated
**Location:** python-services/
**Fix:** Can be deleted (Gemini is now used)

### 3. Placeholder API Keys (Optional)
**Issue:** FAL_KEY and ANTHROPIC_API_KEY are placeholders
**Impact:** Optional features won't work
**Fix:** Add real keys if features are needed

### 4. Image Upload Size Limits
**Issue:** Supabase free tier has storage limits
**Workaround:** Compress images before upload or upgrade plan

### 5. Rate Limits (Gemini)
**Issue:** Free tier = 15 req/min, 1,500 req/day
**Impact:** Heavy import usage may hit limits
**Workaround:** Implement queue system or upgrade to paid

---

## Testing Checklist

### Manual Testing Workflow
```
1. Sign up new user → verify email confirmation
2. Create recipe manually → verify all fields save
3. Import recipe from image → verify OCR accuracy
4. Create family cookbook → invite another user
5. Share recipe publicly → verify public access
6. Check usage dashboard → verify cost tracking
7. Edit recipe → verify changes persist
8. Delete recipe → verify soft delete
9. Search/filter recipes → verify results
10. Test on mobile device → verify responsiveness
```

### Test Data
- Sample recipe images in: (add test-images/ directory)
- Test user credentials: (create test users in Supabase Auth)

---

## Deployment Context

### Current State
- **Environment:** Development
- **Hosting:** Local (localhost:3003)
- **Database:** Supabase (production instance)
- **Ready for Deploy:** 80-90% (needs polish)

### Pre-Deployment TODO
- [ ] Update app metadata
- [ ] Remove python-services
- [ ] Add error pages (404, 500)
- [ ] Production env vars
- [ ] Test build: `npm run build`
- [ ] Optimize images
- [ ] Set up monitoring

### Deployment Options
1. **Netlify** (Recommended)
   - Automatic deploys from Git
   - Built-in SSL
   - Environment variables in dashboard
   - Serverless functions support

2. **Vercel**
   - Next.js optimized
   - Easy setup
   - Good DX

3. **Self-hosted**
   - VPS with Node.js
   - Docker container
   - More control, more setup

---

## AI Assistant Instructions

### When Resuming This Project

1. **Read This File First** to restore context quickly

2. **Check Current Status**
   - Read PROJECT_STATUS.md for detailed status
   - Review latest git commits
   - Check open issues/TODOs

3. **Verify Environment**
   - Confirm .env.local exists and has required keys
   - Test: `npm run dev` on port 3003
   - Verify Supabase connection

4. **Understand Current Phase**
   - MVP is ~80-90% complete
   - Focus on polish, not new features
   - Prioritize user experience improvements

5. **Key Constraints**
   - Do NOT add features not in roadmap
   - Do NOT modify database schema without migrations
   - Do NOT change core architecture (Genesis pattern)
   - Do NOT remove existing functionality

6. **Best Practices**
   - Use TypeScript strict mode
   - Follow existing code patterns
   - Add JSDoc comments for complex functions
   - Update documentation when making changes
   - Test before committing

---

## Troubleshooting Guide

### "npm run dev" fails
1. Delete node_modules and package-lock.json
2. Run `npm install`
3. Check Node version (need 18+)

### "Cannot connect to Supabase"
1. Verify .env.local exists
2. Check Supabase project is active
3. Verify API keys are correct
4. Check network connection

### "AI import not working"
1. Check GOOGLE_AI_API_KEY is set
2. Verify API quota not exceeded
3. Test with simple image
4. Check browser console for errors

### "RLS policy violation"
1. Verify user is authenticated
2. Check RLS policies in Supabase
3. Confirm user_id matches auth.uid()

### "Build fails"
1. Run `npm run lint` to find errors
2. Check TypeScript errors: `npx tsc --noEmit`
3. Verify all imports are correct
4. Clear .next directory: `rm -rf .next`

---

## Documentation Map

### Project Docs (Local)
- **SETUP.md** - Initial setup instructions
- **PROJECT_STATUS.md** - Comprehensive status (read this!)
- **CONTEXT_RECOVERY.md** - This file
- **GEMINI_IMPORT_SETUP.md** - AI import setup
- **FAMILY_COOKBOOK_IMPLEMENTATION.md** - Sharing features
- **USAGE_DASHBOARD.md** - Analytics dashboard
- **GENESIS_KERNEL.md** - Architecture reference
- **README.md** - Basic Next.js info

### External Docs
- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Google AI](https://ai.google.dev/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Code Patterns to Follow

### Server Actions
```typescript
'use server'

export async function actionName(data: Schema) {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  // Validate input
  const validated = schema.parse(data)

  // Database operation
  const { data: result, error } = await supabase
    .from('table')
    .insert(validated)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return result
}
```

### Component Pattern
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Component() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Component logic

  return (
    <div className="container mx-auto p-4">
      {/* JSX */}
    </div>
  )
}
```

### Form Pattern (React Hook Form + Zod)
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema } from '@/lib/schemas/...'

export default function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    // Call server action
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

## Quick Reference Links

### Development URLs
- **Local App:** http://localhost:3003
- **Supabase Dashboard:** https://supabase.com/dashboard/project/kbksmusflftsakmalgkl
- **Google AI Studio:** https://aistudio.google.com/

### Important Files
- Environment: `.env.local`
- Config: `next.config.ts`, `tsconfig.json`
- Middleware: `middleware.ts`
- Root Layout: `app/layout.tsx`

### Key Directories
- Routes: `app/`
- Components: `components/`
- Server Logic: `lib/actions/`
- Database: `lib/supabase/`, `migrations/`
- Types: `lib/types/`, `lib/schemas/`

---

**Last Updated:** 2025-10-25
**Next Review:** When resuming project or onboarding new developer
**Maintained By:** Development Team

---

## For AI Assistants: Critical Context

**When you see this project again:**

1. This is a **nearly complete MVP** (~80-90% done)
2. Focus on **polish and refinement**, not major features
3. **Do not break existing functionality**
4. All core features work and are production-ready
5. Main TODOs: metadata update, UI polish, testing
6. **Genesis architecture pattern** - maintain consistency
7. **RLS is critical** - never bypass security

**Your role:**
- Help with debugging
- Improve user experience
- Refine existing features
- Prepare for deployment
- Write tests
- Update documentation

**NOT your role:**
- Add unplanned features
- Change architecture
- Modify database schema without migrations
- Remove functionality

**Remember:** This is a real application with real users (soon). Stability and data integrity are paramount.
