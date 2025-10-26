# PROJECT GENESIS KERNEL
## Essential Knowledge for Autonomous Development

**Version**: 2.0
**Purpose**: Core knowledge base for Claude Projects using Genesis
**Upload This File**: To every new Claude Project for Genesis-powered development
**Last Updated**: October 17, 2025

---

## WHAT IS PROJECT GENESIS?

Project Genesis is a **fully autonomous development platform** that transforms ideas into production-ready applications using AI agents.

### Core Capability
```bash
genesis build "Your application idea"
# ↓ Autonomous Scout → Plan → Build → Deploy → Monitor
# ↓ Production-ready in hours, not days
# ↓ Self-improving and self-healing
```

### The Promise
- **10-20x productivity gain** for development
- **95% autonomous** from idea to production
- **99.9% uptime** with self-healing
- **Enterprise-ready** (SOC 2, SSO, compliance)

---

## GENESIS AGENT SYSTEM

### The Autonomous Pipeline

**1. Scout Agent** (Requirements Analysis)
- Analyzes project requirements
- Generates Project Requirement Plan (PRP)
- Identifies patterns from library
- Quality target: 8+/10

**2. Planner Agent** (Implementation Strategy)
- Converts PRP → executable task graph
- Identifies dependencies
- Optimizes execution order
- Assigns to specialized agents

**3. Builder Agents** (Code Generation)
- **Frontend Specialist**: React/Next.js, UI/UX
- **Backend Specialist**: APIs, databases, business logic
- **DevOps Specialist**: Infrastructure, deployment
- **Security Specialist**: Auth, compliance, security
- **UI/UX Specialist**: Design systems, accessibility

**4. Deployment Agent** (Production Delivery)
- Multi-platform: Netlify, Vercel, Railway
- CI/CD generation
- Database migrations
- Health checks and rollback

**5. Monitoring Agents** (Operational Excellence)
- Error tracking (Sentry)
- Analytics (PostHog)
- Performance (Web Vitals)
- Uptime monitoring

**6. Maintenance Agents** (Self-Healing)
- Dependency updates
- Security patching
- Performance optimization
- Auto-healing system

---

## GENESIS TECH STACK

### Required Integrations
- **Supabase**: Database, auth, real-time, storage
- **GitHub**: Version control, CI/CD
- **Netlify/Vercel**: Hosting and deployment

### Optional Integrations
- **GoHighLevel**: CRM and marketing automation
- **CopilotKit**: Advanced AI features
- **Superdesign**: AI-powered design generation
- **Sentry**: Error tracking
- **PostHog**: Product analytics

### Development Tools
- **Claude Code**: AI-powered development commands
- **Archon OS**: Multi-agent coordination
- **MCP Server**: Genesis pattern access

---

## GENESIS COMMAND REFERENCE

### Project Creation
```bash
# Create from Genesis template
gh repo create my-project --template project-genesis --private
cd my-project

# Initialize Genesis
genesis init

# Autonomous build
genesis build "Application description with requirements"
```

### Development Commands
```bash
# Add features
genesis add "Feature description"

# Run quality check
genesis validate

# View project status
genesis status

# Access pattern library
genesis patterns search "authentication"
genesis patterns apply "supabase-auth-flow"
```

### Deployment Commands
```bash
# Deploy to staging
genesis deploy --env staging

# Deploy to production (requires approval)
genesis deploy --env production

# Rollback if needed
genesis rollback --to previous

# Check deployment health
genesis health
```

### Monitoring Commands
```bash
# View logs
genesis logs --tail 100

# Check metrics
genesis metrics

# View errors
genesis errors --last 24h

# Get insights
genesis insights
```

### Portfolio Management
```bash
# List all Genesis projects
genesis projects

# Portfolio insights
genesis insights --portfolio

# Pattern library stats
genesis patterns stats
```

### Marketplace & Plugins
```bash
# Browse marketplace
genesis marketplace search "react components"

# Install marketplace item
genesis marketplace install template-name

# Enable plugin
genesis plugin enable figma-importer
```

---

## GENESIS PATTERNS LIBRARY

Genesis learns and reuses proven patterns. Key pattern categories:

### Authentication Patterns
- **supabase-email-auth**: Email/password with Supabase
- **supabase-oauth**: Social login (Google, GitHub, etc.)
- **sso-enterprise**: SAML/OAuth for enterprise
- **magic-link-auth**: Passwordless authentication

