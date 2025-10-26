# Autonomous Project

Generate a complete project with multiple features using Genesis autonomous agents and parallel execution.

## Purpose

**Build entire applications autonomously**:
- Detect project type (landing page vs SaaS app)
- Generate multiple features in parallel
- 2-3x speedup through intelligent coordination
- Complete project in 40-75 minutes (vs 100-205 minutes manually)

## Usage

```bash
# Generate full project from description
/autonomous-project "Build a landing page for product launch with hero, features, and contact form"

# Generate SaaS application
/autonomous-project "Create a task management SaaS with authentication, dashboard, and team features"

# Specify features explicitly
/autonomous-project "SaaS app" --features="auth,dashboard,settings,billing"

# Control parallelization
/autonomous-project "landing page" --features="hero,contact,pricing,faq" --parallel=3
```

## How It Works

1. **Project Analysis**: Detects project type and requirements
2. **Feature Planning**: Matches features to Genesis patterns
3. **Parallel Execution**: Runs multiple GenesisFeatureAgents simultaneously
4. **Code Generation**: Creates all code for all features
5. **Integration**: Ensures components work together

## Architecture

```
CoordinationAgent (orchestrator)
    ↓
GenesisSetupAgent (15 min)
    ↓
GenesisFeatureAgent-1 ──┐
GenesisFeatureAgent-2 ──┼── Parallel execution (2-3x speedup)
GenesisFeatureAgent-3 ──┘
```

## Examples

### Example 1: Landing Page Project

```bash
/autonomous-project "Build a landing page for our product launch"
```

**Detected Features**:
- Hero section
- Features showcase
- Contact form
- Pricing table

**Result**:
- 8 files generated (~1,000 lines)
- Time: ~40 minutes (vs 100 minutes manual)
- 60% faster than baseline

### Example 2: SaaS Application

```bash
/autonomous-project "Create a SaaS app for task management with team collaboration"
```

**Detected Features**:
- User authentication
- Dashboard
- Team management
- Settings
- Notifications

**Result**:
- 12 files generated (~1,400 lines)
- Time: ~75 minutes (vs 205 minutes manual)
- 63% faster than baseline

### Example 3: Minimal Landing Page

```bash
/autonomous-project "Simple landing page" --features="hero,contact"
```

**Result**:
- 3 files generated (~475 lines)
- Time: ~30 minutes
- Focused, minimal implementation

## Options

**--features**: Specify features explicitly (comma-separated)
```bash
/autonomous-project "landing page" --features="hero,features,pricing,faq"
```

**--parallel**: Maximum parallel agents (default: 3)
```bash
/autonomous-project "SaaS app" --features="auth,dashboard,settings,team,billing" --parallel=5
```

**--project-type**: Force project type
```bash
/autonomous-project "app" --project-type=saas_app --features="auth,dashboard"
```

**--output**: Output directory
```bash
/autonomous-project "landing page" --output=./projects/landing-v2
```

## Performance Estimates

### Landing Page (5 features)
- **Setup**: 15 minutes (GenesisSetupAgent)
- **Features**: 30 minutes (3 agents in parallel)
- **Total**: ~40 minutes
- **Baseline**: 100 minutes
- **Speedup**: 2.5x

### SaaS App (7 features)
- **Setup**: 15 minutes
- **Batch 1**: 45 minutes (3 features in parallel)
- **Batch 2**: 40 minutes (3 features in parallel)
- **Batch 3**: 30 minutes (1 feature)
- **Total**: ~75 minutes (optimized scheduling)
- **Baseline**: 205 minutes
- **Speedup**: 2.7x

### Speedup Formula
```
speedup = sequential_time / (setup_time + parallel_batches * max_time_per_batch)
```

## Project Types

### Landing Page
**Typical Features**:
- Hero section (15 min)
- Features showcase (20 min)
- Contact form (30 min)
- Social proof (15 min)
- Pricing table (20 min)
- FAQ section (15 min)

**Total**: ~115 minutes sequential → ~40 minutes parallel

### SaaS Application
**Typical Features**:
- Authentication (45 min)
- Dashboard (30 min)
- Settings (25 min)
- Team management (40 min)
- API routes (35 min)
- Notifications (30 min)
- Billing (50 min)

**Total**: ~255 minutes sequential → ~75 minutes parallel

## Generated Project Structure

### Landing Page
```
project-name/
├── components/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── ContactForm.tsx
│   ├── Pricing.tsx
│   └── FAQ.tsx
├── app/
│   ├── page.tsx
│   └── api/contact/route.ts
└── README.md
```

