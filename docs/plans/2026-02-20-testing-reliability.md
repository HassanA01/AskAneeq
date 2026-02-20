# Testing & Reliability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add integration tests and build artifact checks to the CI pipeline so that the "widget UI doesn't show despite tool call succeeding" class of regression is caught before it can merge to main.

**Architecture:** Split `server.ts` into `app.ts` (exported Express app, no `listen`) + `server.ts` (entry point only). Add a Vitest integration suite using supertest against the real in-process app. Add a Node ESM script that validates build artifacts post-build. Update CI to: unit tests → build → integration tests → build check.

**Tech Stack:** Vitest, supertest (already installed), Node ESM, GitHub Actions YAML.

---

## Task 1: Create the branch

**Files:** none

**Step 1: Create and switch to the feature branch**

```bash
git checkout main
git checkout -b tier-3.5/testing-and-reliability
```

**Step 2: Verify**

```bash
git branch --show-current
```
Expected: `tier-3.5/testing-and-reliability`

---

## Task 2: Split `server.ts` → `app.ts` + `server.ts`

**Files:**
- Create: `server/src/app.ts`
- Modify: `server/src/server.ts`

Supertest requires an importable Express app that doesn't call `app.listen()`. Extract the app into `app.ts`, export it, and slim `server.ts` down to just the listen call.

**Step 1: Create `server/src/app.ts`**

```typescript
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
import { readFileSync, readdirSync } from "node:fs";
import { initStore } from "./analytics/store.js";
import { createAdminRouter } from "./routes/admin.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { logger } from "./logger.js";
import { existsSync } from "node:fs";

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

// CORS
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

// Root probe
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

// Admin API
app.use(
  "/api/analytics",
  createAdminRouter(analyticsStore, process.env.ADMIN_TOKEN)
);

// Serve built frontend assets
app.use(express.static(join(__dirname, "../../assets")));

// Admin dashboard
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

// MCP endpoint
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
```

**Step 2: Replace `server/src/server.ts` with the entry point only**

```typescript
import { app, analyticsStore } from "./app.js";
import { logger } from "./logger.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
const SERVER_URL = process.env.SERVER_URL;

process.on("exit", () => analyticsStore.close());

app.listen(PORT, () => {
  logger.info({ port: PORT }, "AskAneeq MCP Server started");
  logger.info(`  Health:   http://localhost:${PORT}/health`);
  logger.info(`  MCP:      http://localhost:${PORT}/mcp`);
  if (SERVER_URL) {
    logger.info(`  Public:   ${SERVER_URL}/mcp`);
  }
});
```

**Step 3: Typecheck**

```bash
npm run typecheck
```
Expected: no errors

**Step 4: Run existing unit tests to confirm nothing broke**

```bash
npm run test:server
```
Expected: all pass

**Step 5: Commit**

```bash
git add server/src/app.ts server/src/server.ts
git commit -m "refactor: extract Express app into app.ts for testability"
```

---

## Task 3: Create the integration Vitest config

**Files:**
- Create: `server/vitest.integration.config.ts`

The existing `vitest.config.ts` includes `src/**/*.test.ts`. Integration tests live in `src/integration/` and need different env vars and a longer timeout, so they get their own config.

**Step 1: Create `server/vitest.integration.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/integration/**/*.test.ts"],
    testTimeout: 15000,
    env: {
      ANALYTICS_DB_PATH: ":memory:",
      ADMIN_TOKEN: "test-token",
      NODE_ENV: "test",
    },
  },
});
```

**Step 2: Add `test:integration` to `server/package.json`**

Add to the `"scripts"` object:
```json
"test:integration": "vitest run --config vitest.integration.config.ts"
```

**Step 3: Commit**

```bash
git add server/vitest.integration.config.ts server/package.json
git commit -m "test: add integration vitest config"
```

---

## Task 4: Write tool response shape integration tests

**Files:**
- Create: `server/src/integration/server.integration.test.ts`

Each tool must return `content[0].type === "text"` and `structuredContent.view` (non-empty string). This is what the widget router in `App.tsx` depends on — if `view` is missing or wrong, nothing renders.

**Step 1: Create `server/src/integration/server.integration.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

// Helper: build a JSON-RPC tools/call payload
function toolCall(name: string, args: Record<string, unknown> = {}, id = 1) {
  return {
    jsonrpc: "2.0",
    method: "tools/call",
    params: { name, arguments: args },
    id,
  };
}