### Database Patterns
- **supabase-rls**: Row Level Security policies
- **multi-tenant-schema**: Organization-based isolation
- **audit-log-table**: Compliance-ready audit trails
- **soft-delete**: Safe data deletion

### API Patterns
- **rest-api-supabase**: RESTful endpoints with Supabase
- **graphql-hasura**: GraphQL with Supabase + Hasura
- **api-rate-limiting**: Request throttling
- **webhook-handler**: Incoming webhook processing

### UI Patterns
- **landing-page-hero**: High-conversion hero sections
- **dashboard-layout**: SaaS dashboard structure
- **form-validation**: Client + server validation
- **loading-states**: Skeleton screens and spinners

### Payment Patterns
- **stripe-checkout**: One-time payments
- **stripe-subscriptions**: Recurring billing
- **usage-based-billing**: Metered pricing

### Deployment Patterns
- **netlify-deployment**: Continuous deployment to Netlify
- **vercel-deployment**: Deployment to Vercel
- **docker-compose**: Self-hosted with Docker
- **kubernetes-deploy**: Production Kubernetes

---

## GENESIS PROJECT TYPES

### Landing Page Projects
**Use When**: Lead generation, marketing sites, product launches

**Features**:
- High-conversion design patterns
- Lead capture and CRM sync
- Form validation and submission
- Analytics and tracking
- Fast page load (Lighthouse 90+)

**Command**:
```bash
genesis build "Landing page for [product/service]:
- Hero section with CTA
- Features/benefits
- Social proof (testimonials)
- Lead capture form
- FAQ section
- Contact information"
```

**Genesis Will**:
- Use proven landing page patterns
- Apply conversion optimization
- Set up Supabase lead capture
- Configure GHL sync (if enabled)
- Deploy with performance optimization

### SaaS Application Projects
**Use When**: Multi-user applications, subscription products

**Features**:
- Multi-tenant architecture
- User authentication and roles
- Organization/team management
- Subscription billing (Stripe)
- Admin dashboards
- API endpoints

**Command**:
```bash
genesis build "SaaS application for [purpose]:
- User authentication (email/social)
- Organization workspace
- [Core features]
- User roles and permissions
- Subscription plans
- Admin panel"
```

**Genesis Will**:
- Use multi-tenant patterns
- Implement Supabase RLS
- Set up Stripe integration
- Create role-based access
- Generate API documentation

### Internal Tools
**Use When**: Company internal applications, admin tools

**Features**:
- SSO integration (enterprise)
- Audit logging
- Role-based access control
- Data management interfaces
- Reporting and analytics

**Command**:
```bash
genesis build "Internal tool for [purpose]:
- SSO authentication (Okta/Azure AD)
- Role-based access
- [Core functionality]
- Audit trail
- Reporting dashboard"
```

**Genesis Will**:
- Configure SSO provider
- Enable audit logging
- Implement RBAC
- Create compliance reports
- Set up enterprise monitoring

---

## GENESIS QUALITY STANDARDS

Every Genesis output must meet these standards:

### Code Quality (8+/10)
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier formatted
- ✅ No console errors
- ✅ Proper error handling
- ✅ Type safety throughout

### Performance
- ✅ Lighthouse score 90+ (landing pages)
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3s
- ✅ Optimized images and assets

### Security
- ✅ Supabase RLS policies active
- ✅ Input validation (client + server)
- ✅ HTTPS only
- ✅ Environment variables secured
- ✅ No hardcoded secrets

### Accessibility
- ✅ WCAG 2.1 AA compliance
- ✅ Semantic HTML
- ✅ Keyboard navigation
- ✅ Screen reader compatible
- ✅ Color contrast 4.5:1+

### Testing
- ✅ Unit tests for critical logic
- ✅ Integration tests for APIs
- ✅ E2E tests for key flows
- ✅ Error boundary coverage

---

## WORKING WITH GENESIS IN CLAUDE PROJECTS

### Initial Project Setup

**1. Create Claude Project**
- Name: "[Project Name] - Genesis"
- Upload: This Genesis Kernel file
- Optional: Upload any PRDs or design docs

**2. Set Custom Instructions**
```
This is a Genesis-powered project using autonomous development.

Project Type: [Landing Page / SaaS App / Internal Tool]
Stack: Genesis (Next.js + Supabase + Netlify)

Guidelines:
1. Reference Genesis patterns first
2. Use genesis CLI commands
3. Maintain 8+/10 quality standard
4. Follow Genesis architecture
5. Document new patterns for library

When I request features, use Genesis autonomous build process:
- Scout: Analyze requirements
- Plan: Create task graph
- Build: Generate code with specialized agents
- Validate: Ensure 8+/10 quality
- Deploy: Production-ready output
```

