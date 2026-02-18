# Project Structure

## Directory Layout

```
AskAneeq/
├── .github/workflows/ci.yml     # CI/CD pipeline
├── .env.example                  # Environment variable documentation
├── eslint.config.js              # ESLint flat config (TypeScript)
├── package.json                  # Root workspace config + scripts
├── tsconfig.json                 # Shared TypeScript base config
│
├── server/                       # MCP Server (Node.js + Express)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── server.ts             # Express app, MCP transport, widget serving
│       ├── data/
│       │   └── aneeq-data.ts     # All profile data (single source of truth)
│       └── tools/
│           ├── index.ts          # Tool registry
│           ├── ask-about.ts      # Category Q&A tool
│           ├── ask-about.test.ts
│           ├── get-resume.ts     # Resume tool
│           ├── get-resume.test.ts
│           ├── search-projects.ts # Project search tool
│           └── search-projects.test.ts
│
├── web/                          # React Widget (Vite + Tailwind)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── index.tsx             # React entry point
│       ├── index.css             # Tailwind v4 + OpenAI SDK styles
│       ├── App.tsx               # View router
│       ├── types.ts              # TypeScript interfaces
│       ├── assets/
│       │   └── profile-image.ts  # Base64 profile photo
│       ├── hooks/
│       │   └── use-tool-result.ts # MCP bridge hook
│       ├── test/
│       │   └── setup.tsx         # Test mocks and setup
│       └── components/           # One folder per component
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
