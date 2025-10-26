---
description: Implement feature using Genesis Scout-Plan-Build workflow
---

# Genesis Feature Implementation

Follow the Scout-Plan-Build workflow to implement features with Genesis patterns.

## Phase 1: Scout (Explore & Understand)

**Goal**: Understand the feature requirements and relevant Genesis patterns

### 1.1 Search for Relevant Patterns
```
Use genesis_search_patterns to find patterns related to: [feature name]
```

### 1.2 Retrieve Specific Patterns
If the feature involves:
- **Technology integration**: Use `genesis_get_stack_pattern`
- **Project structure**: Use `genesis_get_project_template`
- **Specific components**: Continue searching with refined queries

### 1.3 Analyze Existing Implementation
- Read relevant existing code files
- Identify integration points
- Document current architecture

### 1.4 Scout Report
Create a brief scout report:
- Feature requirements: [description]
- Relevant Genesis patterns: [list patterns found]
- Existing code to modify: [list files]
- Integration complexity: [low/medium/high]

**NO CODING IN SCOUT PHASE** - Pure exploration only

---

## Phase 2: Plan (Detailed Strategy)

**Goal**: Create executable implementation plan

### 2.1 Define Implementation Steps
Break down the implementation into concrete steps:
1. [Step 1: e.g., Create component file]
2. [Step 2: e.g., Implement core functionality]
3. [Step 3: e.g., Add styling and responsiveness]
4. [Step 4: e.g., Add error handling]
5. [Step 5: e.g., Write tests]

### 2.2 Identify Dependencies
- Required packages: [list]
- Environment variables: [list]
- API integrations: [list]
- File dependencies: [list]

### 2.3 Define Success Criteria
- [ ] Functional requirements met
- [ ] Genesis pattern compliance (≥8.0/10)
- [ ] Responsive design (all breakpoints)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Error handling implemented
- [ ] Tests passing

### 2.4 Risk Assessment
- Potential blockers: [list]
- Mitigation strategies: [list]

**NO CODING IN PLAN PHASE** - Detailed planning only

---

## Phase 3: Build (Implementation)

**Goal**: Implement feature following the plan

### 3.1 Setup
- Install required dependencies
- Configure environment variables
- Create necessary files

### 3.2 Implement Core Functionality
Follow the plan step-by-step:
- Implement each step from Phase 2.1
- Follow Genesis patterns from Phase 1
- Write clean, documented TypeScript code

### 3.3 Add Styling
- Use Tailwind CSS (Genesis standard)
- Ensure responsive design (mobile-first)
- Test at all breakpoints: 375px, 768px, 1920px

### 3.4 Error Handling
- Add try-catch blocks for async operations
- Implement user-friendly error messages
- Log errors appropriately

### 3.5 Testing
- Write unit tests for logic
- Test user interactions
- Validate accessibility

### 3.6 Quality Validation
Run validation:
```
Use /genesis-validate to check pattern compliance
```

If Chrome DevTools MCP is available:
```
Run comprehensive quality scan on localhost:[port]
```

### 3.7 Iteration
If quality score < 8.0:
1. Review validation feedback
2. Refactor problem areas
3. Re-test
4. Repeat until score ≥ 8.0

---

## Completion Checklist

Before marking the feature complete:

- [ ] Scout report completed
- [ ] Implementation plan created
- [ ] Core functionality implemented
- [ ] Styling and responsive design complete
- [ ] Error handling in place
- [ ] Tests written and passing
- [ ] Genesis pattern compliance ≥ 8.0/10
- [ ] Quality validation passed
- [ ] Documentation updated

---

## Tips for Success

- **Use MCP tools**: Query Genesis patterns via MCP instead of reading docs manually (50% context reduction)
- **Follow the phases**: Don't skip Scout or Plan - they save time in Build
- **Iterate**: 2-3 Build iterations are normal for complex features
- **Validate early**: Check pattern compliance before completion
- **Think in patterns**: Reuse Genesis patterns rather than creating new solutions