**3. Initialize Repository**
```bash
gh repo create [project-name] --template project-genesis --private
cd [project-name]
genesis init
```

### Development Workflow

**Phase 1: Requirements**
- Describe what you want to build
- Be specific about features and user flows
- Mention any design preferences
- Identify key integrations needed

**Phase 2: Genesis Scout**
- Genesis analyzes requirements
- Generates Project Requirement Plan (PRP)
- Identifies relevant patterns
- Creates feature breakdown

**Phase 3: Implementation**
- Genesis builds autonomously
- Specialized agents work in parallel
- Quality validation at each step
- Pattern learning continuous

**Phase 4: Review & Refine**
- Review generated code
- Request refinements if needed
- Genesis learns from feedback
- Patterns updated

**Phase 5: Deployment**
- Genesis deploys to staging
- Run final checks
- Deploy to production
- Monitoring activated

### Best Practices

**Be Specific**:
❌ "Build a todo app"
✅ "Build a team todo app with:
- User auth (email + Google OAuth)
- Shared team workspaces
- Real-time collaboration
- Task assignments and due dates
- Email notifications
- Mobile responsive"

**Reference Patterns**:
```
"Use the Genesis multi-tenant pattern for organization isolation"
"Apply the Stripe subscription pattern with 3 pricing tiers"
"Follow the landing page conversion optimization pattern"
```

**Leverage Agents**:
```
"Have the Frontend Specialist focus on user experience"
"Security Specialist should ensure OWASP compliance"
"DevOps Specialist set up blue-green deployment"
```

**Iterate Quickly**:
```
genesis build "MVP features only"
# Deploy and test
genesis add "Advanced feature X"
# Incremental improvement
```

---

## GENESIS ECOSYSTEM FEATURES

### Marketplace
Browse and install pre-built components, templates, and patterns.

```bash
# Search marketplace
genesis marketplace search "authentication"

# View item details
genesis marketplace info stripe-checkout-flow

# Install
genesis marketplace install stripe-checkout-flow

# Use in project
# Genesis automatically integrates installed items
```

### Plugins
Extend Genesis with third-party plugins.

**Available Plugins**:
- **Figma Importer**: Convert Figma designs to components
- **AI Code Review**: GPT-4 powered code analysis
- **Analytics Pro**: Advanced insights and predictions

```bash
# Enable plugin
genesis plugin enable figma-importer

# Use in build
genesis build "Landing page - import from Figma: [link]"
```

### White-Label (Agencies)
Deploy Genesis under your brand for clients.

```bash
genesis whitelabel create \
  --name "MyAgency Platform" \
  --domain "dev.myagency.com"
```

---

## ENTERPRISE FEATURES

### SSO Integration
```bash
genesis sso configure \
  --provider okta \
  --domain company.okta.com
```

Supported providers: Okta, Auth0, Azure AD, Google Workspace

### Compliance
```bash
# Enable compliance features
genesis compliance enable --standards "soc2,gdpr,hipaa"

# Generate compliance report
genesis compliance report --type soc2 --period 2024-Q4
```

### Audit Logging
All user actions automatically logged to immutable audit trail.

```bash
# Query audit log
genesis audit query \
  --user john@company.com \
  --action deployment \
  --timerange last-30-days

# Export for audit
genesis audit export --format pdf
```

---

## TROUBLESHOOTING

### Common Issues

**"genesis command not found"**
```bash
npm install -g @project-genesis/cli
```

**"Build failed - quality validation"**
- Genesis enforces 8+/10 quality
- Review validation errors
- Fix issues or adjust requirements
- Genesis will retry automatically

**"Deployment failed"**
```bash
# Check deployment logs
genesis logs --deployment last

# Manual rollback if needed
genesis rollback --to previous

# Genesis auto-rollback enabled by default
```

**"Pattern not found"**
```bash
# Update pattern library
genesis patterns sync

# Search available patterns
genesis patterns search "keyword"

# Request custom pattern
genesis build "... using custom approach for [specific need]"
```

### Getting Help

**In Claude**:
- "Show me Genesis patterns for [feature]"
- "What's the best Genesis approach for [requirement]"
- "Help me troubleshoot [issue]"

**CLI**:
```bash
genesis help
genesis help build
genesis docs [topic]
```

**Community**:
- GitHub Discussions
- Discord community
- Documentation site

---

