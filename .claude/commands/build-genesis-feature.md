# Build Genesis Feature

Implement feature based on plan with validation and iteration. This is the third phase of the **Scout-Plan-Build** workflow recommended by Anthropic.

## Purpose

**Build phase executes the plan systematically**:
- Implement solution based on detailed plan
- Verify correctness at each step
- Iterate 2-3 times for optimal results
- Run tests continuously
- Commit changes incrementally
- Update documentation

## Usage

```bash
# Build from previous plan
/build-genesis-feature --from-last-plan

# Build standalone feature
/build-genesis-feature "feature description"

# Build with specific phase
/build-genesis-feature --phase=2 --from-last-plan
```

## Examples

```bash
# Build from plan document
/build-genesis-feature --from-last-plan

# Build specific phase
/build-genesis-feature --phase=1 --from-last-plan

# Build standalone
/build-genesis-feature "add dark mode toggle to navigation"
```

## Build Process

### 1. Load Plan Document
- Review implementation strategy
- Understand phase breakdown
- Check validation criteria

### 2. Implement Phase by Phase
For each phase:
1. **Implement**: Write code following plan
2. **Test**: Run unit/integration tests
3. **Verify**: Check against acceptance criteria
4. **Iterate**: Refine based on results
5. **Commit**: Save working state

### 3. Continuous Validation
- Run tests after each significant change
- Verify against plan checkpoints
- Course-correct if deviating
- Document any plan deviations

### 4. Final Integration
- Run full test suite
- Perform E2E testing
- Update documentation
- Create final commit

## Implementation Strategy

### Iterative Refinement
**Anthropic Recommendation**: 2-3 iterations for optimal results

**Iteration 1**: Basic implementation
- Core functionality
- Happy path
- Basic tests

**Iteration 2**: Refinement
- Edge cases
- Error handling
- Additional tests

**Iteration 3**: Polish
- Performance optimization
- Accessibility
- Documentation

### Progressive Commits

Commit strategy:
```bash
# After Phase 1
git add .
git commit -m "feat: Phase 1 - [phase description]"

# After Phase 2
git add .
git commit -m "feat: Phase 2 - [phase description]"

# After Phase 3
git add .
git commit -m "feat: Phase 3 - [phase description]"

# Final commit
git add .
git commit -m "feat: Complete [feature name] implementation

- Implemented [phase 1]
- Implemented [phase 2]
- Implemented [phase 3]
- All tests passing
- Documentation updated

Closes #[issue number]"
```

## Validation Checkpoints

### After Each Phase
- [ ] Phase tasks completed
- [ ] Tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code matches plan
- [ ] Ready for next phase

### Before Final Commit
- [ ] All phases complete
- [ ] Full test suite passing
- [ ] E2E tests passing
- [ ] Documentation updated
- [ ] No console errors
- [ ] Genesis patterns followed
- [ ] Accessibility verified
- [ ] Performance acceptable

## Output Format

```markdown
# Build Progress: [Feature Name]

## Phase 1: [Phase Name] ✅
**Status**: Complete
**Commits**: [commit hashes]
**Files Modified**:
- `path/to/file.ts`: [Changes made]
- `path/to/file.ts`: [Changes made]

**Tests**: ✅ All passing (12/12)
**Validation**: ✅ Checkpoint met

### Iteration 1
- Implemented core functionality
- Basic tests passing

### Iteration 2
- Added error handling
- Edge cases covered

### Issues Encountered
- [Issue]: [Resolution]

## Phase 2: [Phase Name] ✅
[Same structure as Phase 1]

## Phase 3: [Phase Name] ✅
[Same structure as Phase 1]

## Final Integration ✅
**Test Results**:
- Unit Tests: ✅ 45/45 passing
- Integration Tests: ✅ 12/12 passing
- E2E Tests: ✅ 8/8 passing

**Performance**:
- Bundle size: +5KB (acceptable)
- Load time: <100ms (target: <200ms)

**Accessibility**:
- WCAG AA: ✅ Compliant
- Screen reader: ✅ Verified
- Keyboard navigation: ✅ Working

**Documentation Updated**:
- [x] README.md
- [x] Component JSDoc
- [x] CHANGELOG.md

## Deviations from Plan
### [Deviation Description]
- **Planned**: [What was planned]
- **Actual**: [What was implemented]
- **Reason**: [Why deviation was necessary]
- **Impact**: [Impact analysis]

## Final Commit
```bash
git commit -m "feat: Complete OAuth 2.0 authentication

- Implemented Google OAuth integration
- Added refresh token handling
- Added PKCE flow for security
- Comprehensive test coverage
- Documentation updated

Closes #123"
```

## Next Steps
1. Create PR for review
2. Deploy to staging
3. Run acceptance tests
4. Prepare for production
```

## Best Practices

### ✅ Do
- Follow plan systematically
- Test continuously
- Commit incrementally
- Iterate 2-3 times
- Verify each phase
- Document deviations
- Update docs

### ❌ Don't
- Skip testing
- Make massive commits
- Deviate without documentation
- Skip iteration
- Ignore validation checkpoints
- Forget documentation
- Rush final integration

## Testing Guidelines

### Test-Driven Development
```typescript
// 1. Write test first
describe('AuthService', () => {
  it('should refresh expired tokens', async () => {
    // Given
    const expiredToken = mockExpiredToken();

    // When
    const result = await authService.refreshToken(expiredToken);

    // Then
    expect(result.accessToken).toBeTruthy();
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });
});

// 2. Implement feature
class AuthService {
  async refreshToken(token: string) {
    // Implementation
  }
}

// 3. Verify test passes
```

### Continuous Testing
```bash
# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- AuthService.test.ts

# Run with coverage
npm test -- --coverage
```

## Error Recovery

### If Tests Fail
1. Review failure message
2. Check implementation vs plan
3. Fix issue
4. Re-run tests
5. If persistent, roll back and reassess

### If Deviating from Plan
1. Document reason for deviation
2. Assess impact
3. Update plan if needed
4. Continue with modified approach
5. Note in final documentation

### If Blocked
1. Document blocker
2. Try alternative approach
3. Consult plan's fallback strategy
4. Escalate if critical

## Integration with Development Flow

### After Build Complete
```bash
# Generate transition for next session
/generate-transition

# Or create PR
gh pr create --title "[Feature Name]" --body "..."

# Or continue with next feature
/scout-genesis-pattern "next feature"
```

## Performance Monitoring

### Build Metrics
- Implementation time per phase
- Test coverage percentage
- Number of iterations needed
- Time to validation checkpoint

### Quality Metrics
- Test pass rate
- TypeScript error count
- Linting issues
- Bundle size impact

## Context Loading

Build phase should load:
- **P0**: Plan document
- **P0**: Files being modified
- **P1**: Related components
- **P1**: Test utilities
- **P2**: Genesis patterns
- **P3**: Extended context as needed

See [Context Loading Strategy](../docs/CONTEXT_LOADING_STRATEGY.md)

## Git Workflow

### Branch Strategy
```bash
# Create feature branch
git checkout -b feature/[feature-name]

# Implement phases
git commit -m "feat: Phase 1 - [description]"
git commit -m "feat: Phase 2 - [description]"
git commit -m "feat: Phase 3 - [description]"

# Push to remote
git push origin feature/[feature-name]

# Create PR
gh pr create
```

### Commit Message Format
```
<type>: <description>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `test`: Adding tests
- `docs`: Documentation
- `perf`: Performance improvement

---

**Remember**: Build phase is about systematic execution. Follow the plan, test continuously, and iterate for quality. Anthropic recommends 2-3 iterations for optimal results.
