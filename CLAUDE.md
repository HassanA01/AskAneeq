# AskAneeq - ChatGPT App

A ChatGPT app built with the OpenAI Apps SDK that lets users ask questions about Aneeq Hassan.

## Git

- Do not add `Co-Authored-By` lines to commits.

## Architecture

- **MCP Server** (`server/`): Node.js + Express + TypeScript. Exposes tools via StreamableHTTP on port 8000 at `/mcp`.
- **React Widget** (`web/`): React 18 + Vite + TailwindCSS. Renders inside ChatGPT iframe. Dev on port 4444, builds to `/assets`.
- **Data Layer** (`server/src/data/aneeq-data.ts`): Single source of truth for all information about Aneeq.

## Tools

| Tool                  | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `ask_about_aneeq`     | Query by category: overview, experience, projects, skills, education, contact, hobbies, current-role |
| `get_resume`          | Full or summary resume format                                                                        |
| `search_projects`     | Filter projects by keyword or technology                                                             |
| `ask_anything`        | Free-form keyword search across all profile data                                                     |
| `get_availability`    | Return a Calendly booking link (reads `CALENDLY_URL` env var)                                        |
| `compare_skills`      | Look up proficiency for 1–4 skills side-by-side                                                     |
| `get_recommendations` | Return testimonials and endorsements                                                                  |
| `track_analytics`     | Log query events for analytics (tool + query + category) and persist to SQLite                       |

## Commands

```bash
npm install          # Install all dependencies
npm run dev          # Start both servers (MCP :8000, Widget :4444)
npm run build        # Build widget + compile server
npm start            # Production server on :8000
npm test             # Run all unit tests (server + web)
npm run test:integration  # Integration tests (requires prior build)
npm run test:build   # Build artifact integrity check (no chunk splitting)
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
npm run ci           # Full CI pipeline (lint + typecheck + test + build + integration + build check)
npm run ngrok        # Tunnel
docker-compose up    # Start server with persistent SQLite volume (local)
```

## Project Structure

```
server/src/
  app.ts                           # Express app + MCP transport + middleware (importable, no port binding)
  server.ts                        # Entry point — imports app.ts and calls listen()
  logger.ts                        # Pino structured logging
  logger.test.ts                   # Logger unit tests
  integration/
    server.integration.test.ts     # Full HTTP integration tests (supertest)
  analytics/
    store.ts                       # AnalyticsStore (SQLite via better-sqlite3)
    store.test.ts
  routes/
    admin.ts                       # Admin API router (/api/analytics/*)
    admin.test.ts
  search/
    provider.ts                    # SearchProvider interface
    keyword-provider.ts            # KeywordSearchProvider implementation
    keyword-provider.test.ts
  tools/index.ts                   # Tool registry
  tools/ask-about.ts               # Category Q&A tool
  tools/get-resume.ts              # Resume tool
  tools/search-projects.ts         # Project search tool
  tools/ask-anything.ts            # Free-form keyword search tool
  tools/get-availability.ts        # Calendly booking link tool
  tools/compare-skills.ts          # Skill comparison tool
  tools/get-recommendations.ts     # Testimonials tool
  tools/track-analytics.ts         # Analytics event logging tool
  tools/*.test.ts                  # Tool unit tests
  data/aneeq-data.ts               # All data about Aneeq
  search/                              # Search abstraction layer
    provider.ts                        # SearchProvider interface
    keyword-provider.ts                # KeywordSearchProvider (default)

web/src/
  App.tsx                          # View router (widget)
  hooks/use-tool-result.ts         # MCP bridge hook
  test/setup.tsx                   # Test mocks and setup
  admin/
    main.tsx                       # Admin app entry point
    App.tsx                        # Login gate + dashboard shell
    App.test.tsx
    admin.css                      # Tailwind entry for admin
    components/
      ToolChart/                   # Tool call bar chart
      CategoryChart/               # Category breakdown bar chart
      QueryLog/                    # Recent events table
  components/                      # One folder per component (widget)
    <ComponentName>/
      <ComponentName>.tsx          # Implementation
      <ComponentName>.test.tsx     # Tests
      index.ts                     # Barrel export
    RecommendationsCard/           # Testimonials view
    AvailabilityCard/              # Booking link view
    SkillComparisonView/           # Proficiency comparison view

docs/                              # Project documentation
  testing.md                       # Testing guide
  ci-cd.md                         # CI/CD pipeline docs
  logging.md                       # Logging & observability
  security.md                      # Security configuration
  deployment.md                    # Deployment guide
  project-structure.md             # Full directory layout
```

## Common Tasks

- **Update data**: Edit `server/src/data/aneeq-data.ts`, rebuild
- **Add a tool**: Create file in `server/src/tools/`, register in `tools/index.ts`, add view case in `web/src/App.tsx`, write tests
- **Add a component**: Create folder in `web/src/components/<Name>/` with `<Name>.tsx`, `<Name>.test.tsx`, `index.ts`
- **Style changes**: Edit `web/src/index.css` or component files
- **Test with ChatGPT**: Start server, run ngrok, add connector with `/mcp` endpoint
- **Run CI locally**: `npm run ci` runs the full pipeline

## ngrok URL

```
<your ngrok url>
```
