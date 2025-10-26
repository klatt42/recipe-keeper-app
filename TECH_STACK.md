# Recipe Keeper App - Technical Stack Reference

**Quick Reference:** Comprehensive tech stack documentation for rapid context recovery
**Last Updated:** 2025-10-25

---

## Technology Stack Overview

### Frontend Framework
```
Next.js 15.5.6
├── React 19.1.0 (UI library)
├── App Router (routing strategy)
├── Turbopack (build tool)
└── Server Components + Client Components
```

### Language & Type Safety
```
TypeScript 5.x
├── Strict mode enabled
├── Type inference
└── Full type coverage
```

### Styling
```
Tailwind CSS 4.x
├── Utility-first CSS
├── JIT compilation
└── Custom configuration in postcss.config.mjs
```

### Form Management
```
React Hook Form 7.65.0
├── @hookform/resolvers 5.2.2
├── Zod 4.1.12 (validation)
└── Type-safe form handling
```

### UI Components
```
Custom Components
├── Lucide React 0.546.0 (icons)
├── react-easy-crop 5.5.3 (image cropping)
├── class-variance-authority 0.7.1 (component variants)
└── clsx 2.1.1 (conditional classes)
```

---

## Backend & Services

### Database & Authentication
```
Supabase
├── PostgreSQL (database)
├── Supabase Auth (authentication)
├── Supabase Storage (file storage)
├── Row Level Security (RLS)
└── Real-time subscriptions (available but not used)

Client Libraries:
├── @supabase/supabase-js 2.75.1
├── @supabase/ssr 0.7.0
└── @supabase/auth-helpers-nextjs 0.10.0
```

### AI Services

#### Google AI (Gemini 2.0 Flash) - Primary
```
@google/generative-ai 0.24.1

Purpose: Recipe OCR + structured parsing
Model: gemini-2.0-flash-exp
Cost: ~$0.0003 per recipe
Rate Limits: 15 req/min, 1,500 req/day (free tier)
```

#### FAL.ai - Optional
```
@fal-ai/serverless-client 0.15.0

Purpose: AI image generation for recipes
Status: Optional (requires FAL_KEY)
```

#### Anthropic Claude - Planned
```
@anthropic-ai/sdk 0.67.0

Purpose: Future recipe variations feature
Status: Planned (requires ANTHROPIC_API_KEY)
```

### File Processing
```
pdf-parse 2.4.3
├── Extract text from PDF uploads
└── Used in recipe import flow
```

### Utilities
```
nanoid 5.1.6
├── Unique ID generation
└── Used for share tokens
```

---

## Development Tools

### Linting
```
ESLint 9
├── @eslint/eslintrc 3.x
├── eslint-config-next 15.5.6
└── Configured in eslint.config.mjs
```

### Build Tools
```
Turbopack (Next.js 15)
├── Faster than Webpack
├── Incremental compilation
└── Built into Next.js
```

### PostCSS & Tailwind
```
@tailwindcss/postcss 4.x
├── tailwindcss 4.x
└── Configured in postcss.config.mjs
```

---

## Package.json Scripts

```json
{
  "dev": "next dev --turbopack",        // Development server with Turbopack
  "build": "next build --turbopack",    // Production build
  "start": "next start",                // Production server
  "lint": "eslint"                      // Run linter
}
```

### Usage
```bash
# Development (runs on port 3000 by default, use PORT=3003 for this project)
PORT=3003 npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## Architecture Patterns

### Next.js App Router Structure
```
app/
├── (auth)/              # Route group (auth pages)
├── api/                 # API routes
├── recipes/             # Recipe pages
├── share/               # Public sharing
├── usage/               # Analytics
├── layout.tsx           # Root layout
└── page.tsx             # Home page

Patterns:
- (group) = Route group (no URL segment)
- [param] = Dynamic route
- api/ = API routes (not used much, prefer server actions)
```

### Server Actions Pattern
```typescript
// lib/actions/*.ts
'use server'

// All backend logic as server actions
// Direct database access
// Type-safe with Zod validation
```

### Component Patterns
```
Client Components ('use client')
├── Interactive UI
├── Forms
├── Client-side state
└── Browser APIs

