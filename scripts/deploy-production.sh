#!/bin/bash

# Recipe Keeper Production Deployment Script
# Automates deployment to Vercel with pre-flight checks

set -e  # Exit on error

echo "========================================="
echo "Recipe Keeper Production Deployment"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Check if Vercel CLI is installed
echo "🔍 Checking prerequisites..."
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not installed!${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓${NC} Vercel CLI installed"

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    git status -s
    echo ""
    read -p "Continue anyway? (y/n): " continue_deploy
    if [ "$continue_deploy" != "y" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Check environment variables
echo ""
echo "🔍 Checking environment variables..."
ENV_MISSING=0

# Required environment variables
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "GOOGLE_AI_API_KEY"
    "ANTHROPIC_API_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  ${var} not set in .env.local${NC}"
        ENV_MISSING=1
    else
        echo -e "${GREEN}✓${NC} ${var}"
    fi
done

# Optional but recommended
OPTIONAL_VARS=(
    "NEXT_PUBLIC_SENTRY_DSN"
    "RESEND_API_KEY"
    "UPSTASH_REDIS_REST_URL"
)

echo ""
echo "Optional (but recommended):"
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️  ${var} not set${NC}"
    else
        echo -e "${GREEN}✓${NC} ${var}"
    fi
done

if [ $ENV_MISSING -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}Some required environment variables are missing.${NC}"
    echo "Make sure to add them in Vercel dashboard after deployment."
    echo ""
fi

# Run build locally to catch errors
echo ""
echo "🏗️  Building project locally..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Local build successful"
else
    echo -e "${RED}❌ Local build failed!${NC}"
    echo "Fix build errors before deploying to production."
    exit 1
fi

# Run tests if they exist
if [ -f "package.json" ] && grep -q "\"test\":" package.json; then
    echo ""
    echo "🧪 Running tests..."
    if npm test; then
        echo -e "${GREEN}✓${NC} Tests passed"
    else
        echo -e "${RED}❌ Tests failed!${NC}"
        read -p "Deploy anyway? (y/n): " deploy_anyway
        if [ "$deploy_anyway" != "y" ]; then
            echo "Deployment cancelled."
            exit 1
        fi
    fi
fi

# Show current deployment status
echo ""
echo "📊 Current deployment status:"
vercel ls recipe-keeper --prod 2>/dev/null | head -5 || echo "No previous deployments found"

echo ""
echo "========================================="
echo "Ready to Deploy to Production"
echo "========================================="
echo ""
echo "This will:"
echo "  1. Build your application"
echo "  2. Deploy to Vercel production"
echo "  3. Make it live at your production URL"
echo ""
read -p "Continue with deployment? (yes/no): " confirm_deploy

if [ "$confirm_deploy" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy to production
echo ""
echo "🚀 Deploying to production..."
if vercel --prod; then
    echo ""
    echo "========================================="
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Test your production site"
    echo "  2. Verify all features work"
    echo "  3. Check Sentry for any errors"
    echo "  4. Monitor rate limits in Upstash"
    echo ""
    echo "Post-deployment checklist:"
    echo "  □ Test user signup/login"
    echo "  □ Test recipe import"
    echo "  □ Test recipe variations"
    echo "  □ Test cookbook sharing"
    echo "  □ Check email delivery"
    echo "  □ Verify rate limiting"
    echo "  □ Check SSL certificate"
    echo "  □ Monitor error logs"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo ""
    echo "Check the error messages above."
    echo "Common issues:"
    echo "  - Missing environment variables in Vercel"
    echo "  - Build errors"
    echo "  - Authentication issues (run: vercel login)"
    echo ""
    exit 1
fi
