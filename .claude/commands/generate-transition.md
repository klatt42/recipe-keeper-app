# Generate Thread Transition

Create comprehensive transition document for resuming work in a new Claude Code thread. Enables <2 minute context restoration.

## Purpose

**Thread transitions preserve full context**:
- Summarize current state comprehensively
- Document work completed
- List pending tasks
- Preserve decisions and patterns
- Enable rapid context restoration
- Maintain continuity across sessions

## Usage

```bash
# Generate transition for current session
/generate-transition

# Generate with specific focus
/generate-transition --focus="authentication implementation"

# Generate for specific project
/generate-transition --project="saas-app"
```

## Examples

```bash
# After completing build phase
/generate-transition

# Mid-implementation transition
/generate-transition --focus="in-progress OAuth flow"

# End of day transition
/generate-transition --focus="next session priorities"
```

## Transition Process

### 1. Analyze Current State
- Review conversation history
- Identify completed work
- Note pending tasks
- Capture key decisions
- Document active patterns

### 2. Generate Transition Document
- Comprehensive state summary
- File modification list
- Dependency changes
- Next session starter prompt

### 3. Save and Prepare
- Save transition document
- Create quick reference
- Prepare new thread prompt

## Output Format

```markdown
# Thread Transition: [Project Name]

## Metadata
- **Session End**: [Timestamp]
- **Duration**: [Session length]
- **Phase**: Scout / Plan / Build
- **Status**: In Progress / Complete / Blocked

## Executive Summary
[2-3 sentence overview of what was accomplished and current state]

## Work Completed This Session

### Phase: [Scout/Plan/Build]
**Status**: ✅ Complete / 🔄 In Progress / ⏸️ Paused

#### Accomplishments
1. **[Task]**: [Description]
   - Files: `path/to/file.ts`
   - Result: [Outcome]

2. **[Task]**: [Description]
   - Files: `path/to/file.ts`
   - Result: [Outcome]

#### Files Modified
- `path/to/file.ts`: [Changes]
- `path/to/file.ts`: [Changes]
- `path/to/file.ts`: [Changes]

#### Tests Added/Modified
- `path/to/test.ts`: [Test description]
- `path/to/test.ts`: [Test description]

#### Commits Made
```bash
abc1234 feat: Phase 1 - core implementation
def5678 feat: Phase 2 - integration
ghi9012 test: comprehensive test coverage
```

## Current State Analysis

### What's Working ✅
- [Feature/component]: [Status]
- [Feature/component]: [Status]

### What's In Progress 🔄
- [Task]: [Current state]
  - Next: [Next step]
  - Blockers: [If any]

### What's Pending ⏸️
- [Task]: [Why pending]
  - Estimated effort: [Time]
  - Dependencies: [Requirements]

## Key Decisions & Patterns

### Architecture Decisions
1. **[Decision]**
   - Rationale: [Why this approach]
   - Alternatives considered: [Other options]
   - Impact: [Implications]

2. **[Decision]**
   - Rationale: [Why this approach]
   - Alternatives considered: [Other options]
   - Impact: [Implications]

### Genesis Patterns Applied
- **[Pattern Name]**: [How implemented]
- **[Pattern Name]**: [How implemented]

### Deviations from Plan
- **[Deviation]**: [Reason and impact]

## Dependencies & Configuration

### New Dependencies Added
```json
{
  "dependencies": {
    "package-name": "^version"
  }
}
```

### Environment Variables
```bash
# Added this session
NEW_VAR=value  # Purpose
```

### Configuration Changes
- `config/file.ts`: [Changes]

## Testing Status

### Test Coverage
- Unit Tests: 45/45 passing ✅
- Integration Tests: 12/15 passing 🔄
- E2E Tests: Not yet run ⏸️

### Known Issues
1. **[Issue]**: [Description]
   - Impact: [Severity]
   - Fix approach: [Strategy]

## Context for Next Session

### Priority Tasks
1. **[Task]** (High Priority)
   - Why: [Importance]
   - Approach: [How to implement]
   - Files: `path/to/file.ts`

2. **[Task]** (Medium Priority)
   - Why: [Importance]
   - Approach: [How to implement]
   - Files: `path/to/file.ts`

3. **[Task]** (Low Priority)
   - Why: [Importance]
   - Approach: [How to implement]
   - Files: `path/to/file.ts`

### Files to Review First
1. `path/to/file.ts`: [Why important]
2. `path/to/file.ts`: [Why important]

### Context to Load
**Priority 0 (P0)** - Load immediately:
- `path/to/core/file.ts`
- Current plan/scout document

**Priority 1 (P1)** - Load if referenced:
- `path/to/related/file.ts`
- Genesis patterns

**Priority 2 (P2)** - Load if needed:
- `path/to/docs/file.md`

### Reference Documentation
- [Scout Report]: `docs/scout-report-[date].md`
- [Implementation Plan]: `docs/implementation-plan-[date].md`

## Blockers & Questions

### Current Blockers
1. **[Blocker]**
   - Impact: [Severity]
   - Workaround: [If available]
   - Resolution: [How to fix]

### Open Questions
1. **[Question]**: [Context]
   - Options: [Possible approaches]
   - Recommendation: [Preferred approach]

## Next Session Quick Start

### Resume With This Prompt
```
I'm resuming work on [project name] after a context break.

# Current State
[Brief summary of where we are]

# Last Session
We completed [list accomplishments]

# Next Steps
1. [First task]
2. [Second task]

# Context Files
Load these files first:
- path/to/file1.ts
- path/to/file2.ts

# Reference
- Scout Report: docs/scout-report-[date].md
- Plan: docs/implementation-plan-[date].md

Let's start by [next immediate action].
```

### Verification Steps
After resuming, verify:
1. [ ] All files loaded
2. [ ] Current state understood
3. [ ] Next task clear
4. [ ] Dependencies available
5. [ ] Tests running

## Session Metrics

### Time Spent
- Scout: [Duration]
- Plan: [Duration]
- Build: [Duration]
- Testing: [Duration]
- Documentation: [Duration]

### Productivity Metrics
- Tasks completed: [Number]
- Tests written: [Number]
- Files modified: [Number]
- Lines added: [Number]
- Lines deleted: [Number]

## Recommendations

### For Next Session
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

### For Future Work
1. [Long-term consideration]
2. [Long-term consideration]

---

## New Thread Starter Prompt

**Copy this to start new thread**:

```
# Resuming: [Project Name] - [Feature Name]

## Quick Context
I'm continuing work on [feature/project description].

## Last Session Summary
Completed:
- [Major accomplishment 1]
- [Major accomplishment 2]

Current state:
- ✅ [Component] working
- 🔄 [Component] in progress
- ⏸️ [Component] pending

## Next Steps
1. [Immediate next task]
2. [Following task]

## Files to Review
Priority files to load:
- `path/to/file1.ts` - [Why]
- `path/to/file2.ts` - [Why]

## Context Documents
- Scout: `docs/scout-report-[date].md`
- Plan: `docs/plan-[date].md`
- Transition: `docs/transition-[date].md`

## Let's Start
[Specific first action to take]
```

---

## Transition File Location

Saved to: `docs/transitions/transition-[YYYY-MM-DD-HHMM].md`

```bash
# View transition
cat docs/transitions/transition-$(date +%Y-%m-%d-%H%M).md

# List all transitions
ls -la docs/transitions/
```