### SaaS App
```
project-name/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── settings/page.tsx
│   ├── team/page.tsx
│   ├── billing/page.tsx
│   └── api/
│       └── users/route.ts
├── components/
│   └── Notifications.tsx
├── lib/
│   ├── auth/config.ts
│   └── notifications/context.tsx
├── middleware.ts
└── README.md
```

## Parallel Execution

**How it works**:
1. Features are batched by estimated time
2. Up to `max_parallel` agents run simultaneously
3. Coordination agent monitors progress
4. New agents start as others complete

**Example with 5 features and 3 parallel agents**:
```
Time →
0min   Setup [===============] 15min
15min  Agent-1 [======] 30min
       Agent-2 [======] 30min  ← Parallel
       Agent-3 [======] 30min
45min  Agent-1 [====] 20min
       Agent-2 [====] 20min     ← Parallel
65min  Done!

Total: 65 minutes (vs 130 minutes sequential)
Speedup: 2x
```

## Progress Monitoring

During execution, you'll see:
```
🤖 Initializing CoordinationAgent...
✅ CoordinationAgent ready

📋 Project: landing_page
   Features: 5
   Max Parallel: 3

🚀 Setup Phase
   GenesisSetupAgent running...
   ✅ Project initialized (15 minutes)

🔨 Feature Implementation (Batch 1/2)
   Agent-1: hero section [==========] 15min ✅
   Agent-2: features [==========] 20min ✅
   Agent-3: contact form [==========] 30min ✅

🔨 Feature Implementation (Batch 2/2)
   Agent-1: pricing [==========] 20min ✅
   Agent-2: faq [==========] 15min ✅

✅ PROJECT COMPLETE!
   Time: 40 minutes
   Files: 8
   Lines: 1,000
```

## Post-Generation

**Immediate tasks**:
1. ✅ Review generated files
2. ✅ Install dependencies (`npm install`)
3. ✅ Configure environment variables
4. ✅ Customize branding and content
5. ✅ Run development server (`npm run dev`)
6. ✅ Test all features

**Integration tasks**:
- Connect to database (if SaaS app)
- Configure authentication providers
- Set up Stripe (if billing included)
- Add custom business logic
- Style to match brand

## Quality Assurance

All generated code includes:
- ✅ TypeScript with proper typing
- ✅ React best practices
- ✅ Responsive design (Tailwind CSS)
- ✅ Accessible markup
- ✅ Error handling
- ✅ Loading states
- ✅ Validation
- ✅ TODO markers for integrations

## Validation Checkpoints

**After Setup**:
- [ ] Project directory created
- [ ] Git repository initialized
- [ ] README generated

**After Each Feature**:
- [ ] Files created
- [ ] TypeScript compiles
- [ ] No linting errors
- [ ] Pattern compliance verified

**Final Integration**:
- [ ] All features complete
- [ ] Components compatible
- [ ] No file conflicts
- [ ] Project structure clean

## Best Practices

### ✅ Do
- Start with clear project description
- Let system detect features automatically
- Use 3 parallel agents (optimal for most projects)
- Review generated code before deploying
- Complete TODO markers for integrations

### ❌ Don't
- Generate into existing project without backup
- Skip dependency installation
- Forget environment variable setup
- Deploy without testing
- Exceed 5 parallel agents (diminishing returns)

## Troubleshooting

**"Project type detection failed"**:
- Be more explicit: "landing page" or "SaaS app"
- Use --project-type flag

**"Feature not recognized"**:
- Use /list-patterns to see available features
- Be more descriptive in feature names

**"Parallel execution failed"**:
- Reduce --parallel value
- Check system resources

## Performance Tips

1. **Optimal parallelization**: 3 agents (best balance)
2. **Batch similar complexity**: Group features by time estimate
3. **Start with setup**: Always run GenesisSetupAgent first
4. **Monitor progress**: Watch for bottlenecks

## Comparison

| Approach | Landing Page | SaaS App | Speedup |
|----------|-------------|----------|---------|
| **Manual** | 100 min | 205 min | 1.0x |
| **Phase 1** | 80 min | 175 min | 1.2x |
| **Phase 2** | **40 min** | **75 min** | **2.5-2.7x** |

## Related Commands

- `/autonomous-generate` - Generate single feature
- `/detect-project` - Detect project type only
- `/list-patterns` - See available patterns

## Behind the Scenes

**Autonomous agents working together**:
1. **CoordinationAgent**: Orchestrates entire workflow
2. **GenesisSetupAgent**: Initializes project
3. **GenesisFeatureAgent** (multiple): Generate features in parallel

**Technologies**:
- Python asyncio for parallel execution
- Semaphore for concurrency control
- Pattern matching (85-95% confidence)
- Template-based code generation

---

**Quick Start**: Just describe your project idea, and let Genesis build it autonomously!
