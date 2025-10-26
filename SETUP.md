# Recipe Keeper - Setup Guide

**Project**: Recipe Keeper - AI-Powered Recipe Management Platform
**Built with**: Next.js 14, TypeScript, Supabase, Tailwind CSS
**Following**: Genesis SaaS Architecture Patterns

---

## 🎯 What's Built So Far

✅ **Foundation Complete** (Phase 1-3 from Launch Plan)
- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS styling
- Supabase SSR integration
- Authentication system (login/signup)
- Protected routes with middleware
- Project structure following Genesis patterns

---

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git installed
- Text editor (VS Code recommended)

---

## 🚀 Quick Start

### 1. Project is Already Created

You're currently in: `/home/klatt42/Developer/projects/recipe-keeper-app`

Dependencies are installed. Project structure is ready.

### 2. Set Up Supabase Project

**A. Create Supabase Project:**
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name**: Recipe Keeper
   - **Database Password**: [Generate strong password - save it!]
   - **Region**: East US (or closest to you)
   - **Pricing Plan**: Free
4. Click "Create new project"
5. Wait ~2 minutes for provisioning

**B. Get API Credentials:**
1. In project dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Another long string (keep secret!)

**C. Update Environment Variables:**
```bash
# Edit .env.local
nano .env.local
```

Replace placeholder values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

Save and exit (Ctrl+X, Y, Enter).

### 3. Deploy Database Schema

**A. Open Supabase SQL Editor:**
1. In project dashboard, go to **SQL Editor**
2. Click **New query**

**B. Run Database Schema:**

Copy and paste this SQL (from your kickoff plan):

```sql
-- ================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ================================

-- Users table exists from Supabase Auth
-- Create profiles extension
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ================================
-- 2. RECIPES TABLE (Core Entity)
-- ================================

CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings TEXT,
  ingredients TEXT NOT NULL,
  instructions TEXT NOT NULL,
  notes TEXT,
  source TEXT,
  image_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_favorite BOOLEAN DEFAULT false,
  parent_recipe_id UUID REFERENCES public.recipes ON DELETE SET NULL,
  variation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_cooked_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  cook_count INTEGER DEFAULT 0
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- ================================
-- 3. CATEGORIES TABLE
-- ================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

-- Seed default categories
INSERT INTO public.categories (name) VALUES
  ('Breakfast'),
  ('Lunch'),
  ('Dinner'),
  ('Dessert'),
  ('Appetizers'),
  ('Beverages'),
  ('Salads'),
  ('Soups'),
  ('Sides'),
  ('Snacks')
ON CONFLICT (name) DO NOTHING;

-- ================================
-- 4. INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON public.recipes(rating) WHERE rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_favorite ON public.recipes(is_favorite) WHERE is_favorite = true;

-- ================================
-- 5. FUNCTIONS FOR AUTO-UPDATING
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** (or Ctrl+Enter)
4. Verify success message: "Success. No rows returned"

**✅ Checkpoint**: Database schema deployed, RLS active

### 4. Start Development Server

```bash
cd ~/Developer/projects/recipe-keeper-app
npm run dev
```

Expected output:
```
▲ Next.js 15.x
- Local: http://localhost:3000
✓ Starting...
✓ Ready in 2s
```

### 5. Test Authentication

1. Open browser: http://localhost:3000
2. You'll be redirected to login
3. Click "create a new account"
4. Sign up with email and password
5. **Check your email** for confirmation link
6. Click confirmation link
7. You'll be redirected back and logged in!

**✅ Checkpoint**: Authentication working, you see welcome page

---

## 📁 Project Structure

```
recipe-keeper-app/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── api/
│   │   └── auth/callback/  # Email confirmation handler
│   └── page.tsx            # Home page (protected)
├── lib/
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Auth middleware
│   ├── schemas/            # Zod validation schemas
│   │   └── recipe.ts       # Recipe schema and types
│   └── utils/              # Utility functions
│       └── cn.ts           # Tailwind class merger
├── components/             # React components (empty for now)
│   ├── ui/                # Base UI components
│   └── recipes/           # Recipe-specific components
├── middleware.ts          # Next.js middleware (auth)
├── .env.local            # Environment variables
└── GENESIS_KERNEL.md     # Genesis patterns reference
```

---

## 🎨 What's Implemented

### Authentication System
- ✅ Email/password signup
- ✅ Email confirmation flow
- ✅ Login with session management
- ✅ Protected routes (middleware)
- ✅ Sign out functionality

### Database Schema
- ✅ Profiles table
- ✅ Recipes table (full schema)
- ✅ Categories table (seeded)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Auto-update triggers

### Infrastructure
- ✅ Next.js 14 App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS
- ✅ Supabase SSR integration
- ✅ Form validation (Zod, React Hook Form)
- ✅ Recipe schema and types

---

## 📋 Next Steps (Week 1-2)

According to your launch plan, Month 1 Week 1-2 focuses on:

### Recipe CRUD Operations
- [ ] Recipe creation form (all fields)
- [ ] Auto-save drafts functionality
- [ ] Recipe list view (grid/list toggle)
- [ ] Recipe detail view
- [ ] Edit recipe form
- [ ] Delete recipe (with confirmation)

**Reference**: Use `/scout-genesis-pattern` command to analyze implementation patterns.

**Recommended Approach**:
```bash
# In Claude Code
/scout-genesis-pattern "recipe CRUD operations with form validation and database integration"
```

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### "Invalid JWT" or Auth Errors
- Check `.env.local` has correct Supabase credentials
- Restart dev server: `Ctrl+C`, then `npm run dev`
- Clear browser cookies and try again

### "Cannot connect to Supabase"
- Verify Supabase project URL is correct
- Check project is not paused (free tier auto-pauses after inactivity)
- Test connection in Supabase dashboard

### Email Confirmation Not Working
- Check email spam/junk folder
- Verify email settings in Supabase dashboard: **Authentication → Email Templates**
- For development, you can disable email confirmation (not recommended):
  - Supabase dashboard → **Authentication → Providers**
  - Toggle "Enable email confirmations" off

### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📚 Genesis Patterns Reference

This project follows Genesis SaaS architecture. Key files:
- `GENESIS_KERNEL.md` - Complete Genesis knowledge
- `.claude/commands/` - Available Genesis slash commands

**Available Commands**:
- `/scout-genesis-pattern` - Analyze feature requirements
- `/plan-genesis-implementation` - Create implementation plan
- `/build-genesis-feature` - Build with validation

---

## 🚀 Deployment (Later)

When ready to deploy (Month 3):
1. Push to GitHub
2. Connect to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

See `docs/DEPLOYMENT_GUIDE.md` in Genesis docs for details.

---

## ✅ Setup Checklist

### Phase 1-3 Complete ✅
- [x] Next.js project created
- [x] Dependencies installed
- [x] Supabase project created
- [x] Database schema deployed
- [x] Environment variables configured
- [x] Development server running
- [x] Authentication tested

### Ready for Development ✅
- [x] Project structure in place
- [x] Genesis patterns available
- [x] Auth system working
- [x] Database ready

### Next Actions (You)
- [ ] Implement Recipe CRUD (Week 1-2)
- [ ] Add categories and filtering (Month 2)
- [ ] Implement sharing (Month 2)
- [ ] Add AI variations (Month 4)

---

**Status**: ✅ Foundation Complete - Ready for Feature Development
**Time Invested**: ~30 minutes (vs 1-2 hours with full Genesis agents)
**Next**: Start Month 1, Week 1-2 (Recipe CRUD Operations)

🎉 **Your Recipe Keeper foundation is ready!**