Server Components (default)
├── Data fetching
├── Direct database access
├── SEO-friendly
└── Better performance
```

---

## Database Technology

### PostgreSQL (via Supabase)
```
Tables: 8 core tables
├── profiles
├── recipes
├── categories
├── recipe_images
├── recipe_books
├── book_members
├── shared_recipes
└── api_usage

Features:
├── Row Level Security (RLS)
├── Triggers (auto-update timestamps)
├── Foreign keys with cascade
├── Indexes for performance
└── Multi-tenant isolation
```

### Supabase Features Used
```
✅ Database (PostgreSQL)
✅ Authentication (Email/Password)
✅ Storage (Recipe images)
✅ Row Level Security
❌ Real-time (available but not used)
❌ Edge Functions (not needed, using Next.js)
```

---

## API Integration Details

### Google Gemini 2.0 Flash
```typescript
// lib/services/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp"
})

// Single API call for OCR + structured extraction
const result = await model.generateContent([
  prompt,
  { inlineData: { data: base64Image, mimeType } }
])
```

**Pricing (as of 2025):**
- Input: $0.00001875 per 1K tokens
- Output: $0.000075 per 1K tokens
- Images: Additional tokens based on resolution
- Average recipe: ~$0.0003

**Rate Limits (Free Tier):**
- 15 requests per minute
- 1,500 requests per day
- 1,000,000 tokens per minute

### Supabase Client Pattern
```typescript
// lib/supabase/server.ts - Server-side
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get, set, remove } }
  )
}

// lib/supabase/client.ts - Client-side
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Environment Variables Reference

### Required Variables
```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://kbksmusflftsakmalgkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google AI (required for recipe import)
GOOGLE_AI_API_KEY=<google-ai-key>
```

### Optional Variables
```env
# FAL.ai (optional - AI image generation)
FAL_KEY=<fal-key>

# Anthropic (optional - future features)
ANTHROPIC_API_KEY=<anthropic-key>
```

### Variable Usage
| Variable | Used In | Purpose |
|----------|---------|---------|
| NEXT_PUBLIC_SUPABASE_URL | Browser & Server | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Browser & Server | Public API key |
| SUPABASE_SERVICE_ROLE_KEY | Server only | Admin operations |
| GOOGLE_AI_API_KEY | Server only | Recipe import OCR |
| FAL_KEY | Server only | AI image generation |
| ANTHROPIC_API_KEY | Server only | Future features |

---

## Build Configuration

### next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kbksmusflftsakmalgkl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Performance Considerations

### Next.js Optimizations
```
✅ Server Components (default)
✅ Image Optimization (next/image)
✅ Font Optimization (next/font)
✅ Turbopack for faster builds
✅ Static Generation where possible
```

### Database Optimizations
```
✅ Indexes on frequently queried columns
✅ RLS for security without application logic
✅ Connection pooling via Supabase
⚠️  Consider pagination for large datasets (not yet implemented)
```

### Bundle Size
```
Current (approximate):
- Next.js runtime: ~90KB
- React: ~40KB
- Tailwind: ~10KB (purged)
- Dependencies: ~200KB
- Total: ~340KB gzipped

Optimization opportunities:
- Dynamic imports for heavy components
- Code splitting for routes
- Image compression
```

---

## Security Stack

### Authentication
```
Supabase Auth
├── Email/password authentication
├── Email confirmation required
├── Session management
└── JWT tokens
```

### Authorization
```
Row Level Security (RLS)
├── All tables protected
├── User-specific data isolation
├── Cookbook sharing via book_members
└── Public sharing via tokens
```

### Data Validation
```
Input Validation
├── Zod schemas (client & server)
├── TypeScript type checking
├── React Hook Form validation
└── Database constraints
```

### Security Headers
```
Next.js defaults (via headers in next.config.ts if configured)
├── X-Frame-Options
├── X-Content-Type-Options
├── Referrer-Policy
└── Content-Security-Policy (recommended to add)
```

---

## Testing Stack (Not Yet Implemented)

### Recommended Testing Tools
```
Unit Testing:
- Vitest (faster Jest alternative)
- @testing-library/react
- @testing-library/jest-dom

E2E Testing:
- Playwright (recommended)
- Cypress (alternative)

Component Testing:
- Storybook (for component library)
```

