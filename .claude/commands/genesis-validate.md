---
description: Validate implementation against Genesis patterns
---

# Genesis Pattern Validation

Follow these steps to validate the current implementation against Genesis patterns:

## 1. Identify Feature Type

Determine what type of feature or integration you're validating:
- Landing page component (hero, features, pricing, etc.)
- SaaS app feature (auth, dashboard, settings, etc.)
- Technology integration (Supabase, Netlify, CopilotKit, etc.)
- Deployment or architecture pattern

## 2. Query Relevant Genesis Patterns

Use Genesis MCP tools to retrieve the canonical pattern:

For **integrations**, use:
```
genesis_get_stack_pattern with integration: [supabase|ghl|copilotkit|netlify|archon]
```

For **project templates**, use:
```
genesis_get_project_template with type: [landing-page|saas-app]
```

For **specific patterns**, use:
```
genesis_search_patterns with query: "[your feature or pattern name]"
```

## 3. Compare Implementation

Create a validation checklist comparing your implementation against the Genesis pattern:

- [ ] File structure matches Genesis pattern
- [ ] Component architecture follows Genesis standards
- [ ] TypeScript types are properly defined
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] Responsive design implemented (mobile, tablet, desktop)
- [ ] Error handling follows Genesis patterns
- [ ] Testing coverage meets standards

## 4. Document Deviations

If your implementation differs from Genesis patterns:
1. Document the reason for deviation
2. Assess impact on quality and maintainability
3. Consider refactoring to align with patterns

## 5. Quality Score

Assign a Genesis compliance score (1-10):
- **9-10**: Perfect alignment with Genesis patterns
- **7-8**: Minor deviations, core patterns followed
- **5-6**: Significant deviations, needs refactoring
- **1-4**: Does not follow Genesis patterns

**Target**: Minimum 8.0/10 for all implementations

## 6. Report

Provide a brief validation report:
- Feature validated: [name]
- Genesis pattern used: [pattern name]
- Compliance score: [score]/10
- Deviations: [list or "none"]
- Recommended actions: [list or "none"]
