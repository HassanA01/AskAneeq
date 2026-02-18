# AskAneeq - ChatGPT App

A ChatGPT app built with the OpenAI Apps SDK that lets users ask questions about Aneeq Hassan.

## Architecture

- **MCP Server** (`server/`): Node.js + Express + TypeScript. Exposes tools via StreamableHTTP on port 8000 at `/mcp`.
- **React Widget** (`web/`): React 18 + Vite + TailwindCSS. Renders inside ChatGPT iframe. Dev on port 4444, builds to `/assets`.
- **Data Layer** (`server/src/data/aneeq-data.ts`): Single source of truth for all information about Aneeq.

## Tools

| Tool              | Description                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `ask_about_aneeq` | Query by category: overview, experience, projects, skills, education, contact, hobbies, current-role |
| `get_resume`      | Full or summary resume format                                                                        |
| `search_projects` | Filter projects by keyword or technology                                                             |

## Commands

```bash
npm install          # Install all dependencies
npm run dev          # Start both servers (MCP :8000, Widget :4444)
npm run build        # Build widget + compile server
npm start            # Production server on :8000
npm test             # Run all tests (server + web)
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking
npm run ci           # Full CI pipeline (lint + typecheck + test + build)
npm run ngrok        # Tunnel
```

## Project Structure

```
server/src/
  server.ts                        # Express + StreamableHTTP transport
  tools/index.ts                   # Tool registry
  tools/ask-about.ts               # Category Q&A tool
  tools/get-resume.ts              # Resume tool
  tools/search-projects.ts         # Project search tool
  tools/*.test.ts                  # Tool unit tests
  data/aneeq-data.ts               # All data about Aneeq

web/src/
  App.tsx                          # View router
  hooks/use-tool-result.ts         # MCP bridge hook
  test/setup.tsx                   # Test mocks and setup
  components/                      # One folder per component
    <ComponentName>/
      <ComponentName>.tsx          # Implementation
      <ComponentName>.test.tsx     # Tests
      index.ts                     # Barrel export

docs/                              # Project documentation
  testing.md                       # Testing guide
  ci-cd.md                         # CI/CD pipeline docs
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
