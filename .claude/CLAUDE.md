# Project Genesis - Claude Code Context

## Genesis MCP Server

This project has access to the Genesis MCP Server, which provides programmatic access to all Genesis patterns and documentation.

### Available MCP Tools

1. **genesis_get_stack_pattern** - Get integration patterns for specific technologies
   - Parameters: `integration` (supabase, ghl, copilotkit, netlify, archon)
   - Use when: Implementing technology integrations
   - Example: Get Supabase authentication setup

2. **genesis_get_project_template** - Get complete project templates
   - Parameters: `type` (landing-page, saas-app)
   - Use when: Starting new projects or referencing architecture
   - Example: Get landing page template structure

3. **genesis_search_patterns** - Search across all Genesis documentation
   - Parameters: `query` (search string)
   - Use when: Looking for specific patterns or best practices
   - Example: Search for "authentication" or "deployment"

4. **genesis_validate_implementation** - Validate code against Genesis patterns (Week 2)
   - Parameters: `code` (string), `patternType` (supabase-client, ghl-sync, landing-page-component, saas-auth, copilotkit-integration), `filePath` (optional)
   - Use when: Validating implementations meet Genesis standards
   - Returns: Validation score (0-10), issues, suggestions, compliance checklist, Genesis pattern reference
   - Minimum score: 8.0/10 required for Genesis compliance
   - Example: Validate Supabase client implementation for security and best practices

5. **genesis_suggest_improvement** - Get improvement suggestions (Week 2 Day 2)
   - Parameters: `code` (string), `patternType` (string), `context` (optional)
   - Use when: Looking for ways to improve existing code
   - Returns: Prioritized suggestions (high/medium/low) for performance, security, maintainability, Genesis compliance
   - Categories: Performance optimization, security hardening, maintainability, Genesis pattern alignment
   - Example: Get performance and security improvements for a component

6. **genesis_record_new_pattern** - Record discovered patterns (Week 2 Day 2)
   - Parameters: `name`, `category`, `description`, `problem`, `solution`, `codeExample`, `useCases`, `genesisDoc` (optional)
   - Use when: Discovering new patterns during development that should be added to Genesis
   - Returns: Confirmation and file path
   - Saves to: `patterns-discovered/` directory with automatic INDEX.md updates
   - Example: Record a new integration pattern discovered during implementation

### When to Use Genesis MCP Tools

- **Before implementing features**: Use `genesis_search_patterns` to find relevant patterns
- **During Scout phase**: Use MCP tools instead of reading docs manually (50% context reduction)
- **For integrations**: Use `genesis_get_stack_pattern` for step-by-step setup guides
- **For architecture**: Use `genesis_get_project_template` for complete boilerplate reference
- **After implementation**: Use `genesis_validate_implementation` to ensure 8.0+/10 compliance
- **During Build phase**: Validate incrementally to catch issues early
- **For optimization**: Use `genesis_suggest_improvement` to get prioritized improvement suggestions
- **When innovating**: Use `genesis_record_new_pattern` to capture discovered patterns for Genesis evolution

### Scout-Plan-Build Workflow

Genesis follows Anthropic's Scout-Plan-Build pattern:

1. **Scout**: Explore and understand (use MCP tools to query patterns)
2. **Plan**: Create detailed strategy (reference Genesis templates)
3. **Build**: Implement with validation (follow Genesis patterns)

### Context Optimization

When the MCP server is available, prefer MCP tool calls over reading documentation files directly. This reduces context usage by ~50% while maintaining access to all Genesis knowledge.

## Project Standards

- Follow Genesis patterns for all implementations
- Use Scout-Plan-Build workflow for complex features
- Validate with Chrome DevTools MCP (quality score ≥ 8.0)
- Test at all breakpoints (mobile, tablet, desktop)
