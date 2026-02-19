# Analytics Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add SQLite-backed analytics persistence and a token-protected admin dashboard at `/admin` that shows tool call counts, category breakdowns, and a recent query log.

**Architecture:** `better-sqlite3` powers an `AnalyticsStore` class (mirrors the `SearchProvider` pattern). The `track_analytics` tool writes to the store alongside its existing pino log. A new Express router handles `/api/analytics/*` routes behind Bearer token auth. The admin UI is a second Vite entry point in the web workspace — same React + Tailwind stack, completely separate from the ChatGPT widget.

**Tech Stack:** `better-sqlite3`, Express Router, React 18, TailwindCSS, Vitest, React Testing Library

---

### Task 1: Install `better-sqlite3`

**Files:**
- Modify: `server/package.json`

**Step 1: Install the dependency and its types**

```bash
npm install better-sqlite3 -w server
npm install -D @types/better-sqlite3 -w server
```

**Step 2: Verify it installed**

```bash
cat server/package.json | grep better-sqlite3
```

Expected: two entries — one in `dependencies`, one in `devDependencies`.

**Step 3: Commit**

```bash
git add server/package.json package-lock.json
git commit -m "chore: install better-sqlite3 for analytics store"
```

---

### Task 2: `AnalyticsStore` — TDD

**Files:**
- Create: `server/src/analytics/store.ts`
- Create: `server/src/analytics/store.test.ts`

**Step 1: Create the directory**

```bash
mkdir -p server/src/analytics
```

**Step 2: Write the failing tests**

Create `server/src/analytics/store.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AnalyticsStore } from "./store.js";

describe("AnalyticsStore", () => {
  let store: AnalyticsStore;

  beforeEach(() => {
    store = new AnalyticsStore(":memory:");
  });

  afterEach(() => {
    store.close();
  });

  it("inserts an event and retrieves it", () => {
    store.insert({ tool: "ask_about_aneeq", category: "skills", query: "What are his skills?" });
    const events = store.getRecentEvents();
    expect(events).toHaveLength(1);
    expect(events[0].tool).toBe("ask_about_aneeq");
    expect(events[0].category).toBe("skills");
    expect(events[0].query).toBe("What are his skills?");
    expect(events[0].timestamp).toBeTruthy();
  });

  it("inserts an event with optional fields as null", () => {
    store.insert({ tool: "get_resume" });
    const events = store.getRecentEvents();
    expect(events[0].query).toBeNull();
    expect(events[0].category).toBeNull();
  });

  it("getToolCounts aggregates by tool descending", () => {
    store.insert({ tool: "ask_about_aneeq" });
    store.insert({ tool: "ask_about_aneeq" });
    store.insert({ tool: "get_resume" });
    const counts = store.getToolCounts();
    expect(counts[0]).toEqual({ tool: "ask_about_aneeq", count: 2 });
    expect(counts[1]).toEqual({ tool: "get_resume", count: 1 });
  });

  it("getCategoryCounts aggregates by category and excludes nulls", () => {
    store.insert({ tool: "ask_about_aneeq", category: "skills" });
    store.insert({ tool: "ask_about_aneeq", category: "skills" });
    store.insert({ tool: "ask_about_aneeq", category: "experience" });
    store.insert({ tool: "get_resume" }); // no category
    const counts = store.getCategoryCounts();
    expect(counts).toHaveLength(2);
    expect(counts[0]).toEqual({ category: "skills", count: 2 });
    expect(counts[1]).toEqual({ category: "experience", count: 1 });
  });

  it("getRecentEvents respects limit", () => {
    for (let i = 0; i < 5; i++) {
      store.insert({ tool: "ask_about_aneeq" });
    }
    const events = store.getRecentEvents(3);
    expect(events).toHaveLength(3);
  });

  it("getRecentEvents returns most recent first", () => {
    store.insert({ tool: "first" });
    store.insert({ tool: "second" });
    const events = store.getRecentEvents();
    expect(events[0].tool).toBe("second");
    expect(events[1].tool).toBe("first");
  });

  it("getRecentEvents returns empty array when no events", () => {
    expect(store.getRecentEvents()).toEqual([]);
  });

  it("getToolCounts returns empty array when no events", () => {
    expect(store.getToolCounts()).toEqual([]);
  });

  it("getCategoryCounts returns empty array when no events", () => {
    expect(store.getCategoryCounts()).toEqual([]);
  });
});
```

