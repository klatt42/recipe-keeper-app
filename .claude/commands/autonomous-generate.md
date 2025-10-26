# Autonomous Generate

Generate production-ready code using Genesis autonomous agents and pattern matching.

## Purpose

**Automatically generate complete features** from natural language descriptions:
- Detect appropriate Genesis pattern
- Generate production-ready React/TypeScript code
- Create all necessary files (components, APIs, configs)
- Follow Genesis design patterns and best practices

## Usage

```bash
# Generate from feature description
/autonomous-generate "hero section with CTA buttons"

# Generate with specific pattern
/autonomous-generate "authentication system" --pattern=saas_authentication

# Generate to specific directory
/autonomous-generate "contact form" --output=./src

# Dry run (see what would be generated)
/autonomous-generate "pricing table" --dry-run
```

## How It Works

1. **Pattern Detection**: Analyzes your description to find the best Genesis pattern
2. **Code Generation**: Creates production-ready code from the pattern template
3. **File Writing**: Writes files to your project directory
4. **Validation**: Checks code quality and completeness

## Examples

### Example 1: Landing Page Hero Section

```bash
/autonomous-generate "hero section with headline, description, and two CTA buttons"
```

**Result**:
- File: `components/Hero.tsx` (160 lines)
- Gradient background, responsive design
- Tailwind CSS styling
- Production-ready React component

### Example 2: Authentication System

```bash
/autonomous-generate "user authentication with login and signup"
```

**Result**:
- Files:
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/signup/page.tsx`
  - `lib/auth/config.ts` (NextAuth.js)
  - `middleware.ts` (route protection)
- Total: 600+ lines of production code

### Example 3: Contact Form

```bash
/autonomous-generate "contact form with email integration"
```

**Result**:
- Files:
  - `components/ContactForm.tsx`
  - `app/api/contact/route.ts`
- Form validation, loading states, API endpoint

## Options

**--pattern**: Specify pattern ID explicitly
```bash
/autonomous-generate "hero" --pattern=lp_hero_section
```

**--output**: Set output directory
```bash
/autonomous-generate "dashboard" --output=./app/dashboard
```

**--dry-run**: Preview without writing files
```bash
/autonomous-generate "billing" --dry-run
```

**--project-type**: Force project type (landing_page or saas_app)
```bash
/autonomous-generate "settings page" --project-type=saas_app
```

## Available Patterns

### Landing Page Patterns (6)
- **Hero Section** - Header with headline and CTAs (15 min)
- **Features Showcase** - Feature grid with icons (20 min)
- **Contact Form** - Lead capture with validation (30 min)
- **Social Proof** - Testimonials grid (15 min)
- **Pricing Table** - Pricing tiers (20 min)
- **FAQ Section** - Collapsible Q&A (15 min)

### SaaS App Patterns (7)
- **Authentication** - Login/signup with NextAuth.js (45 min)
- **Dashboard** - Stats and activity feed (30 min)
- **Settings** - User profile and preferences (25 min)
- **Team Management** - Members and invitations (40 min)
- **API Routes** - RESTful CRUD endpoints (35 min)
- **Notifications** - Toast notification system (30 min)
- **Billing** - Stripe subscription integration (50 min)

## Generated Code Quality

All generated code includes:
- ✅ **TypeScript** with proper typing
- ✅ **React hooks** (useState, useContext, useEffect)
- ✅ **Tailwind CSS** responsive design
- ✅ **Accessible** markup (ARIA, semantic HTML)
- ✅ **Error handling** and validation
- ✅ **Loading states** and user feedback
- ✅ **TODO markers** for integration points

## Integration with Existing Code

Generated code is designed to integrate seamlessly:
- Uses standard Next.js App Router conventions
- Follows Genesis component structure
- Matches existing design system
- Provides clear integration points

## Pattern Matching Confidence

The system will show confidence in pattern matching:
- **90%+**: Highly confident match
- **75-90%**: Good match
- **60-75%**: Acceptable match (review recommended)
- **<60%**: Low confidence (specify pattern manually)

## Workflow

```
1. Describe feature in natural language
   ↓
2. System detects appropriate pattern (85-95% accuracy)
   ↓
3. Generates production-ready code
   ↓
4. Writes files to your project
   ↓
5. You integrate and customize
```

## After Generation

**Next steps**:
1. Review generated files
2. Install any required dependencies
3. Configure environment variables
4. Customize styling and content
5. Test functionality
6. Integrate with existing code

## Performance

- **Pattern detection**: <100ms
- **Code generation**: <1 second
- **File writing**: <1 second
- **Total time**: Typically <5 seconds

Compare to manual development: 15-50 minutes per pattern

## Best Practices

### ✅ Do
- Provide clear, descriptive feature names
- Review generated code before committing
- Customize templates for your brand
- Test functionality after generation
- Check TODO markers for integration points

### ❌ Don't
- Generate to existing files (will skip)
- Skip dependency installation
- Forget environment variables
- Use without reviewing code
- Expect 100% customization

## Troubleshooting

**"Pattern not found"**:
- Be more specific in description
- Use --pattern flag to specify explicitly
- Run /list-patterns to see available patterns

**"Files skipped"**:
- Generated files already exist
- Delete existing files or use different output directory

**"Import errors"**:
- Install required dependencies
- Check file paths are correct

## Related Commands

- `/list-patterns` - See all available patterns
- `/detect-project` - Detect project type
- `/autonomous-project` - Generate entire project

## Behind the Scenes

Uses Genesis Phase 2 autonomous agents:
1. **PatternMatcher**: Finds best pattern (85-95% confidence)
2. **CodeGenerator**: Creates production code from templates
3. **Validation**: Checks code quality and completeness

## MCP Integration

This command uses the Genesis Agents MCP server if available, falling back to direct Python execution.

---

**Quick Start**: Just describe what you want to build, and let Genesis generate it for you!
