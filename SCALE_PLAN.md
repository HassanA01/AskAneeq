# AskAneeq Scale Plan

## Tier 1: Foundation (Weeks 1-2)

### Testing Infrastructure
- [x] Vitest for server-side tool unit tests
- [x] Vitest + React Testing Library for widget component tests
- [x] Root-level test orchestration scripts

### CI/CD Pipeline
- [x] GitHub Actions: lint, typecheck, test, build on every PR
- [x] Branch protection rules (require CI pass before merge)

### Environment & Config
- [x] `.env.example` documenting all environment variables
- [x] Remove hardcoded ngrok URL from package.json

### Code Quality
- [x] ESLint configuration
- [x] Consistent typecheck scripts across workspaces

---

## Tier 2: Production Infrastructure (Weeks 3-4)

### Logging & Observability
- [x] Structured logging with pino (request IDs, tool call tracking)
- [x] Error tracking (structured error logging via pino — Sentry-ready)
- [x] Uptime monitoring on health endpoint

### Security Hardening
- [x] Replace wildcard CORS with explicit ChatGPT origins
- [x] Rate limiting on `/mcp` endpoint
- [x] Helmet.js for HTTP security headers

### Deployment
- [x] Dockerfile for Railway / Fly.io / Render (eliminate ngrok dependency)
- [x] Auto-deploy on push to main (platform-native)
- [x] Environment-specific configs (staging vs production)

---

## Tier 3: Feature Upgrades (Month 2)

### New Tools
- [x] `ask_anything` - Free-form Q&A with semantic search over data
- [x] `get_availability` - Calendar/availability integration
- [x] `compare_skills` - Skill comparison tool
- [x] `get_recommendations` - Testimonials/endorsements
- [x] `track_analytics` - Log query patterns for insights

### Analytics Dashboard
- [ ] Track which tools/categories are queried most
- [ ] Store anonymized query logs
- [ ] Private admin dashboard to view visitor insights

### Dynamic Data Layer
- [ ] Migrate from hardcoded data to lightweight database (SQLite/Turso)
- [ ] Admin API for updating data without redeploying
- [ ] Data versioning

### Widget Enhancements
- [ ] Make `format: "summary"` render a condensed resume UI
- [ ] View transitions and animations
- [ ] Mobile-responsive refinements

---

## Tier 4: Scale & Differentiate (Month 3+)

### Multi-Persona Platform
- [ ] Abstract into a platform where anyone can create their own "AskMe" app
- [ ] User registration, data entry UI, auto-generated MCP server per user
- [ ] SaaS pricing model

### Live Integrations
- [ ] GitHub API - real repo stars, recent commits
- [ ] LinkedIn API - endorsements
- [ ] Blog/RSS feed integration
- [ ] Auto-update project metrics

### Performance
- [ ] Response caching (Redis or in-memory LRU)
- [ ] CDN for widget assets instead of inlining
- [ ] Response compression

---

## Architecture Decisions Log

| Date       | Decision                          | Rationale                                    |
| ---------- | --------------------------------- | -------------------------------------------- |
| 2026-02-18 | Vitest over Jest                  | Native ESM support, faster, Vite-aligned     |
| 2026-02-18 | GitHub Actions for CI             | Free for public repos, industry standard     |
| 2026-02-18 | ESLint flat config                | Modern standard, simpler configuration       |