**Step 3: Run to verify it fails**

```bash
npm test -w server -- --reporter=verbose 2>&1 | head -20
```

Expected: FAIL — `Cannot find module './store.js'`

**Step 4: Implement `AnalyticsStore`**

Create `server/src/analytics/store.ts`:

```typescript
import Database from "better-sqlite3";

export interface AnalyticsEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  timestamp: string;
}

export class AnalyticsStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        tool      TEXT NOT NULL,
        query     TEXT,
        category  TEXT,
        timestamp TEXT NOT NULL
      )
    `);
  }

  insert(event: { tool: string; query?: string; category?: string }): void {
    this.db
      .prepare(
        "INSERT INTO analytics_events (tool, query, category, timestamp) VALUES (?, ?, ?, ?)"
      )
      .run(
        event.tool,
        event.query ?? null,
        event.category ?? null,
        new Date().toISOString()
      );
  }

  getToolCounts(): { tool: string; count: number }[] {
    return this.db
      .prepare(
        "SELECT tool, COUNT(*) as count FROM analytics_events GROUP BY tool ORDER BY count DESC"
      )
      .all() as { tool: string; count: number }[];
  }

  getCategoryCounts(): { category: string; count: number }[] {
    return this.db
      .prepare(
        "SELECT category, COUNT(*) as count FROM analytics_events WHERE category IS NOT NULL GROUP BY category ORDER BY count DESC"
      )
      .all() as { category: string; count: number }[];
  }

  getRecentEvents(limit = 50): AnalyticsEvent[] {
    return this.db
      .prepare(
        "SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT ?"
      )
      .all(limit) as AnalyticsEvent[];
  }

  close(): void {
    this.db.close();
  }
}
```

**Step 5: Run tests to verify they pass**

```bash
npm test -w server -- --reporter=verbose 2>&1 | tail -20
```

Expected: all `AnalyticsStore` tests PASS.

**Step 6: Commit**

```bash
git add server/src/analytics/
git commit -m "feat: add AnalyticsStore with SQLite persistence"
```

---

### Task 3: Admin API Router — TDD

**Files:**
- Create: `server/src/routes/admin.ts`
- Create: `server/src/routes/admin.test.ts`

**Step 1: Create the directory**

```bash
mkdir -p server/src/routes
```

**Step 2: Write the failing tests**

Create `server/src/routes/admin.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createAdminRouter } from "./admin.js";
import type { AnalyticsStore } from "../analytics/store.js";

// Minimal mock store
function makeMockStore(): AnalyticsStore {
  return {
    insert: vi.fn(),
    getToolCounts: vi.fn().mockReturnValue([{ tool: "ask_about_aneeq", count: 5 }]),
    getCategoryCounts: vi.fn().mockReturnValue([{ category: "skills", count: 3 }]),
    getRecentEvents: vi.fn().mockReturnValue([
      { id: 1, tool: "ask_about_aneeq", query: "hi", category: "skills", timestamp: "2026-01-01T00:00:00.000Z" },
    ]),
    close: vi.fn(),
  } as unknown as AnalyticsStore;
}

function makeApp(token: string | undefined) {
  const app = express();
  app.use(express.json());
  const store = makeMockStore();
  app.use("/api/analytics", createAdminRouter(store, token));
  return app;
}

