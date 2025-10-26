# Plan Genesis Implementation

Create detailed implementation strategy using "think" modes. This is the second phase of the **Scout-Plan-Build** workflow recommended by Anthropic.

## Purpose

**Plan phase creates executable specifications**:
- Use "think" modes for deep analysis
- Generate comprehensive implementation strategy
- Define tasks, tests, and validation criteria
- Create GitHub issues (optional)
- Verify plan reasonableness before building

## Usage

```bash
# Plan from previous scout
/plan-genesis-implementation --from-last-scout

# Plan standalone feature
/plan-genesis-implementation "feature description"

# Plan with specific think level
/plan-genesis-implementation "complex feature" --think-level=ultrathink
```

## Examples

```bash
# Plan from scout report
/plan-genesis-implementation --from-last-scout

# Plan authentication implementation
/plan-genesis-implementation "OAuth 2.0 with refresh tokens and PKCE"

# Plan complex refactor
/plan-genesis-implementation "migrate to TypeScript strict mode" --think-level=think-harder
```

## Think Levels

Choose computational budget based on complexity:

| Level | Use When | Computational Budget |
|-------|----------|---------------------|
| `think` | Simple features | Standard |
| `think hard` | Medium complexity | 2x standard |
| `think harder` | Complex systems | 4x standard |
| `ultrathink` | Critical architecture | 8x standard |

**Default**: `think hard` (recommended for most tasks)

## Plan Process

### 1. Analyze Scout Report (if available)
- Review findings and recommendations
- Validate assumptions
- Confirm scope

### 2. Design Implementation Strategy
- Break down into phases
- Define components and interfaces
- Plan data flow and state management
- Design test strategy

### 3. Create Task Breakdown
- List all implementation tasks
- Estimate complexity and dependencies
- Define acceptance criteria
- Identify testing requirements

### 4. Generate Plan Document
- Comprehensive implementation guide
- Step-by-step tasks
- Code examples and patterns
- Validation checkpoints

## Output Format

```markdown
# Implementation Plan: [Feature Name]

## Plan Metadata
- **Created**: [Timestamp]
- **Based On**: Scout Report / Standalone
- **Think Level**: [Level used]
- **Complexity**: Low / Medium / High / Critical
- **Estimated Time**: [Duration]

## Executive Summary
[2-3 sentence overview of implementation approach]

## Architecture Overview
### Component Structure
[Diagram or description of components]

### Data Flow
[How data moves through the system]

### Integration Points
[How this integrates with existing code]

## Genesis Pattern Compliance
### Patterns Used
1. [Pattern Name]: [How it's applied]
2. [Pattern Name]: [How it's applied]

### Deviations
- [Any necessary deviations with justification]

## Implementation Phases

### Phase 1: [Phase Name]
**Goal**: [What this phase achieves]

**Tasks**:
1. [ ] [Task description]
   - File: `path/to/file.ts`
   - Changes: [Specific changes]
   - Tests: [Test requirements]

2. [ ] [Task description]
   - File: `path/to/file.ts`
   - Changes: [Specific changes]
   - Tests: [Test requirements]

**Validation**: [How to verify phase complete]

### Phase 2: [Phase Name]
[Same structure as Phase 1]

### Phase 3: [Phase Name]
[Same structure as Phase 1]

## Code Examples

### Component Template
```typescript
// Example: Key component structure
[Code example]
```

### Test Template
```typescript
// Example: Test structure
[Test example]
```

## Dependencies

### New Dependencies
- `package-name@version`: [Purpose]
- `package-name@version`: [Purpose]

### Updated Dependencies
- `package-name`: [Current → New version, reason]

### Environment Variables
```bash
# New environment variables needed
NEW_VAR=value  # Purpose
```

## Testing Strategy

### Unit Tests
- [ ] [Component]: [Test cases]
- [ ] [Function]: [Test cases]

### Integration Tests
- [ ] [Feature flow]: [Test scenario]
- [ ] [API integration]: [Test scenario]

### E2E Tests
- [ ] [User flow]: [Test scenario]

## Validation Checkpoints

### Phase 1 Complete When:
- [ ] [Criterion]
- [ ] [Criterion]
- [ ] Tests passing

### Phase 2 Complete When:
- [ ] [Criterion]
- [ ] [Criterion]
- [ ] Integration working

### Phase 3 Complete When:
- [ ] [Criterion]
- [ ] [Criterion]
- [ ] E2E tests passing

## Risk Mitigation

### Identified Risks
1. **[Risk Name]**
   - Impact: [High/Medium/Low]
   - Mitigation: [Strategy]
   - Fallback: [Alternative approach]

2. **[Risk Name]**
   - Impact: [High/Medium/Low]
   - Mitigation: [Strategy]
   - Fallback: [Alternative approach]

## Performance Considerations
- [Performance requirement]: [Strategy]
- [Performance requirement]: [Strategy]

## Security Considerations
- [Security requirement]: [Implementation]
- [Security requirement]: [Implementation]

## Accessibility Considerations
- [A11y requirement]: [Implementation]
- [A11y requirement]: [Implementation]

## Rollback Plan
**If implementation fails**:
1. [Step to revert]
2. [Step to revert]
3. [Step to revert]

## Next Steps
1. Review this plan for completeness
2. Get stakeholder approval (if needed)
3. Proceed to build phase: `/build-genesis-feature --from-last-plan`

## Optional: GitHub Issue
Generate issue with this plan:
- Title: [Feature Name]
- Labels: enhancement, planned
- Assignee: [Developer]
- Body: [This plan markdown]
```

## Best Practices

### ✅ Do
- Use appropriate "think" level
- Break down into manageable phases
- Include concrete code examples
- Define clear validation criteria
- Plan for testing from start
- Consider edge cases and errors
- Include rollback strategy

### ❌ Don't
- Skip think modes for complex features
- Create overly complex phases
- Assume implementation details
- Skip testing strategy
- Ignore performance implications
- Forget accessibility
- Rush plan validation

## Plan Validation

Before proceeding to build:
- [ ] All phases clearly defined
- [ ] Tasks have acceptance criteria
- [ ] Dependencies identified
- [ ] Tests planned
- [ ] Risks mitigated
- [ ] Rollback plan exists
- [ ] Genesis patterns followed

## Integration with Build Phase

Plan document feeds directly into implementation:
```bash
# After plan is validated
/build-genesis-feature --from-last-plan
```

Build phase will follow plan systematically, validating each step.

## Think Mode Prompts

### For Simple Features
```
Using standard thinking, create an implementation plan for [feature]
```

### For Medium Complexity
```
Think hard about the implementation strategy for [feature].
Consider dependencies, testing, and Genesis patterns.
```

### For Complex Systems
```
Think harder about architecting [feature].
Analyze all integration points, performance implications,
and potential failure modes. Provide comprehensive strategy.
```

### For Critical Architecture
```
Use ultrathink to design [critical feature].
This requires deep analysis of system-wide implications,
security considerations, and long-term maintainability.
```

## Context Loading

Plan phase should load:
- **P0**: Scout report (if exists)
- **P0**: Core architecture files
- **P1**: Genesis pattern documentation
- **P1**: Related component files
- **P2**: Test utilities and examples
- **P3**: Extended context as needed

See [Context Loading Strategy](../docs/CONTEXT_LOADING_STRATEGY.md)

---

**Remember**: A thoughtful plan creates specifications that can be executed reliably. The plan IS the prompt for the build phase.
