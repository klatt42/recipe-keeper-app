---
description: Search Genesis patterns and documentation
---

# Genesis Pattern Search

Quick access to Genesis patterns and documentation via MCP tools.

## Quick Search

Tell me what you're looking for, and I'll query the Genesis MCP server:

**Examples:**
- "authentication patterns"
- "Supabase setup"
- "landing page hero section"
- "deployment to Netlify"
- "responsive design"
- "error handling"

## Tool Reference

### 1. Search All Patterns
Use `genesis_search_patterns` for broad searches across all documentation.

**Best for:**
- Finding patterns by keyword
- Discovering related patterns
- Exploring available features

**Example queries:**
- "authentication"
- "testing"
- "deployment"
- "accessibility"

### 2. Get Integration Pattern
Use `genesis_get_stack_pattern` for technology-specific setup guides.

**Available integrations:**
- `supabase` - Database, auth, storage
- `ghl` - GoHighLevel CRM integration
- `copilotkit` - AI copilot features
- `netlify` - Deployment and hosting
- `archon` - Project orchestration

**Example:** Get complete Supabase setup instructions

### 3. Get Project Template
Use `genesis_get_project_template` for complete project architecture.

**Available templates:**
- `landing-page` - Marketing site with Genesis Design Studio
- `saas-app` - Full-stack SaaS application

**Example:** Get SaaS app architecture and file structure

## Common Search Patterns

### By Technology
- **Supabase**: Authentication, database, storage, real-time
- **Netlify**: Deployment, environment variables, functions
- **CopilotKit**: AI features, chat interfaces, copilot actions
- **Archon**: Task management, knowledge base, MCP integration

### By Feature
- **Authentication**: User signup, login, OAuth, session management
- **Dashboard**: Layout, navigation, data visualization
- **Forms**: Validation, error handling, submission
- **Payments**: Stripe integration, subscription management
- **Email**: Transactional emails, templates, deliverability

### By Quality Aspect
- **Accessibility**: WCAG 2.1 AA compliance, ARIA labels, keyboard navigation
- **Performance**: Optimization, lazy loading, code splitting
- **Responsive**: Mobile-first, breakpoints, flexible layouts
- **Testing**: Unit tests, integration tests, E2E tests

## Search Strategy

For best results:

1. **Start broad**: Use `genesis_search_patterns` with general terms
2. **Refine**: If results are too broad, add more specific keywords
3. **Get details**: Use `genesis_get_stack_pattern` or `genesis_get_project_template` for complete guides
4. **Cross-reference**: Search for related patterns to ensure comprehensive understanding

## Context Optimization

**Why use MCP search instead of reading docs?**
- 50% reduction in context usage
- Faster pattern discovery
- Automatic relevance filtering
- Programmatic access to all Genesis knowledge

**When to read docs directly:**
- Browsing for inspiration
- Deep-diving into complex topics
- Learning Genesis philosophy

**When to use MCP search:**
- Implementing specific features (Scout phase)
- Looking for integration instructions
- Quick pattern reference
- During active development (Build phase)
