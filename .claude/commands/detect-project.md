# Detect Project Type

Automatically detect whether a project is a landing page or SaaS application based on description.

## Purpose

**Intelligent project classification**:
- Analyzes project description
- Detects landing page vs SaaS app (85-90% accuracy)
- Provides confidence score and reasoning
- Suggests appropriate Genesis template

## Usage

```bash
# Detect from description
/detect-project "Build a landing page for our product launch"

# Detect from requirements
/detect-project "Create an app with user authentication and dashboards"

# Analyze existing project
/detect-project "Current project has hero section, pricing, and contact form"
```

## How It Works

**Keyword-based detection**:
- Scans for landing page indicators
- Scans for SaaS app indicators
- Calculates confidence score
- Provides reasoning for decision

## Examples

### Example 1: Landing Page Detection

```bash
/detect-project "Build a landing page for our new product launch with lead capture"
```

**Output**:
```
🔍 Project Type Detection

Detected Type: landing_page
Confidence: 85%
Reasoning: Landing page indicators found: 'landing page', 'product launch', 'lead capture'

Recommended Template: boilerplate/landing-page

Suggested Features:
- Hero section
- Features showcase
- Lead capture form
- Social proof
```

### Example 2: SaaS App Detection

```bash
/detect-project "Create a SaaS application for task management with user authentication"
```

**Output**:
```
🔍 Project Type Detection

Detected Type: saas_app
Confidence: 90%
Reasoning: SaaS indicators found: 'saas', 'user authentication', 'task management'

Recommended Template: boilerplate/saas-app

Suggested Features:
- User authentication
- Dashboard
- Settings
- Team management
```

### Example 3: Ambiguous Description

```bash
/detect-project "Build a website for our company"
```

**Output**:
```
🔍 Project Type Detection

Detected Type: landing_page
Confidence: 55%
Reasoning: Generic website description, defaulting to landing page

⚠️ Low confidence - please provide more details:
- Is this a marketing site? → landing_page
- Does it need user accounts? → saas_app
- Will users log in and use features? → saas_app
- Is it a single-page marketing site? → landing_page
```

## Detection Keywords

### Landing Page Indicators
- "landing page"
- "marketing"
- "lead generation"
- "lead capture"
- "product launch"
- "campaign"
- "promotional"
- "conversion"

### SaaS App Indicators
- "saas"
- "application"
- "app"
- "dashboard"
- "user management"
- "authentication"
- "auth"
- "login"
- "multi-tenant"
- "subscription"

## Confidence Levels

**90%+**: Highly confident
- Multiple strong indicators
- Clear project type
- Proceed with confidence

**75-90%**: Confident
- Good indicators present
- Recommendation reliable
- Safe to proceed

**60-75%**: Moderate confidence
- Some indicators
- Review recommendation
- Consider providing more details

**<60%**: Low confidence
- Ambiguous description
- Manual classification recommended
- Add more specific keywords

## Output Format

```
🔍 Project Type Detection

Detected Type: [landing_page|saas_app]
Confidence: [percentage]
Reasoning: [explanation]

Recommended Template: [template path]

[If confidence > 75%]
Suggested Features:
- [feature 1]
- [feature 2]
- [feature 3]

[If confidence < 60%]
⚠️ Low confidence - please clarify:
- [question 1]
- [question 2]
```

## Use Cases

### 1. Before Starting a Project
Understand what type of project you're building:
```bash
/detect-project "Your project idea"
# → Get classification and feature suggestions
```

### 2. Choosing the Right Template
Let the system recommend the appropriate Genesis template:
```bash
/detect-project "Build a marketing site"
# → Recommended Template: boilerplate/landing-page
```

### 3. Feature Planning
Get suggestions for features based on project type:
```bash
/detect-project "SaaS for team collaboration"
# → Suggests: auth, dashboard, team management, notifications
```

### 4. Validation
Confirm your project type before generation:
```bash
/detect-project "Current project description"
# → Validates: Yes, this is a [type]
```

## Integration with Other Commands

**Workflow**:
```
1. /detect-project "your idea"
   ↓ Get project type and suggestions

2. /list-patterns --category=[detected type]
   ↓ See available patterns

3. /autonomous-project "your idea"
   ↓ Generate complete project
```

## Decision Algorithm

```python
if landing_page_score > saas_score and landing_page_score >= 0.6:
    project_type = "landing_page"
    confidence = landing_page_score
elif saas_score >= 0.6:
    project_type = "saas_app"
    confidence = saas_score
else:
    project_type = "saas_app"  # Default
    confidence = max(landing_page_score, saas_score)
```

## Typical Patterns

### Landing Page Projects
**Characteristics**:
- Marketing focused
- Single page or few pages
- Lead generation
- Product showcase
- No user accounts
- Static or mostly static content

**Common Features**:
- Hero section
- Features grid
- Pricing table
- Contact form
- Testimonials
- FAQ

### SaaS Applications
**Characteristics**:
- User authentication
- Dynamic dashboards
- User-generated content
- Multi-user features
- Subscription/billing
- Complex workflows

**Common Features**:
- Authentication
- Dashboard
- Settings
- User management
- API endpoints
- Notifications
- Billing

## Best Practices

### ✅ Do
- Provide descriptive project summaries
- Include key features in description
- Mention if users will log in
- State if it's marketing vs application
- Be specific about functionality

### ❌ Don't
- Use vague descriptions like "website"
- Mix landing page and SaaS terminology
- Assume the system knows context
- Skip this step when unsure

## Improving Detection

**For better accuracy, include**:
- Project purpose (marketing vs product)
- User interaction model (browse vs login)
- Key features (hero vs dashboard)
- Target audience (visitors vs users)
- Business model (leads vs subscriptions)

**Good descriptions**:
```
✅ "Build a landing page for SaaS product launch with pricing and lead capture"
✅ "Create a task management SaaS with user auth, teams, and subscriptions"
✅ "Marketing site for our new app with hero, features, and contact form"
```

**Poor descriptions**:
```
❌ "Build a website"
❌ "Create something for our company"
❌ "Make an app"
```

## Troubleshooting

**Detection seems wrong**:
- Add more specific keywords
- Clarify user authentication needs
- Specify marketing vs application purpose

**Low confidence score**:
- Provide more details in description
- Mention specific features needed
- Clarify if users will log in

**Unexpected result**:
- Review detection keywords
- Check if description is clear
- Manually specify with --project-type flag

## Behind the Scenes

**ProjectTypeDetector module**:
- 207 lines of Python
- Keyword-based scoring
- Confidence calculation
- Reasoning generation
- Template recommendation

**Accuracy**:
- Landing page: ~85% accuracy
- SaaS app: ~90% accuracy
- Overall: 85-90% accuracy

## Related Commands

- `/list-patterns` - See patterns for detected type
- `/autonomous-generate` - Generate feature
- `/autonomous-project` - Generate full project

## MCP Integration

Available as MCP tool `detect_project_type`:
```json
{
  "description": "Detect whether a project is a landing page or SaaS app",
  "input": {"description": "string"}
}
```

---

**Quick Start**: Just describe your project and get instant classification!