describe("admin router — auth", () => {
  it("returns 503 when ADMIN_TOKEN is not configured", async () => {
    const app = makeApp(undefined);
    const res = await request(app).get("/api/analytics/summary");
    expect(res.status).toBe(503);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const app = makeApp("secret");
    const res = await request(app).get("/api/analytics/summary");
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is wrong", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("allows request with correct token", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer secret");
    expect(res.status).toBe(200);
  });
});

describe("admin router — GET /summary", () => {
  it("returns toolCounts and categoryCounts", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer secret");
    expect(res.body).toEqual({
      toolCounts: [{ tool: "ask_about_aneeq", count: 5 }],
      categoryCounts: [{ category: "skills", count: 3 }],
    });
  });
});

describe("admin router — GET /events", () => {
  it("returns events array", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/events")
      .set("Authorization", "Bearer secret");
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].tool).toBe("ask_about_aneeq");
  });

  it("passes limit query param to store", async () => {
    const store = makeMockStore();
    const app = express();
    app.use(express.json());
    app.use("/api/analytics", createAdminRouter(store, "secret"));
    await request(app)
      .get("/api/analytics/events?limit=10")
      .set("Authorization", "Bearer secret");
    expect(store.getRecentEvents).toHaveBeenCalledWith(10);
  });
});
```

**Step 3: Install supertest (test dep only)**

```bash
npm install -D supertest @types/supertest -w server
```

**Step 4: Run to verify it fails**

```bash
npm test -w server -- --reporter=verbose 2>&1 | head -20
```

Expected: FAIL — `Cannot find module './admin.js'`

**Step 5: Implement the admin router**

Create `server/src/routes/admin.ts`:

```typescript
import { Router } from "express";
import type { AnalyticsStore } from "../analytics/store.js";

export function createAdminRouter(
  store: AnalyticsStore,
  adminToken: string | undefined
): Router {
  const router = Router();

  // Auth middleware
  router.use((_req, res, next) => {
    if (!adminToken) {
      res.status(503).json({ error: "Admin token not configured" });
      return;
    }
    const auth = _req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ") || auth.slice(7) !== adminToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
  });

  router.get("/summary", (_req, res) => {
    res.json({
      toolCounts: store.getToolCounts(),
      categoryCounts: store.getCategoryCounts(),
    });
  });

  router.get("/events", (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    res.json({ events: store.getRecentEvents(limit) });
  });

  return router;
}
```

**Step 6: Run tests to verify they pass**

```bash
npm test -w server -- --reporter=verbose 2>&1 | tail -20
```

Expected: all admin router tests PASS.

**Step 7: Commit**

```bash
git add server/src/routes/
git commit -m "feat: add admin API router with Bearer token auth"
```

---

### Task 4: Update `track-analytics` to use the store — TDD

**Files:**
- Modify: `server/src/tools/track-analytics.ts`
- Create: `server/src/tools/track-analytics.test.ts`

**Step 1: Write the failing test**

Create `server/src/tools/track-analytics.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the analytics store module before importing the handler
const mockInsert = vi.fn();
vi.mock("../analytics/store.js", () => ({
  getStore: () => ({ insert: mockInsert }),
}));

import { handleTrackAnalytics } from "./track-analytics.js";