---

## Monitoring & Analytics (Not Yet Implemented)

### Recommended Tools
```
Error Tracking:
- Sentry (recommended)
- LogRocket (session replay)

Analytics:
- Vercel Analytics (if using Vercel)
- Google Analytics 4
- Plausible (privacy-focused)

Performance:
- Vercel Speed Insights
- Web Vitals
```

---

## Version Requirements

### Minimum Versions
```
Node.js: 18.17.0 or higher
npm: 9.0.0 or higher
TypeScript: 5.0.0 or higher
```

### Recommended Versions
```
Node.js: 20.x LTS
npm: 10.x
TypeScript: 5.x
```

### Check Versions
```bash
node -v    # Should be v18.17.0+
npm -v     # Should be 9.0.0+
npx tsc -v # Should be 5.x
```

---

## Dependency Management

### Package Installation
```bash
# Install all dependencies
npm install

# Install specific package
npm install <package-name>

# Install dev dependency
npm install -D <package-name>

# Update all dependencies
npm update

# Check for outdated packages
npm outdated

# Audit for vulnerabilities
npm audit
```

### Dependency Upgrade Strategy
```
1. Check for breaking changes in release notes
2. Update one major dependency at a time
3. Test thoroughly after each update
4. Update package-lock.json
5. Document any breaking changes
```

---

## Build & Deployment

### Build Process
```bash
# Development build (with Turbopack)
npm run dev

# Production build
npm run build

# Analyze build
npm run build -- --analyze  # (if analyze plugin added)
```

### Build Output
```
.next/
├── cache/              # Build cache
├── server/             # Server-side code
├── static/             # Static assets
└── types/              # Generated types
```

### Deployment Requirements
```
Node.js environment with:
- Node.js 18.17.0+
- npm packages installed
- Environment variables set
- Build completed (.next directory)
```

---

## IDE & Editor Setup

### Recommended VS Code Extensions
```
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Path Intellisense
- Auto Rename Tag
- GitLens
```

### VS Code Settings (Recommended)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## Cost Analysis by Service

### Development Costs (Free Tier)
```
Supabase: $0/month
├── Database: 500MB (free tier)
├── Auth: Unlimited users (free tier)
└── Storage: 1GB (free tier)

Google AI: $0/month
├── 1,500 requests/day (free tier)
└── 1M tokens/month (free tier)

Hosting (Netlify/Vercel): $0/month
├── Free tier sufficient for MVP
└── Automatic SSL, CDN included
```

### Production Costs (Estimated)
```
Per 1,000 users/month:

Supabase: ~$25/month
├── Pro plan: $25/month
├── Includes: 8GB DB, 100GB storage, 50GB bandwidth
└── Scales well for small-medium apps

Google AI: ~$15/month
├── ~50 imports per user/month
├── 50,000 total imports
└── $0.0003 per import

Total: ~$40/month for 1,000 active users
Cost per user: $0.04/month

Monetization break-even: $5/month subscription = 125x margin
```

---

## Migration & Upgrade Paths

### Next.js Upgrades
```
Current: 15.5.6
Upgrade path: 15.x → 16.x (when released)

Breaking changes to watch:
- App Router changes
- Turbopack improvements
- React 19+ requirements
```

### Database Migrations
```
All migrations in: ./migrations/

Migration naming convention:
XXX_description.sql

Apply order:
001 → 002 → 003 → etc.

Rollback strategy:
Manual rollback SQL (create if needed)
```

---

## Quick Tech Decision Reference

### Why Next.js 15?
- App Router (better than Pages Router)
- Server Components (performance)
- Turbopack (faster builds)
- Built-in optimization

### Why Supabase?
- PostgreSQL (robust, scalable)
- Built-in auth & storage
- Row Level Security (security without code)
- Generous free tier

### Why Gemini 2.0 Flash?
- 40x cheaper than Claude
- Single API call (OCR + parsing)
- Good accuracy for recipes
- Generous free tier

### Why Tailwind?
- Utility-first (fast development)
- Small bundle size (with purging)
- Great DX with IntelliSense
- Consistent design system

### Why TypeScript?
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

---

**Last Updated:** 2025-10-25
**Review:** When upgrading major dependencies
**Maintained By:** Development Team
