# Recipe Keeper App

A modern recipe management application built with Next.js 15, featuring AI-powered recipe generation, shared cookbooks, and meal planning.

## Features

- Recipe management with rich text editing
- AI-powered recipe generation (Google Gemini)
- Shared cookbooks with role-based permissions
- Image upload and processing
- Stripe payment integration
- Email notifications via Resend
- Rate limiting with Upstash Redis
- Error monitoring with Sentry

## Tech Stack

- Next.js 15.5.6 (App Router)
- React 19.1.0
- Supabase (Auth & Database)
- TypeScript
- Tailwind CSS 4
- Server Actions for data mutations

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Supabase account
- Required API keys (see Environment Variables)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd recipe-keeper-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see `.env.example`):
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

See `.env.example` for a complete list of required environment variables. Key services needed:

- **Supabase**: Database and authentication
- **Google AI**: Recipe generation (Gemini API)
- **Anthropic**: Recipe analysis (Claude API)
- **Stripe**: Payment processing
- **Resend**: Email notifications
- **Upstash Redis**: Rate limiting
- **Sentry**: Error monitoring (optional)

## Deployment on Vercel

This app is optimized for deployment on Vercel, which provides native support for Next.js 15 Server Actions.

### Deploy Steps

1. Push your code to GitHub

2. Import your repository in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository
   - Click "Import"

3. Configure environment variables:
   - Add all variables from `.env.example` in the Vercel dashboard
   - Use production values for live deployment
   - For Stripe, use test keys initially

4. Deploy:
   - Click "Deploy"
   - Vercel will automatically detect Next.js and configure build settings

5. Post-deployment:
   - Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to your Vercel domain
   - Configure Stripe webhook endpoint to `https://your-domain.vercel.app/api/stripe/webhook`
   - Test all features thoroughly

### Important Notes

- **Server Actions**: This app uses Next.js Server Actions extensively. These only work correctly on Vercel for Next.js 15+
- **Do not use `netlify dev`**: Netlify's Next.js adapter doesn't support Server Actions in Next.js 15
- **Environment Variables**: All API keys must be configured in Vercel's dashboard before deployment

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
app/              # Next.js App Router pages and layouts
components/       # React components
lib/
  actions/        # Server Actions
  supabase/       # Supabase client configuration
  types/          # TypeScript type definitions
  email/          # Email templates and sending
  ratelimit.ts    # Rate limiting configuration
public/           # Static assets
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment](https://vercel.com/docs)