describe("track_analytics tool", () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  it("returns acknowledgement text", async () => {
    const result = await handleTrackAnalytics({
      tool: "ask_about_aneeq",
      category: "skills",
      query: "What are his skills?",
    });
    expect(result.content[0].text).toBe("Query logged.");
  });

  it("returns analytics view in structuredContent", async () => {
    const result = await handleTrackAnalytics({ tool: "get_resume" });
    expect(result.structuredContent.view).toBe("analytics");
  });

  it("calls store.insert with the event payload", async () => {
    await handleTrackAnalytics({
      tool: "ask_about_aneeq",
      category: "skills",
      query: "What are his skills?",
    });
    expect(mockInsert).toHaveBeenCalledWith({
      tool: "ask_about_aneeq",
      category: "skills",
      query: "What are his skills?",
    });
  });

  it("calls store.insert with only tool when optional fields omitted", async () => {
    await handleTrackAnalytics({ tool: "get_resume" });
    expect(mockInsert).toHaveBeenCalledWith({
      tool: "get_resume",
      category: undefined,
      query: undefined,
    });
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -w server -- --reporter=verbose track-analytics 2>&1 | head -20
```

Expected: FAIL — `Cannot find module '../analytics/store.js'` (the `getStore` export doesn't exist yet).

**Step 3: Add `getStore` export to `store.ts`**

Add the following to the bottom of `server/src/analytics/store.ts`:

```typescript
let _store: AnalyticsStore | null = null;

export function initStore(dbPath: string): AnalyticsStore {
  _store = new AnalyticsStore(dbPath);
  return _store;
}

export function getStore(): AnalyticsStore | null {
  return _store;
}
```

**Step 4: Update `track-analytics.ts`**

Replace the full contents of `server/src/tools/track-analytics.ts`:

```typescript
import { z } from "zod";
import { logger } from "../logger.js";
import { getStore } from "../analytics/store.js";

export const trackAnalyticsSchema = {
  tool: z.string().describe("The tool that was called"),
  query: z.string().optional().describe("The query or question asked"),
  category: z.string().optional().describe("Category if applicable"),
};

export type TrackAnalyticsInput = {
  tool: string;
  query?: string;
  category?: string;
};

export async function handleTrackAnalytics(input: TrackAnalyticsInput) {
  logger.info({ analytics: true, ...input }, "analytics event");
  getStore()?.insert({ tool: input.tool, query: input.query, category: input.category });

  return {
    structuredContent: { view: "analytics", data: { logged: true } },
    content: [{ type: "text" as const, text: "Query logged." }],
  };
}
```

**Step 5: Run tests to verify they pass**

```bash
npm test -w server -- --reporter=verbose 2>&1 | tail -20
```

Expected: all tests PASS including new `track-analytics` tests.

**Step 6: Commit**

```bash
git add server/src/tools/track-analytics.ts server/src/tools/track-analytics.test.ts server/src/analytics/store.ts
git commit -m "feat: wire track_analytics tool to AnalyticsStore"
```

---

### Task 5: Wire store + admin router into `server.ts`

**Files:**
- Modify: `server/src/server.ts`
- Modify: `.env.example`
- Modify: `.gitignore`

**Step 1: Update `server.ts`**

Add these imports near the top of `server/src/server.ts` (after the existing imports):

```typescript
import { initStore } from "./analytics/store.js";
import { createAdminRouter } from "./routes/admin.js";
import { existsSync } from "node:fs";
```

Initialize the store after the `const app = express()` line:

```typescript
// Analytics store — initialize once at startup
const analyticsStore = initStore(
  process.env.ANALYTICS_DB_PATH ?? "./analytics.db"
);
```

Mount the admin router after the health check route (before the MCP endpoint):

```typescript
// Admin API — analytics data behind Bearer token auth
app.use(
  "/api/analytics",
  createAdminRouter(analyticsStore, process.env.ADMIN_TOKEN)
);

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
```

Also update the graceful shutdown — add `analyticsStore.close()` in the `res.on("close", ...)` callback inside the MCP handler is NOT the right place. Instead, handle process exit. Add this just before `app.listen(...)`:

```typescript
process.on("exit", () => analyticsStore.close());
```

**Step 2: Update `.env.example`**

Add to the bottom of `.env.example`:

```bash

# Admin dashboard — required to access /admin API routes
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_TOKEN=your-secret-token-here

# SQLite analytics database path (default: ./analytics.db)
# ANALYTICS_DB_PATH=./analytics.db
```

**Step 3: Add `*.db` to `.gitignore`**

Add to the bottom of `.gitignore`:

```
*.db
```

**Step 4: Run the full server test suite**

```bash
npm test -w server 2>&1 | tail -10
```

Expected: all tests PASS (no new tests for this task — server.ts wiring is integration-level).

**Step 5: Commit**

```bash
git add server/src/server.ts .env.example .gitignore
git commit -m "feat: initialize AnalyticsStore and mount admin routes in server"
```

---

### Task 6: Admin HTML entry + Vite config

**Files:**
- Create: `web/admin.html`
- Modify: `web/vite.config.ts`

**Step 1: Create `web/admin.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AskAneeq Analytics</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/admin/main.tsx"></script>
  </body>
</html>
```

**Step 2: Update `web/vite.config.ts`**

Replace the full file:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "../assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin.html"),
      },
      output: {
        entryFileNames: "[name]-[hash].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash].[ext]",
      },
    },
  },
  server: {
    port: 4444,
    open: false,
  },
});
```

**Step 3: Verify typecheck passes**

```bash
npm run typecheck 2>&1 | tail -10
```

Expected: no errors.

**Step 4: Commit**

```bash
git add web/admin.html web/vite.config.ts
git commit -m "feat: add admin HTML entry point and second Vite build target"
```

---

### Task 7: `ToolChart` component — TDD

**Files:**
- Create: `web/src/admin/components/ToolChart.tsx`
- Create: `web/src/admin/components/ToolChart.test.tsx`

**Step 1: Write the failing test**

Create `web/src/admin/components/ToolChart.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolChart } from "./ToolChart";

describe("ToolChart", () => {
  it("renders each tool name", () => {
    render(
      <ToolChart
        toolCounts={[
          { tool: "ask_about_aneeq", count: 10 },
          { tool: "get_resume", count: 4 },
        ]}
      />
    );
    expect(screen.getByText("ask_about_aneeq")).toBeInTheDocument();
    expect(screen.getByText("get_resume")).toBeInTheDocument();
  });

  it("renders each count value", () => {
    render(
      <ToolChart
        toolCounts={[
          { tool: "ask_about_aneeq", count: 10 },
          { tool: "get_resume", count: 4 },
        ]}
      />
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<ToolChart toolCounts={[]} />);
    expect(screen.getByText("No data yet.")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -w web -- --reporter=verbose ToolChart 2>&1 | head -20
```

Expected: FAIL — `Cannot find module './ToolChart'`

**Step 3: Implement `ToolChart`**

Create `web/src/admin/components/ToolChart.tsx`:

```tsx
interface Props {
  toolCounts: { tool: string; count: number }[];
}

export function ToolChart({ toolCounts }: Props) {
  if (toolCounts.length === 0) {
    return <p className="text-sm text-gray-500">No data yet.</p>;
  }

  const max = Math.max(...toolCounts.map((t) => t.count));

  return (
    <div className="space-y-2">
      {toolCounts.map(({ tool, count }) => (
        <div key={tool} className="flex items-center gap-3">
          <span className="text-sm font-mono w-40 truncate text-gray-700">{tool}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold w-6 text-right text-gray-800">{count}</span>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -w web -- --reporter=verbose ToolChart 2>&1 | tail -10
```

Expected: all `ToolChart` tests PASS.

**Step 5: Commit**

```bash
git add web/src/admin/components/ToolChart.tsx web/src/admin/components/ToolChart.test.tsx
git commit -m "feat: add ToolChart admin component"
```

---

### Task 8: `CategoryChart` component — TDD

**Files:**
- Create: `web/src/admin/components/CategoryChart.tsx`
- Create: `web/src/admin/components/CategoryChart.test.tsx`

**Step 1: Write the failing test**

Create `web/src/admin/components/CategoryChart.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryChart } from "./CategoryChart";

describe("CategoryChart", () => {
  it("renders each category name", () => {
    render(
      <CategoryChart
        categoryCounts={[
          { category: "skills", count: 8 },
          { category: "experience", count: 3 },
        ]}
      />
    );
    expect(screen.getByText("skills")).toBeInTheDocument();
    expect(screen.getByText("experience")).toBeInTheDocument();
  });

  it("renders each count value", () => {
    render(
      <CategoryChart
        categoryCounts={[
          { category: "skills", count: 8 },
          { category: "experience", count: 3 },
        ]}
      />
    );
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<CategoryChart categoryCounts={[]} />);
    expect(screen.getByText("No data yet.")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -w web -- --reporter=verbose CategoryChart 2>&1 | head -20
```

Expected: FAIL — `Cannot find module './CategoryChart'`

**Step 3: Implement `CategoryChart`**

Create `web/src/admin/components/CategoryChart.tsx`:

```tsx
interface Props {
  categoryCounts: { category: string; count: number }[];
}

export function CategoryChart({ categoryCounts }: Props) {
  if (categoryCounts.length === 0) {
    return <p className="text-sm text-gray-500">No data yet.</p>;
  }

  const max = Math.max(...categoryCounts.map((c) => c.count));

  return (
    <div className="space-y-2">
      {categoryCounts.map(({ category, count }) => (
        <div key={category} className="flex items-center gap-3">
          <span className="text-sm font-mono w-32 truncate text-gray-700 capitalize">{category}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-emerald-500 h-4 rounded-full"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold w-6 text-right text-gray-800">{count}</span>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -w web -- --reporter=verbose CategoryChart 2>&1 | tail -10
```

Expected: all `CategoryChart` tests PASS.

**Step 5: Commit**

```bash
git add web/src/admin/components/CategoryChart.tsx web/src/admin/components/CategoryChart.test.tsx
git commit -m "feat: add CategoryChart admin component"
```

---

### Task 9: `QueryLog` component — TDD

**Files:**
- Create: `web/src/admin/components/QueryLog.tsx`
- Create: `web/src/admin/components/QueryLog.test.tsx`

**Step 1: Write the failing test**

Create `web/src/admin/components/QueryLog.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryLog } from "./QueryLog";

const mockEvents = [
  {
    id: 1,
    tool: "ask_about_aneeq",
    query: "What are his skills?",
    category: "skills",
    timestamp: "2026-01-15T10:30:00.000Z",
  },
  {
    id: 2,
    tool: "get_resume",
    query: null,
    category: null,
    timestamp: "2026-01-15T11:00:00.000Z",
  },
];

describe("QueryLog", () => {
  it("renders tool name for each event", () => {
    render(<QueryLog events={mockEvents} />);
    expect(screen.getAllByText("ask_about_aneeq")).toHaveLength(1);
    expect(screen.getAllByText("get_resume")).toHaveLength(1);
  });

  it("renders query text when present", () => {
    render(<QueryLog events={mockEvents} />);
    expect(screen.getByText("What are his skills?")).toBeInTheDocument();
  });

  it("renders category when present", () => {
    render(<QueryLog events={mockEvents} />);
    expect(screen.getByText("skills")).toBeInTheDocument();
  });

  it("renders — for null query and category", () => {
    render(<QueryLog events={mockEvents} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state when no events", () => {
    render(<QueryLog events={[]} />);
    expect(screen.getByText("No queries yet.")).toBeInTheDocument();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -w web -- --reporter=verbose QueryLog 2>&1 | head -20
```

Expected: FAIL — `Cannot find module './QueryLog'`

**Step 3: Implement `QueryLog`**

Create `web/src/admin/components/QueryLog.tsx`:

```tsx
interface AnalyticsEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  timestamp: string;
}

interface Props {
  events: AnalyticsEvent[];
}

export function QueryLog({ events }: Props) {
  if (events.length === 0) {
    return <p className="text-sm text-gray-500">No queries yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
            <th className="pb-2 pr-4">Timestamp</th>
            <th className="pb-2 pr-4">Tool</th>
            <th className="pb-2 pr-4">Category</th>
            <th className="pb-2">Query</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-2 pr-4 text-gray-400 whitespace-nowrap">
                {new Date(event.timestamp).toLocaleString()}
              </td>
              <td className="py-2 pr-4 font-mono text-gray-700">{event.tool}</td>
              <td className="py-2 pr-4 text-gray-600">{event.category ?? "—"}</td>
              <td className="py-2 text-gray-600 max-w-xs truncate">{event.query ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test -w web -- --reporter=verbose QueryLog 2>&1 | tail -10
```

Expected: all `QueryLog` tests PASS.

**Step 5: Commit**

```bash
git add web/src/admin/components/QueryLog.tsx web/src/admin/components/QueryLog.test.tsx
git commit -m "feat: add QueryLog admin component"
```

---

### Task 10: Admin `App.tsx` + `main.tsx` — TDD

**Files:**
- Create: `web/src/admin/App.tsx`
- Create: `web/src/admin/App.test.tsx`
- Create: `web/src/admin/main.tsx`
- Create: `web/src/admin/admin.css`

**Step 1: Write the failing tests**

Create `web/src/admin/App.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { App } from "./App";

const mockSummary = {
  toolCounts: [{ tool: "ask_about_aneeq", count: 5 }],
  categoryCounts: [{ category: "skills", count: 3 }],
};
const mockEvents = {
  events: [
    { id: 1, tool: "ask_about_aneeq", query: "hi", category: "skills", timestamp: "2026-01-01T00:00:00.000Z" },
  ],
};

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("App — login gate", () => {
  it("shows login form when no token in sessionStorage", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Admin token")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error on wrong token (401 response)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Admin token"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
    });
  });

  it("stores token and shows dashboard on valid token", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockEvents), { status: 200 })
      );
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Admin token"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Tool Calls")).toBeInTheDocument();
    });
    expect(sessionStorage.getItem("adminToken")).toBe("secret");
  });

  it("shows dashboard immediately when token already in sessionStorage", async () => {
    sessionStorage.setItem("adminToken", "secret");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockEvents), { status: 200 })
      );
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Tool Calls")).toBeInTheDocument();
    });
  });
});

describe("App — logout", () => {
  it("clears token and returns to login on logout", async () => {
    sessionStorage.setItem("adminToken", "secret");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockEvents), { status: 200 })
      );
    render(<App />);
    await waitFor(() => screen.getByRole("button", { name: /logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(screen.getByPlaceholderText("Admin token")).toBeInTheDocument();
    expect(sessionStorage.getItem("adminToken")).toBeNull();
  });
});
```

**Step 2: Run to verify it fails**

```bash
npm test -w web -- --reporter=verbose "admin/App" 2>&1 | head -20
```

Expected: FAIL — `Cannot find module './App'`

**Step 3: Create `web/src/admin/admin.css`**

```css
@import "tailwindcss";
```

**Step 4: Implement `App.tsx`**

Create `web/src/admin/App.tsx`:

```tsx
import { useState, useEffect } from "react";
import { ToolChart } from "./components/ToolChart";
import { CategoryChart } from "./components/CategoryChart";
import { QueryLog } from "./components/QueryLog";

interface Summary {
  toolCounts: { tool: string; count: number }[];
  categoryCounts: { category: string; count: number }[];
}

interface AnalyticsEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  timestamp: string;
}

export function App() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("adminToken")
  );
  const [tokenInput, setTokenInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (!token) return;

    async function fetchData() {
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryRes, eventsRes] = await Promise.all([
        fetch("/api/analytics/summary", { headers }),
        fetch("/api/analytics/events", { headers }),
      ]);
      if (summaryRes.ok && eventsRes.ok) {
        setSummary(await summaryRes.json());
        const data = await eventsRes.json();
        setEvents(data.events);
      }
    }

    fetchData();
  }, [token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/analytics/summary", {
      headers: { Authorization: `Bearer ${tokenInput}` },
    });
    if (res.ok) {
      sessionStorage.setItem("adminToken", tokenInput);
      setToken(tokenInput);
    } else {
      setLoginError("Invalid token. Try again.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("adminToken");
    setToken(null);
    setTokenInput("");
    setSummary(null);
    setEvents([]);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-6">AskAneeq Analytics</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">AskAneeq Analytics</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Tool Calls
            </h2>
            <ToolChart toolCounts={summary?.toolCounts ?? []} />
          </section>

          <section className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Category Breakdown
            </h2>
            <CategoryChart categoryCounts={summary?.categoryCounts ?? []} />
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Recent Queries
          </h2>
          <QueryLog events={events} />
        </section>
      </main>
    </div>
  );
}
```

**Step 5: Create `web/src/admin/main.tsx`**

```tsx
import "./admin.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 6: Run tests to verify they pass**

```bash
npm test -w web -- --reporter=verbose "admin/App" 2>&1 | tail -20
```

Expected: all `App` tests PASS.

**Step 7: Run full test suite**

```bash
npm test 2>&1 | tail -10
```

Expected: all tests PASS.

**Step 8: Commit**

```bash
git add web/src/admin/
git commit -m "feat: add admin dashboard App with login gate and analytics views"
```

---

### Task 11: Documentation updates

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/project-structure.md`
- Modify: `docs/testing.md`
- Modify: `SCALE_PLAN.md`

**Step 1: Update `CLAUDE.md` — add new tools and project structure entries**

In the tools table, add a row:

```markdown
| `track_analytics` | Log query events for analytics (tool + query + category) |
```

In the project structure, add under `server/src/`:

```
  analytics/
    store.ts                         # AnalyticsStore (SQLite via better-sqlite3)
    store.test.ts
  routes/
    admin.ts                         # Admin API router (/api/analytics/*)
    admin.test.ts
```

Under `web/src/`, add:

```
  admin/
    main.tsx                         # Admin app entry point
    App.tsx                          # Login gate + dashboard shell
    App.test.tsx
    admin.css                        # Tailwind entry for admin
    components/
      ToolChart.tsx / .test.tsx      # Tool call bar chart
      CategoryChart.tsx / .test.tsx  # Category breakdown bar chart
      QueryLog.tsx / .test.tsx       # Recent events table
```

**Step 2: Update `docs/project-structure.md`** — add the same entries in the full directory layout.

**Step 3: Update `docs/testing.md`** — add entries:

```markdown
### Analytics Store (`server/src/analytics/store.test.ts`)
Tests insert, aggregation (getToolCounts, getCategoryCounts), limit enforcement, ordering, and empty-state returns. Uses in-memory `:memory:` SQLite DB — no file I/O.

### Admin Router (`server/src/routes/admin.test.ts`)
Tests 401/503 auth cases, correct token acceptance, /summary shape, /events shape, limit query param forwarding. Uses supertest and a mock store.

### track_analytics tool (`server/src/tools/track-analytics.test.ts`)
Tests acknowledgement text, structuredContent view, store.insert called with correct payload, optional fields passed through.

### ToolChart (`web/src/admin/components/ToolChart.test.tsx`)
Renders tool names, counts, and empty state.

### CategoryChart (`web/src/admin/components/CategoryChart.test.tsx`)
Renders category names, counts, and empty state.

### QueryLog (`web/src/admin/components/QueryLog.test.tsx`)
Renders event rows, null field fallback (—), and empty state.

### Admin App (`web/src/admin/App.test.tsx`)
Login form shown when no token, 401 shows error, valid token stores to sessionStorage and shows dashboard, existing token auto-loads dashboard, logout clears token.
```

**Step 4: Update `SCALE_PLAN.md`** — check off Tier 3 analytics dashboard items.

**Step 5: Run final CI check**

```bash
npm run ci 2>&1 | tail -20
```

Expected: lint ✓, typecheck ✓, tests ✓, build ✓.

**Step 6: Commit**

```bash
git add CLAUDE.md docs/project-structure.md docs/testing.md SCALE_PLAN.md
git commit -m "docs: update docs, CLAUDE.md, and SCALE_PLAN for analytics dashboard"
```
