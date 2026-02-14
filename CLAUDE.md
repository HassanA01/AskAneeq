# AskAneeq - ChatGPT App

A ChatGPT app built with the OpenAI Apps SDK that lets users ask questions about Aneeq Hassan.

## Architecture

- **MCP Server** (`server/`): Node.js + Express + TypeScript. Exposes tools via SSE on port 8000 at `/mcp`.
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
npm run ngrok        # Tunnel
```

## Project Structure

```
server/src/
  server.ts              # Express + SSE transport
  tools/index.ts         # Tool registry
  tools/ask-about.ts     # Category Q&A tool
  tools/get-resume.ts    # Resume tool
  tools/search-projects.ts # Project search tool
  data/aneeq-data.ts     # All data about Aneeq

web/src/
  App.tsx                # View router
  hooks/use-tool-result.ts # MCP bridge hook
  components/            # ProfileCard, ExperienceTimeline, ProjectsGallery, SkillsView, ContactCard, EducationCard
```

## Common Tasks

- **Update data**: Edit `server/src/data/aneeq-data.ts`, rebuild
- **Add a tool**: Create file in `server/src/tools/`, register in `tools/index.ts`, add view case in `web/src/App.tsx`
- **Style changes**: Edit `web/src/index.css` or component files
- **Test with ChatGPT**: Start server, run ngrok, add connector with `/mcp` endpoint

## ngrok URL

```
<your ngrok url>
```
