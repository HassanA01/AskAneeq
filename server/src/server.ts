import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { registerTools } from "./tools/index.js";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
const SERVER_URL = process.env.SERVER_URL;

function createMcpServer() {
  const mcpServer = new McpServer({
    name: "ask-aneeq",
    version: "1.0.0",
  });

  registerAppResource(
    mcpServer,
    "aneeq-profile-widget",
    "ui://widget/aneeq-profile.html",
    {},
    async () => {
      const assetsDir = join(__dirname, "../../assets");
      let widgetHtml: string;

      try {
        const files = readdirSync(assetsDir);
        const jsFile = files.find((f) => f.endsWith(".js"));
        const cssFile = files.find((f) => f.endsWith(".css"));

        if (!jsFile || !cssFile) {
          throw new Error("JS or CSS file not found in assets");
        }

        const js = readFileSync(join(assetsDir, jsFile), "utf-8");
        const css = readFileSync(join(assetsDir, cssFile), "utf-8");

        widgetHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script type="module">${js}</script>
</body>
</html>`;
      } catch (error) {
        console.error("Widget build failed:", error);
        widgetHtml =
          "<div style='padding:2rem;font-family:sans-serif;text-align:center;color:#666'>Widget not built. Run: npm run build -w web</div>";
      }

      return {
        contents: [
          {
            uri: "ui://widget/aneeq-profile.html",
            mimeType: RESOURCE_MIME_TYPE,
            text: widgetHtml,
          },
        ],
      };
    },
  );

  registerTools(mcpServer);
  return mcpServer;
}

const app = express();

// CORS — must expose Mcp-Session-Id header
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, mcp-session-id",
  );
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
  next();
});

// Preflight
app.options("/mcp", (_req, res) => res.status(204).end());

// Root probe — ChatGPT checks this when adding a connector
app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end("AskAneeq MCP server");
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ask-aneeq", version: "1.0.0" });
});

// MCP endpoint — stateless, one server+transport per request (matches OpenAI quickstart)
app.all("/mcp", express.json(), async (req, res) => {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`\nAskAneeq MCP Server running on port ${PORT}`);
  console.log(`  Health:   http://localhost:${PORT}/health`);
  console.log(`  MCP:      http://localhost:${PORT}/mcp`);
  if (SERVER_URL) {
    console.log(`  Public:   ${SERVER_URL}/mcp\n`);
  }
});
