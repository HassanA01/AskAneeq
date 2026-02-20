# Project Structure

## Directory Layout

```
AskAneeq/
├── .github/workflows/ci.yml     # CI/CD pipeline
├── .env.example                  # Environment variable documentation
├── Dockerfile                    # Multi-stage production build
├── .dockerignore                 # Docker build exclusions
├── eslint.config.js              # ESLint flat config (TypeScript)
├── package.json                  # Root workspace config + scripts
├── tsconfig.json                 # Shared TypeScript base config
│
├── server/                       # MCP Server (Node.js + Express)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── server.ts             # Express app, MCP transport, middleware
│       ├── logger.ts             # Pino logger configuration
│       ├── logger.test.ts        # Logger unit tests
│       ├── data/
│       │   └── aneeq-data.ts     # All profile data (single source of truth)
│       ├── analytics/
│       │   ├── store.ts          # AnalyticsStore (SQLite via better-sqlite3)
│       │   └── store.test.ts
│       ├── routes/
│       │   ├── admin.ts          # Admin API router (/api/analytics/*)
│       │   └── admin.test.ts
│       ├── search/
│       │   ├── provider.ts       # SearchProvider interface + SearchResult type
│       │   ├── keyword-provider.ts # KeywordSearchProvider implementation
│       │   └── keyword-provider.test.ts
│       └── tools/
│           ├── index.ts          # Tool registry
│           ├── ask-about.ts      # Category Q&A tool
│           ├── ask-about.test.ts
│           ├── get-resume.ts     # Resume tool
│           ├── get-resume.test.ts
│           ├── search-projects.ts # Project search tool
│           ├── search-projects.test.ts
│           ├── ask-anything.ts   # Free-form keyword search tool
│           ├── ask-anything.test.ts
│           ├── get-availability.ts # Calendly booking link tool
│           ├── get-availability.test.ts
│           ├── compare-skills.ts # Skill comparison tool
│           ├── compare-skills.test.ts
│           ├── get-recommendations.ts # Testimonials tool
│           ├── get-recommendations.test.ts
│           ├── track-analytics.ts # Analytics event logging tool
│           └── track-analytics.test.ts
│
├── web/                          # React Widget (Vite + Tailwind)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── vite.config.ts
│   ├── index.html
│   ├── admin.html                    # Admin dashboard HTML entry
│   └── src/
│       ├── index.tsx             # React entry point (widget)
│       ├── index.css             # Tailwind v4 + OpenAI SDK styles
│       ├── App.tsx               # View router (widget)
│       ├── types.ts              # TypeScript interfaces
│       ├── assets/
│       │   └── profile-image.ts  # Base64 profile photo
│       ├── hooks/
│       │   └── use-tool-result.ts # MCP bridge hook
│       ├── test/
│       │   └── setup.tsx         # Test mocks and setup
│       ├── admin/                # Admin dashboard app
│       │   ├── main.tsx          # Admin app entry point
│       │   ├── App.tsx           # Login gate + dashboard shell
│       │   ├── App.test.tsx
│       │   ├── admin.css         # Tailwind entry for admin
│       │   └── components/
│       │       ├── ToolChart/
│       │       │   ├── ToolChart.tsx
│       │       │   ├── ToolChart.test.tsx
│       │       │   └── index.ts
│       │       ├── CategoryChart/
│       │       │   ├── CategoryChart.tsx
│       │       │   ├── CategoryChart.test.tsx
│       │       │   └── index.ts
│       │       └── QueryLog/
│       │           ├── QueryLog.tsx
│       │           ├── QueryLog.test.tsx
│       │           └── index.ts
│       └── components/           # One folder per component (widget)
│           ├── ProfileCard/
│           │   ├── ProfileCard.tsx
│           │   ├── ProfileCard.test.tsx
│           │   └── index.ts
│           ├── ExperienceTimeline/
│           │   ├── ExperienceTimeline.tsx
│           │   ├── ExperienceTimeline.test.tsx
│           │   └── index.ts
│           ├── ProjectsGallery/
│           │   ├── ProjectsGallery.tsx
│           │   ├── ProjectsGallery.test.tsx
│           │   └── index.ts
│           ├── SkillsView/
│           │   ├── SkillsView.tsx
│           │   ├── SkillsView.test.tsx
│           │   └── index.ts
│           ├── ContactCard/
│           │   ├── ContactCard.tsx
│           │   ├── ContactCard.test.tsx
│           │   └── index.ts
│           └── EducationCard/
│               ├── EducationCard.tsx
│               ├── EducationCard.test.tsx
│               └── index.ts
│
├── docs/                         # Project documentation
│   ├── testing.md
│   ├── ci-cd.md
│   ├── logging.md
│   ├── security.md
│   ├── deployment.md
│   └── project-structure.md
│
└── assets/                       # Built widget output (gitignored)
```

## Component Convention

Each component lives in its own folder:

```
ComponentName/
  ComponentName.tsx       # Component implementation
  ComponentName.test.tsx  # Tests
  index.ts                # Barrel export
```

This keeps related files together and scales cleanly as components grow (e.g., adding styles, sub-components, or hooks specific to a component).

## Key Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both servers (MCP :8000, Widget :4444) |
| `npm run build` | Build widget + compile server |
| `npm test` | Run all tests (server + web) |
| `npm run lint` | ESLint across entire project |
| `npm run typecheck` | TypeScript type checking (both workspaces) |
| `npm run ci` | Full CI pipeline (lint + typecheck + test + build) |
