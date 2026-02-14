# AskAneeq

A ChatGPT app that lets anyone ask questions about Aneeq Hassan — his experience, projects, skills, and more — right inside ChatGPT.

Built with the [OpenAI Apps SDK](https://developers.openai.com/apps-sdk) and the [Model Context Protocol](https://modelcontextprotocol.io/).

## How it works

AskAneeq is an MCP server that exposes tools ChatGPT can call. When a user asks something like *"What are Aneeq's skills?"* or *"Show me his projects"*, ChatGPT invokes a tool, and the response renders as a rich interactive widget inline in the conversation.

**Tools available to ChatGPT:**

- `ask_about_aneeq` — Query by category: overview, experience, projects, skills, education, contact, hobbies
- `get_resume` — Retrieve a full or summary resume
- `search_projects` — Filter projects by keyword or technology

## Tech stack

| Layer | Tech |
|-------|------|
| MCP Server | Node.js, Express, TypeScript, `@modelcontextprotocol/sdk` |
| Widget | React 18, Vite, TailwindCSS |
| Transport | Streamable HTTP (stateless) |
| Data | Single TypeScript file — no database needed |

## Getting started

```bash
npm install
npm run build
npm start
```

The server runs on port `8000`. Expose it with a tunnel (e.g. ngrok) and add the `/mcp` endpoint as a connector in ChatGPT under **Settings > Apps & Connectors**.

## Project structure

```
server/src/
  server.ts                # Express + MCP transport
  data/aneeq-data.ts       # All data about Aneeq
  tools/                   # Tool definitions and handlers

web/src/
  App.tsx                  # View router
  hooks/use-tool-result.ts # MCP Apps bridge
  components/              # UI components rendered in ChatGPT
```

## License

MIT
