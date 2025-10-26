# Scout Genesis Pattern

Analyze and understand the codebase/requirement before implementing. This is the first phase of the **Scout-Plan-Build** workflow recommended by Anthropic.

## Purpose

**Scout phase is pure exploration** - no coding, just understanding:
- Read relevant files and documentation
- Verify implementation details
- Analyze patterns and dependencies
- Identify potential challenges
- Generate comprehensive analysis report

## Usage

```bash
/scout-genesis-pattern "feature or pattern description"
```

## Examples

```bash
# Scout authentication patterns
/scout-genesis-pattern "OAuth 2.0 authentication with Google and GitHub"

# Scout data architecture
/scout-genesis-pattern "real-time notifications with WebSockets"

# Scout UI component patterns
/scout-genesis-pattern "responsive navigation with dark mode"
```

## Scout Process

### 1. Understand the Request
- Parse feature/pattern description
- Identify scope and requirements
- Determine affected areas

### 2. Explore Codebase
- Read existing implementations
- Check dependencies and integrations
- Review similar patterns
- Analyze test coverage

### 3. Verify Details
- Confirm framework capabilities
- Check library versions
- Review Genesis patterns
- Validate assumptions

### 4. Generate Scout Report
Produce comprehensive analysis including:
- **Current State**: What exists now
- **Requirements**: What's needed
- **Dependencies**: External requirements
- **Patterns**: Genesis-compliant approaches
- **Challenges**: Potential issues
- **Recommendations**: Next steps

## Output Format

```markdown
# Scout Report: [Feature/Pattern Name]

## Executive Summary
[1-2 sentence overview]

## Current State Analysis
### Existing Implementation
- [What's already built]

### Relevant Code Locations
- [File paths and components]

### Dependencies
- [Libraries, APIs, services]

## Requirements Analysis
### Functional Requirements
- [What the feature must do]

### Technical Requirements
- [Performance, scalability, etc.]

### Genesis Compliance
- [Pattern alignment]

## Implementation Insights
### Recommended Patterns
1. [Pattern name]: [Why it fits]
2. [Pattern name]: [Why it fits]

### Potential Challenges
1. [Challenge]: [Impact and mitigation]
2. [Challenge]: [Impact and mitigation]

### Key Dependencies
- [Library/service]: [Purpose]

## Files to Modify/Create
### Modify
- `path/to/file.ts`: [Changes needed]

### Create
- `path/to/new-file.ts`: [Purpose]

## Next Steps
1. [First action]
2. [Second action]
3. [Third action]

## Recommendations
**Proceed to Plan Phase**: Use `/plan-genesis-implementation --from-last-scout`
```

## Best Practices

### ✅ Do
- Read files thoroughly before conclusions
- Use subagents for verification
- Document all findings clearly
- Identify Genesis patterns
- Consider edge cases
- Note testing requirements

### ❌ Don't
- Write any code during scout
- Make assumptions without verification
- Skip dependency checks
- Ignore existing patterns
- Rush to conclusions

## Integration with Plan Phase

Scout report feeds directly into planning:
```bash
# After scout completes
/plan-genesis-implementation --from-last-scout
```

The plan phase will use scout findings to create detailed implementation strategy.

## Think Levels

Use appropriate "think" level based on complexity:
- **Simple features**: Default thinking
- **Medium complexity**: "think hard"
- **Complex systems**: "think harder"
- **Critical architecture**: "ultrathink"

## Scout Checklist

Before completing scout:
- [ ] Read all relevant files
- [ ] Verified dependencies
- [ ] Checked Genesis patterns
- [ ] Identified all affected areas
- [ ] Documented challenges
- [ ] Generated comprehensive report
- [ ] Recommended next steps

## Context Loading

Scout phase should load:
- **P0**: Core architecture files
- **P1**: Related component files
- **P2**: Genesis pattern documentation
- **P3**: Extended context as needed

See [Context Loading Strategy](../docs/CONTEXT_LOADING_STRATEGY.md)

---

**Remember**: Scout is about understanding, not implementing. Take time to explore thoroughly before moving to the plan phase.
