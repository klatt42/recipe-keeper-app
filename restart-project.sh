#!/bin/bash

###############################################################################
# Recipe Keeper App - Genesis v1.1.0 Restart Workflow Script
# Project Type: SaaS Application
# Created: 2025-10-25
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Recipe Keeper App - Project Restart${NC}"
echo -e "${BLUE}Genesis v1.1.0 SaaS Application${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Store the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

###############################################################################
# PHASE 1: Environment Verification
###############################################################################

echo -e "${YELLOW}[PHASE 1]${NC} Environment Verification"
echo "-------------------------------------------"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "  Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version too old (found v$NODE_VERSION, need v18+)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check for .env.local
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ .env.local not found${NC}"
    echo "  Please create .env.local from .env.example and configure:"
    echo "    - NEXT_PUBLIC_SUPABASE_URL"
    echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "    - SUPABASE_SERVICE_ROLE_KEY"
    echo "    - GOOGLE_AI_API_KEY (required for recipe import)"
    echo "    - FAL_KEY (optional, for AI image generation)"
    echo "    - ANTHROPIC_API_KEY (optional, for future features)"
    exit 1
fi
echo -e "${GREEN}✓ .env.local found${NC}"

# Verify required environment variables
source .env.local
REQUIRED_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "GOOGLE_AI_API_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}✗ Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "    - $var"
    done
    exit 1
fi
echo -e "${GREEN}✓ Required environment variables configured${NC}"

echo ""

###############################################################################
# PHASE 2: Dependency Installation
###############################################################################

echo -e "${YELLOW}[PHASE 2]${NC} Dependency Installation"
echo "-------------------------------------------"

if [ -d "node_modules" ]; then
    echo "Existing node_modules found. Reinstalling dependencies..."
    rm -rf node_modules package-lock.json
fi

echo "Installing npm dependencies..."
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

###############################################################################
# PHASE 3: Database Verification
###############################################################################

echo -e "${YELLOW}[PHASE 3]${NC} Database Verification"
echo "-------------------------------------------"

echo "Database migrations located in: ./migrations/"
echo ""
echo "Migration files:"
ls -1 migrations/*.sql 2>/dev/null || echo "No migration files found"
echo ""
echo -e "${BLUE}NOTE:${NC} Migrations should be applied via Supabase Dashboard:"
echo "  1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
echo "  2. Apply migrations in order (if not already applied):"
echo "     - 001_initial_schema.sql"
echo "     - 002_add_categories.sql"
echo "     - 003_add_recipe_images.sql"
echo "     - 004_add_recipe_books.sql"
echo "     - 005_fix_rls_policies.sql"
echo "     - 006_add_usage_tracking.sql"
echo "     - (any additional migrations)"
echo ""

read -p "Have all database migrations been applied? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠ Please apply migrations before continuing${NC}"
    echo "  Then re-run this script"
    exit 1
fi

echo -e "${GREEN}✓ Database migrations confirmed${NC}"
echo ""

###############################################################################
# PHASE 4: Build Verification
###############################################################################

echo -e "${YELLOW}[PHASE 4]${NC} Build Verification"
echo "-------------------------------------------"

echo "Cleaning previous build..."
rm -rf .next

echo "Running build test..."
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "  Please fix build errors before continuing"
    exit 1
fi

echo ""

###############################################################################
# PHASE 5: Project Status Summary
###############################################################################

echo -e "${YELLOW}[PHASE 5]${NC} Project Status Summary"
echo "-------------------------------------------"

if [ -f "PROJECT_STATUS.md" ]; then
    echo "Project status documentation available at:"
    echo "  → PROJECT_STATUS.md"
else
    echo -e "${YELLOW}⚠ PROJECT_STATUS.md not found${NC}"
fi

echo ""

###############################################################################
# PHASE 6: Startup Instructions
###############################################################################

echo -e "${YELLOW}[PHASE 6]${NC} Startup Instructions"
echo "-------------------------------------------"
echo ""
echo -e "${GREEN}✓ Recipe Keeper App is ready!${NC}"
echo ""
echo "To start development server:"
echo -e "  ${BLUE}PORT=3003 npm run dev${NC}"
echo ""
echo "Then open:"
echo -e "  ${BLUE}http://localhost:3003${NC}"
echo ""
echo "Key Features Available:"
echo "  • User Authentication (Email/Password)"
echo "  • Recipe CRUD Operations"
echo "  • AI-Powered Recipe Import (Gemini 2.0 Flash)"
echo "  • Family Cookbook Sharing"
echo "  • Public Recipe Sharing"
echo "  • API Usage Dashboard"
echo "  • Image Management"
echo ""
echo "Documentation:"
echo "  • SETUP.md - Initial setup guide"
echo "  • GEMINI_IMPORT_SETUP.md - AI import configuration"
echo "  • FAMILY_COOKBOOK_IMPLEMENTATION.md - Sharing features"
echo "  • USAGE_DASHBOARD.md - Analytics dashboard"
echo "  • PROJECT_STATUS.md - Current status & roadmap"
echo ""
echo "Supabase Project:"
echo "  • URL: ${NEXT_PUBLIC_SUPABASE_URL}"
echo "  • Dashboard: https://supabase.com/dashboard"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Project restart complete!${NC}"
echo -e "${BLUE}========================================${NC}"
