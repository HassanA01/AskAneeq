import { config as loadEnv } from "dotenv";
loadEnv({ path: "../.env" });
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerAppResource,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { registerTools } from "./tools/index.js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { initStore } from "./analytics/store.js";
import { createAdminRouter } from "./routes/admin.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { logger } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

const ALLOWED_ORIGINS = [
  "https://chatgpt.com",
  "https://cdn.oaistatic.com",
  "http://localhost:4444",
  "http://localhost:8000",
  ...(process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ?? []),
];

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
        const jsFile = files.find((f) => f.startsWith("main-") && f.endsWith(".js"));
        const cssFile = files.find((f) => f.startsWith("main-") && f.endsWith(".css"));

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
        logger.error({ err: error }, "Widget build failed");
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

export const app = express();

export const analyticsStore = initStore(
  process.env.ANALYTICS_DB_PATH ?? "./analytics.db"
);

// Security headers
app.use(helmet());

// Request ID + request logging
app.use((req, res, next) => {
  const requestId = randomUUID();
  res.setHeader("X-Request-Id", requestId);

  const start = Date.now();
  res.on("finish", () => {
    logger.info(
      {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTimeMs: Date.now() - start,
      },
      "request completed",
    );
  });

  next();
});

// CORS — explicit origins in production, permissive in development
app.use(
  cors({
    origin: isProduction ? ALLOWED_ORIGINS : true,
    methods: ["POST", "GET", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "mcp-session-id"],
    exposedHeaders: ["Mcp-Session-Id"],
  }),
);

// Rate limiting on MCP endpoint
const mcpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

// Root probe — ChatGPT checks this when adding a connector
app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end("AskAneeq MCP server");
});

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ask-aneeq",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Admin API — analytics data behind Bearer token auth
app.use(
  "/api/analytics",
  createAdminRouter(analyticsStore, process.env.ADMIN_TOKEN)
);

// Serve built frontend assets (widget + admin JS/CSS bundles)
app.use(express.static(join(__dirname, "../../assets")));

// Admin dashboard — serves built React app
app.get("/admin", (_req, res) => {
  const adminHtmlPath = join(__dirname, "../../assets/admin.html");
  if (existsSync(adminHtmlPath)) {
    res.sendFile(adminHtmlPath);
  } else {
    res
      .status(503)
      .send(
        "<p style='font-family:sans-serif;padding:2rem'>Admin dashboard not built. Run: <code>npm run build</code></p>"
      );
  }
});

// MCP endpoint — stateless, one server+transport per request
app.all("/mcp", mcpRateLimit, express.json(), async (req, res) => {
  const requestId = res.getHeader("X-Request-Id") as string;
  const reqLogger = logger.child({ requestId });

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
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
    reqLogger.error({ err: error }, "MCP request failed");
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Internal server error", requestId });
    }
  }
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = res.getHeader("X-Request-Id") as string;
  logger.error(
    { err, requestId, method: req.method, url: req.originalUrl },
    "Unhandled error",
  );
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error", requestId });
  }
};
app.use(errorHandler);