## GENESIS SUCCESS METRICS

When using Genesis, expect:

### Development Speed
- **Landing Pages**: <1 hour (was 8-12 hours)
- **SaaS MVP**: 1-2 days (was 1-2 months)
- **Internal Tools**: 2-3 days (was 2-4 weeks)

### Code Quality
- **Consistent**: 8+/10 enforced
- **Test Coverage**: >80%
- **Zero Errors**: TypeScript strict mode
- **Security**: Built-in best practices

### Operational Excellence
- **Uptime**: 99.9%+ with self-healing
- **Performance**: Lighthouse 90+
- **Maintenance**: Zero manual work
- **Updates**: Automatic with testing

### Pattern Reuse
- **Cross-Project**: 60% pattern reuse
- **Component Reuse**: 40%
- **Time Savings**: Compounds over time

---

## QUICK START CHECKLIST

For every new Genesis project:

**1. Repository Setup**
```bash
- [ ] Create from Genesis template
- [ ] Clone locally
- [ ] Initialize Genesis (genesis init)
```

**2. Claude Project Setup**
```bash
- [ ] Create Claude Project
- [ ] Upload Genesis Kernel (this file)
- [ ] Upload PRD/requirements (if any)
- [ ] Set custom instructions
```

**3. Service Configuration**
```bash
- [ ] Create Supabase project
- [ ] Add environment variables
- [ ] Configure deployment platform
- [ ] (Optional) Configure integrations (GHL, CopilotKit)
```

**4. Development**
```bash
- [ ] Run genesis build command
- [ ] Review generated code
- [ ] Test locally
- [ ] Iterate as needed
```

**5. Deployment**
```bash
- [ ] Deploy to staging
- [ ] Run final validation
- [ ] Deploy to production
- [ ] Verify monitoring active
```

---

## GENESIS COMMUNICATION PATTERNS

### When Requesting Features

**Effective Communication**:
```
"I need [feature] that does [specific functionality]

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Users: [Who will use this]
Success: [How to measure success]

Use Genesis [pattern name] if available.
Integrate with [service names].
Priority: [Must-have / Nice-to-have]"
```

### When Iterating

**Clear Feedback**:
```
"The [component] works but needs:
1. [Specific change]
2. [Specific improvement]

Keep: [What's working well]
Change: [What needs adjustment]

Quality target: 8+/10 for [specific metric]"
```

### When Troubleshooting

**Detailed Context**:
```
"Issue: [Specific problem]

What I tried:
1. [Action taken]
2. [Result observed]

Expected: [What should happen]
Actual: [What's happening]

Logs: [Error messages]
Environment: [staging/production]

Genesis command used: [command]"
```

---

## KEY REMINDERS

1. **Genesis is Autonomous**: Trust the Scout-Plan-Build process
2. **Quality First**: 8+/10 is enforced, not optional
3. **Pattern-Driven**: Reuse proven patterns whenever possible
4. **Self-Improving**: Genesis learns from every project
5. **Production-Ready**: Every output is deployment-ready
6. **Enterprise-Grade**: Security and compliance built-in
7. **Ecosystem-Powered**: Leverage marketplace and plugins

---

## VERSION HISTORY

**v2.0** (October 2025) - 11-Week Complete Platform
- Full autonomous pipeline (Scout-Plan-Build-Deploy-Monitor)
- Multi-agent specialization
- Self-healing maintenance
- Enterprise features (SSO, compliance, audit)
- Public marketplace and plugin ecosystem
- White-label deployments
- ~46,300 lines of production code

**v1.0** (October 2024) - Template Repository
- Documentation and boilerplate
- Manual development with patterns
- Stack integration guides

---

## SUPPORT

**For Genesis Issues**:
- Check `genesis help [command]`
- Review logs: `genesis logs`
- Search patterns: `genesis patterns search`

**For Claude Assistance**:
- "Show Genesis pattern for [feature]"
- "Best Genesis approach for [requirement]"
- "Help troubleshoot Genesis [issue]"

**For Community Help**:
- GitHub Discussions
- Discord #genesis channel
- Documentation: https://genesis.dev/docs

---

## CONCLUSION

This Genesis Kernel contains everything Claude needs to help you build with Genesis autonomously.

**Remember**:
- Genesis handles the complexity
- You provide the vision
- Together you ship 10-20x faster

**Now go build something amazing.** 🚀

---

**Project Genesis Kernel v2.0**
*Essential knowledge for autonomous development*
*Upload this file to every new Genesis Claude Project*
