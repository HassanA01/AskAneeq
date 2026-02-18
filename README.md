# AskAneeq

A ChatGPT app that lets anyone ask questions about Aneeq Hassan — his experience, projects, skills, and more — right inside ChatGPT.

Built with the [OpenAI Apps SDK](https://developers.openai.com/apps-sdk) and the [Model Context Protocol](https://modelcontextprotocol.io/).

## How it works

AskAneeq is an MCP server that exposes tools ChatGPT can call. When a user asks something like *"What are Aneeq's skills?"* or *"Show me his projects"*, ChatGPT invokes a tool, and the response renders as a rich interactive widget inline in the conversation.

## Tools

### `ask_about_aneeq`

Query by category to get specific information about Aneeq.

| Category | Example prompts |
|----------|----------------|
| `overview` | "Who is Aneeq?", "Tell me about Aneeq" |
| `experience` | "What's Aneeq's work history?" |
| `current-role` | "What is Aneeq's current role?" |
| `projects` | "Show me his projects" |
| `skills` | "What are his technical skills?" |
| `education` | "Where did Aneeq study?" |
| `contact` | "How can I contact Aneeq?" |
| `hobbies` | "What does he do for fun?" |

### `get_resume`

Retrieve Aneeq's resume in full or summary format.

| Format | Example prompts |
|--------|----------------|
| `full` | "Show me Aneeq's full resume" |
| `summary` | "Give me a resume summary" |

### `search_projects`

Filter projects by keyword or technology.

| Params | Example prompts |
|--------|----------------|
| `query` | "Search for Aneeq's AI projects" |
| `technology` | "What projects use React?" |
| Both | "Find chatbot projects using Python" |

## Tech stack

| Layer | Tech |
|-------|------|
| MCP Server | Node.js, Express, TypeScript, `@modelcontextprotocol/sdk`, `@modelcontextprotocol/ext-apps`, Pino, Helmet, express-rate-limit |
| Widget | React 18, Vite, TypeScript |
| UI Components | [`@openai/apps-sdk-ui`](https://github.com/openai/apps-sdk-ui) (Avatar, Badge), [Lucide React](https://lucide.dev/) icons |
| Styling | Tailwind CSS 4 with SDK UI design tokens (adaptive light/dark mode) |
| Transport | Streamable HTTP (stateless) |
| Data | Single TypeScript file — no database needed |

## Getting started

```bash
npm install
npm run build
npm start
```

The server runs on port `8000`. Expose it with a tunnel (e.g. ngrok) and add the `/mcp` endpoint as a connector in ChatGPT under **Settings > Apps & Connectors**.

For production deployment with Docker, see [docs/deployment.md](docs/deployment.md).

## Project structure

```
server/src/
  server.ts                # Express + MCP transport + middleware
  logger.ts                # Pino structured logging
  data/aneeq-data.ts       # All data about Aneeq
  tools/                   # Tool definitions and handlers

web/src/
  App.tsx                  # View router
  hooks/use-tool-result.ts # MCP Apps bridge
  components/              # UI components rendered in ChatGPT
  assets/                  # Inlined profile image (base64)

docs/                      # Project documentation
```

## License

MIT
