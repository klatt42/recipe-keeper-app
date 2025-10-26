# Recipe Keeper App - Quick Start Guide

**Get up and running in 5 minutes**

---

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ (`node -v`)
- ✅ npm 9+ (`npm -v`)
- ✅ Supabase account ([supabase.com](https://supabase.com))
- ✅ Google AI API key ([aistudio.google.com](https://aistudio.google.com/app/apikey))

---

## Option 1: Automated Restart (Recommended)

```bash
cd ~/Developer/projects/recipe-keeper-app
./restart-project.sh
```

The script will:
1. Verify your environment
2. Install dependencies
3. Check database migrations
4. Run a build test
5. Display startup instructions

---

## Option 2: Manual Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Create `.env.local` from the example:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kbksmusflftsakmalgkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GOOGLE_AI_API_KEY=your_google_ai_key_here
```

**Where to find Supabase keys:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/kbksmusflftsakmalgkl/settings/api)
2. Copy "anon/public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

**Where to get Google AI key:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create new API key
3. Copy to `GOOGLE_AI_API_KEY`

### Step 3: Apply Database Migrations
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/kbksmusflftsakmalgkl/sql)
2. Run each migration file in order from `./migrations/`:
   - `001_initial_schema.sql`
   - `002_add_categories.sql`
   - `003_add_recipe_images.sql`
   - `004_add_recipe_books.sql`
   - `005_fix_rls_policies.sql`
   - `006_add_usage_tracking.sql`

### Step 4: Start Development Server
```bash
PORT=3003 npm run dev
```

### Step 5: Open in Browser
```
http://localhost:3003
```

---

## First Time Usage

### 1. Create Account
- Click "Sign Up"
- Enter email and password
- Check email for confirmation link
- Click confirmation link
- Log in

### 2. Create Your First Recipe

#### Option A: Manual Entry
1. Click "Add Recipe"
2. Fill in the form:
   - Title (required)
   - Category
   - Prep time, cook time, servings
   - Ingredients (one per line)
   - Instructions (one per step)
   - Notes, source, rating
3. Upload an image (optional)
4. Click "Save Recipe"

#### Option B: AI Import (Recommended)
1. Click "Import Recipe"
2. Upload a photo of a recipe card or page
   - Supports: JPG, PNG, WEBP, GIF, PDF
   - Can upload front and back of recipe card
3. Wait for AI to extract recipe data (~5 seconds)
4. Review and edit the extracted information
5. Click "Save Recipe"

### 3. Create a Family Cookbook
1. Go to "Cookbooks" section
2. Click "Create Cookbook"
3. Choose "Family Cookbook"
4. Enter name and description
5. Click "Create"
6. Invite family members by email

### 4. Share a Recipe
1. Open any recipe
2. Click "Share" button
3. Copy the public link
4. Send to anyone (no login required for them)

---

## Verify Everything Works

### Test Checklist
- [ ] Can sign up and log in
- [ ] Can create a recipe manually
- [ ] Can import a recipe from an image
- [ ] Can search and filter recipes
- [ ] Can create a family cookbook
- [ ] Can share a recipe publicly
- [ ] Can view usage dashboard
- [ ] Can edit and delete recipes

---

## Common Issues

### "Cannot connect to Supabase"
**Solution:** Check `.env.local` has correct Supabase URL and keys

### "AI import not working"
**Solution:** Verify `GOOGLE_AI_API_KEY` is set in `.env.local`

### "npm install fails"
**Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

### "Port 3003 already in use"
**Solution:** Use a different port: `PORT=3004 npm run dev`

### "Build fails"
**Solution:** Run `npm run lint` to find errors, fix them, then try again

---

## Next Steps

Once you're up and running:

1. **Read the Documentation**
   - `PROJECT_STATUS.md` - Current project status
   - `CONTEXT_RECOVERY.md` - Detailed context for developers
   - `TECH_STACK.md` - Technology stack reference

2. **Explore the Features**
   - Try importing different recipe formats
   - Create multiple cookbooks
   - Invite test users
   - Check the usage dashboard

3. **Customize (Optional)**
   - Update app metadata in `app/layout.tsx`
   - Add custom categories in Supabase
   - Modify color scheme in Tailwind config

4. **Deploy (When Ready)**
   - Review `PROJECT_STATUS.md` deployment checklist
   - Choose hosting platform (Netlify, Vercel, etc.)
   - Set up production environment variables
   - Run production build test

---

## Development Commands

```bash
# Start development server
PORT=3003 npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check TypeScript errors (without building)
npx tsc --noEmit
```

---

## Project Structure Quick Reference

```
recipe-keeper-app/
├── app/                    # Next.js pages (App Router)
│   ├── (auth)/            # Login, signup
│   ├── recipes/           # Recipe management
│   ├── share/[token]/     # Public sharing
│   └── usage/             # Analytics dashboard
├── components/            # React components
├── lib/
│   ├── actions/          # Server actions (backend logic)
│   ├── supabase/         # Database clients
│   └── schemas/          # Validation schemas
├── migrations/           # Database SQL files
├── .env.local           # Environment variables (create this!)
└── package.json         # Dependencies
```

---

## Environment Variables Reference

### Required (Core Features)
```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Public API key
SUPABASE_SERVICE_ROLE_KEY=       # Admin key (server-side only)
GOOGLE_AI_API_KEY=               # For recipe import
```

### Optional (Additional Features)
```env
FAL_KEY=                         # AI image generation
ANTHROPIC_API_KEY=               # Future features
```

---

## Support

### Documentation
- **PROJECT_STATUS.md** - Comprehensive project status
- **CONTEXT_RECOVERY.md** - Developer context guide
- **TECH_STACK.md** - Technical stack reference
- **GEMINI_IMPORT_SETUP.md** - AI import setup details
- **FAMILY_COOKBOOK_IMPLEMENTATION.md** - Sharing features
- **USAGE_DASHBOARD.md** - Analytics dashboard

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google AI Docs](https://ai.google.dev/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Links
- **Supabase Dashboard:** https://supabase.com/dashboard/project/kbksmusflftsakmalgkl
- **Google AI Studio:** https://aistudio.google.com/

---

## Tips for Success

1. **Start Simple**
   - Get the basic features working first
   - Don't worry about optional features initially

2. **Test Incrementally**
   - Test each feature as you set it up
   - Don't wait until everything is configured

3. **Use the AI Import**
   - It's the killer feature
   - Test with different recipe formats
   - Review extracted data carefully

4. **Check the Usage Dashboard**
   - Monitor your API costs
   - Understand usage patterns
   - Track import success rate

5. **Read Error Messages**
   - Most errors have clear solutions
   - Check browser console for details
   - Verify environment variables first

---

**Ready to Start?**

```bash
cd ~/Developer/projects/recipe-keeper-app
./restart-project.sh
```

**Questions?** Check the documentation files or review the code comments.

**Last Updated:** 2025-10-25