// Helper: build a JSON-RPC request
function rpcCall(method: string, params: Record<string, unknown>, id = 1) {
  return { jsonrpc: "2.0", method, params, id };
}

// POST to /mcp and return the body
async function mcp(body: object) {
  return request(app)
    .post("/mcp")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send(body);
}

function assertToolShape(result: { content: unknown[]; structuredContent: Record<string, unknown> }) {
  expect(result.content).toHaveLength(1);
  expect((result.content[0] as { type: string }).type).toBe("text");
  expect(typeof result.structuredContent.view).toBe("string");
  expect((result.structuredContent.view as string).length).toBeGreaterThan(0);
  expect(result.structuredContent.data).toBeDefined();
}

describe("Tool response shapes", () => {
  it("ask_about_aneeq: overview", async () => {
    const res = await mcp(toolCall("ask_about_aneeq", { category: "overview" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("ask_about_aneeq: experience", async () => {
    const res = await mcp(toolCall("ask_about_aneeq", { category: "experience" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("ask_about_aneeq: skills", async () => {
    const res = await mcp(toolCall("ask_about_aneeq", { category: "skills" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_resume: summary", async () => {
    const res = await mcp(toolCall("get_resume", { format: "summary" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_resume: full", async () => {
    const res = await mcp(toolCall("get_resume", { format: "full" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("search_projects: by technology", async () => {
    const res = await mcp(toolCall("search_projects", { technology: "React" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("ask_anything: free-form query", async () => {
    const res = await mcp(toolCall("ask_anything", { query: "remote work" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_availability: returns booking link view", async () => {
    const res = await mcp(toolCall("get_availability", {}));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("compare_skills: two skills", async () => {
    const res = await mcp(toolCall("compare_skills", { skills: ["TypeScript", "React"] }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_recommendations: returns testimonials view", async () => {
    const res = await mcp(toolCall("get_recommendations", {}));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("track_analytics: logs event", async () => {
    const res = await mcp(toolCall("track_analytics", { tool: "ask_about_aneeq", category: "skills" }));
    expect(res.status).toBe(200);
    expect(res.body.result.content[0].type).toBe("text");
  });
});
```

**Step 2: Run integration tests and verify they pass**

```bash
npm run test:integration -w server
```
Expected: all 11 tests pass

> If any test returns a non-200 status with an "uninitialized" error from the MCP SDK, the `/mcp` route requires an `initialize` handshake first. In that case, update the `mcp()` helper to first POST an `initialize` request and chain the session ID. The test-analytics.sh script works without it, so this is unlikely.

**Step 3: Commit**

```bash
git add server/src/integration/server.integration.test.ts
git commit -m "test: add tool response shape integration tests"
```

---

## Task 5: Add widget HTML integrity test

**Files:**
- Modify: `server/src/integration/server.integration.test.ts`

This is the most important test — it catches the Vite chunk splitting regression that previously broke the ChatGPT UI. The server reads built assets from `assets/` and inlines them into HTML. The test asserts the HTML has JS inlined (not `<script src=`).

**Step 1: Append to `server/src/integration/server.integration.test.ts`**

Add this describe block at the end of the file:

```typescript
describe("Widget HTML integrity", () => {
  it("widget resource HTML has JS inlined, not linked", async () => {
    const res = await mcp(
      rpcCall("resources/read", { uri: "ui://widget/aneeq-profile.html" })
    );
    expect(res.status).toBe(200);

    const html: string = res.body.result.contents[0].text;

    // JS must be inlined as text content, not linked as a src attribute
    expect(html).toContain('<script type="module">');
    expect(html).not.toMatch(/<script\s[^>]*src=/);

    // CSS must be inlined in a <style> tag
    expect(html).toContain("<style>");
    expect(html).not.toMatch(/<link\s[^>]*rel=["']stylesheet["']/);
  });
});
```

**Step 2: Run tests**

```bash
npm run test:integration -w server
```
Expected: all tests pass including the new widget integrity test.

> If `res.body.result` is null/undefined (MCP returns an error for `resources/read`), the URI may need adjusting. Check `res.body` directly to see the error and update the URI or add initialization as needed.

**Step 3: Commit**

```bash
git add server/src/integration/server.integration.test.ts
git commit -m "test: add widget HTML integrity integration test"
```

---

## Task 6: Add admin auth integration test

**Files:**
- Modify: `server/src/integration/server.integration.test.ts`

The Vitest integration config already sets `ADMIN_TOKEN=test-token` as env var, so the app's admin router is configured with that token when imported.

**Step 1: Append to `server/src/integration/server.integration.test.ts`**

```typescript
describe("Admin auth", () => {
  it("returns 401 or 503 with no Authorization header", async () => {
    const res = await request(app).get("/api/analytics/summary");
    expect([401, 503]).toContain(res.status);
  });

  it("returns 401 with wrong token", async () => {
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("returns 200 with correct token and expected shape", async () => {
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer test-token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("toolCounts");
    expect(res.body).toHaveProperty("categoryCounts");
  });
});
```

**Step 2: Run tests**

```bash
npm run test:integration -w server
```
Expected: all tests pass.

**Step 3: Commit**

```bash
git add server/src/integration/server.integration.test.ts
git commit -m "test: add admin auth integration test"
```

---

## Task 7: Add analytics write-through integration test

**Files:**
- Modify: `server/src/integration/server.integration.test.ts`

This validates the full pipeline: MCP tool call → SQLite write → admin API read. Uses the in-memory DB configured in the vitest integration config.

**Step 1: Append to `server/src/integration/server.integration.test.ts`**

```typescript
describe("Analytics write-through", () => {
  it("track_analytics persists event readable via admin API", async () => {
    // Fire an analytics event through the MCP tool
    const trackRes = await mcp(
      toolCall("track_analytics", {
        tool: "ask_about_aneeq",
        category: "integration-test",
        query: "write-through test",
      })
    );
    expect(trackRes.status).toBe(200);

    // Read events back via admin API
    const eventsRes = await request(app)
      .get("/api/analytics/events")
      .set("Authorization", "Bearer test-token");
    expect(eventsRes.status).toBe(200);

    const events = eventsRes.body.events as Array<{
      tool: string;
      category: string | null;
      query: string | null;
    }>;
    const match = events.find(
      (e) => e.tool === "ask_about_aneeq" && e.category === "integration-test"
    );
    expect(match).toBeDefined();
  });
});
```

**Step 2: Run all integration tests**

```bash
npm run test:integration -w server
```
Expected: all tests pass (including write-through).

**Step 3: Commit**

```bash
git add server/src/integration/server.integration.test.ts
git commit -m "test: add analytics write-through integration test"
```

---

## Task 8: Create the build artifact check script

**Files:**
- Create: `scripts/check-build.mjs`

This script runs after `npm run build` in CI. It catches Vite bundle splitting regressions (the `client-*.js` regression), missing builds, and non-self-contained bundles. Exits with code 1 on any failure.

**Step 1: Create `scripts/check-build.mjs`**

```javascript
#!/usr/bin/env node
/**
 * Build artifact integrity check.
 * Run after `npm run build`. Exits 1 on any failure.
 *
 * Checks:
 *   1. assets/main-*.js exists (widget bundle)
 *   2. No assets/client-*.js exists (Vite chunk splitting regression guard)
 *   3. main-*.js has no external import statements (self-contained bundle)
 *   4. assets/admin.html exists
 *   5. assets/admin-*.js exists
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "../assets");

let failed = false;

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  console.error(`  ✗ FAIL: ${msg}`);
  failed = true;
}

console.log("Checking build artifacts...\n");

let files;
try {
  files = readdirSync(assetsDir);
} catch {
  console.error(`ERROR: assets/ directory not found at ${assetsDir}`);
  console.error("Run `npm run build` first.");
  process.exit(1);
}

// 1. Widget bundle exists
const mainJs = files.filter((f) => f.startsWith("main-") && f.endsWith(".js"));
if (mainJs.length === 0) {
  fail("No main-*.js found in assets/ — widget bundle is missing");
} else if (mainJs.length > 1) {
  fail(`Multiple main-*.js files: ${mainJs.join(", ")} — unexpected`);
} else {
  pass(`Widget bundle present: ${mainJs[0]}`);
}

// 2. No chunk splitting
const clientJs = files.filter((f) => f.startsWith("client-") && f.endsWith(".js"));
if (clientJs.length > 0) {
  fail(
    `Vite chunk splitting detected: ${clientJs.join(", ")}\n` +
    `    The widget bundle is not self-contained. ChatGPT's sandboxed iframe\n` +
    `    cannot resolve external chunk imports. Fix: ensure web/vite.config.ts\n` +
    `    does not share chunks between widget and admin builds.`
  );
} else {
  pass("No client-*.js chunks (bundle is not split)");
}

// 3. Bundle is self-contained (no external import statements)
if (mainJs.length === 1) {
  const content = readFileSync(join(assetsDir, mainJs[0]), "utf-8");
  // Match bare `import "..."` or `import '...'` at the start of a statement
  if (/(?:^|;|\})\s*import\s*["']/.test(content)) {
    fail(
      `main-*.js contains external import statements — bundle has unresolved dependencies.\n` +
      `    This means the widget will fail to load in ChatGPT's sandboxed iframe.`
    );
  } else {
    pass("main-*.js contains no external import statements (self-contained)");
  }
}

// 4. Admin HTML exists
if (!files.includes("admin.html")) {
  fail("admin.html not found in assets/ — admin build is missing");
} else {
  pass("admin.html present");
}

// 5. Admin JS bundle exists
const adminJs = files.filter((f) => f.startsWith("admin-") && f.endsWith(".js"));
if (adminJs.length === 0) {
  fail("No admin-*.js found in assets/ — admin bundle is missing");
} else {
  pass(`Admin bundle present: ${adminJs[0]}`);
}

console.log();
if (failed) {
  console.error("Build artifact checks FAILED. See above for details.");
  process.exit(1);
}
console.log("All build artifact checks passed.");
```

**Step 2: Test the script against the current build**

```bash
node scripts/check-build.mjs
```
Expected: all checks pass (assets already exist from a previous build).

**Step 3: Commit**

```bash
git add scripts/check-build.mjs
git commit -m "feat: add build artifact integrity check script"
```

---

## Task 9: Wire up scripts in package.json

**Files:**
- Modify: `package.json` (root)

**Step 1: Add scripts to root `package.json`**

In the `"scripts"` object, add:
```json
"test:integration": "npm run test:integration -w server",
"test:build": "node scripts/check-build.mjs"
```

Also update `"ci"` to include the new steps in the correct order:
```json
"ci": "npm run lint && npm run typecheck && npm run test && npm run build && npm run test:integration && npm run test:build"
```

**Step 2: Verify scripts run**

```bash
npm run test:integration
```
Expected: integration tests pass.

```bash
npm run build && npm run test:build
```
Expected: build succeeds, all artifact checks pass.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: add test:integration and test:build scripts to root"
```

---

## Task 10: Update GitHub Actions CI workflow

**Files:**
- Modify: `.github/workflows/ci.yml`

Move `Build` before the new integration/check steps, and add two new steps after it.

**Step 1: Replace `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20, 22]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Test server (unit)
        run: npm run test:server

      - name: Test web (unit)
        run: npm run test:web

      - name: Build
        run: npm run build

      - name: Test integration
        run: npm run test:integration
        env:
          ADMIN_TOKEN: test-token

      - name: Check build artifacts
        run: npm run test:build
```

**Step 2: Run the full local CI pipeline**

```bash
npm run ci
```
Expected: all steps pass end-to-end.

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add build → integration tests → build artifact checks to pipeline"
```

---

## Task 11: Final verification

**Step 1: Run the complete pipeline clean**

```bash
npm run ci
```
Expected output (in order): lint ✓, typecheck ✓, test:server ✓, test:web ✓, build ✓, test:integration ✓, test:build ✓.

**Step 2: Confirm branch is clean**

```bash
git status
git log --oneline -8
```
Expected: clean working tree, 7 commits on `tier-3.5/testing-and-reliability`.

**Step 3: Push the branch**

```bash
git push -u origin tier-3.5/testing-and-reliability
```

---

## Regression Coverage Summary

| What broke before | What catches it now |
|---|---|
| Vite creates `client-*.js` chunk | `test:build` — fails on any `client-*.js` in assets |
| `main-*.js` has `import "..."` | `test:build` — fails if bundle has external imports |
| Widget served as `<script src=` | `test:integration` — widget HTML integrity test |
| Tool returns no `view` in structuredContent | `test:integration` — tool shape test |
| Admin auth middleware broken | `test:integration` — auth flow test |
| Analytics not persisted to DB | `test:integration` — write-through test |
| Admin build missing | `test:build` — admin.html + admin-*.js check |
