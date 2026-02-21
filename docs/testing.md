# Testing Guide

## Overview

AskAneeq uses [Vitest](https://vitest.dev/) for both server and widget testing. Tests are co-located with source files following the `*.test.ts(x)` convention.

## Running Tests

```bash
# Run all unit tests
npm test

# Run server unit tests only
npm run test:server

# Run web widget unit tests only
npm run test:web

# Run integration tests (requires a prior build for widget HTML integrity test)
npm run test:integration

# Check build artifact integrity (no chunk splitting)
npm run test:build

# Watch mode (in each workspace)
npm run test:watch -w server
npm run test:watch -w web
```

## Server Tests

### Tool Tests

Located in `server/src/tools/*.test.ts`. Pure unit tests for MCP tool handlers — no HTTP server or transport layer involved.

**What's tested:**
- `ask-about.test.ts` — All 8 categories return correct view, data, and text content
- `get-resume.test.ts` — Full/summary formats, featured project filtering, data assembly
- `search-projects.test.ts` — Query/technology filtering, case-insensitivity, empty results, combined filters
- `ask-anything.test.ts` — known topic returns result, correct view on top hit, fallback to overview on no match, searchQuery in structured content
- `get-availability.test.ts` — returns CALENDLY_URL from env, falls back to portfolio URL when unset
- `compare-skills.test.ts` — known/unknown skills, case-insensitivity, category lookup, null category
- `get-recommendations.test.ts` — all recs returned, limit respected, handles empty array
- `track-analytics.test.ts` — `getStore().insert()` called with correct tool/category/query payload; store mock injected via `vi.mock`
- `keyword-provider.test.ts` — scoring, case-insensitivity, sort order, empty/no-match cases

### Analytics Store Tests

Located in `server/src/analytics/store.test.ts`. Unit tests using an in-memory `:memory:` SQLite database.

**What's tested:**
- `insert` persists events; subsequent reads return them
- `getToolCounts` aggregates by tool name, orders by count descending
- `getCategoryCounts` excludes null categories, aggregates and orders correctly
- `getRecentEvents` returns events newest-first (`ORDER BY timestamp DESC, id DESC`), respects custom limit
- Default limit of 50 applied when no argument passed

### Admin Route Tests

Located in `server/src/routes/admin.test.ts`. HTTP-level tests using `supertest` with a mock `AnalyticsStore`.

**What's tested:**
- `GET /api/analytics/summary` returns 503 when `ADMIN_TOKEN` not configured
- Returns 401 when `Authorization` header is missing
- Returns 401 when token is wrong
- Returns 200 with `{ toolCounts, categoryCounts }` shape when token is correct
- `GET /api/analytics/events` returns events array; `?limit=10` forwarded to store; default limit 50 used when param absent

**Config:** `server/vitest.config.ts` — Node environment, globals enabled.

## Widget Tests

### Widget Component Tests

Located in `web/src/components/<ComponentName>/<ComponentName>.test.tsx`. Component tests using React Testing Library.

**What's tested:**
- Each component renders correct data (names, titles, descriptions, etc.)
- Interactive elements (links with correct hrefs, `target="_blank"`)
- Conditional rendering (featured badges, impact sections, empty states)
- Focus highlighting (`ExperienceTimeline` with `focusId`)
- `RecommendationsCard` — author/role/company/text rendered; LinkedIn link conditional; rel="noopener noreferrer" enforced
- `AvailabilityCard` — booking link with correct href, target="_blank", rel="noopener noreferrer"
- `SkillComparisonView` — skill names, proficiency labels, category labels, not-found state

### Admin Dashboard Tests

Located in `web/src/admin/`. Component and integration tests for the admin dashboard.

**What's tested:**
- `App.test.tsx` — Shows login form when no token in `sessionStorage`; shows error on 401; stores token and shows dashboard on success; auto-loads dashboard when token already in storage; logout clears token and returns to login
- `ToolChart.test.tsx` — Renders tool names and call counts; shows largest bar at full width; shows "No data yet" on empty array
- `CategoryChart.test.tsx` — Renders category names and counts; shows largest bar at full width; shows "No data yet" on empty array
- `QueryLog.test.tsx` — Renders event rows with timestamp, tool, category, query; renders "—" for null values; shows "No queries yet" on empty array

**Config:** `web/vitest.config.ts` — jsdom environment, React plugin, global setup file.

**Setup file:** `web/src/test/setup.tsx` — Mocks for:
- `@openai/apps-sdk-ui` components (Avatar, Badge)
- `@modelcontextprotocol/ext-apps/react` (useApp hook)
- Profile image asset (avoids bundling 65KB base64 in tests)

## Integration Tests

Located in `server/src/integration/server.integration.test.ts`. Full HTTP-level tests using `supertest` against the real Express app (imported from `app.ts` without port binding). Requires `ADMIN_TOKEN` env var. Run **after** `npm run build` so the widget HTML integrity test has real build artifacts.

**What's tested (16 tests):**
- **Tool response shapes** — all 8 tools (`ask_about_aneeq`, `get_resume`, `search_projects`, `ask_anything`, `get_availability`, `compare_skills`, `get_recommendations`, `track_analytics`) return valid `structuredContent.view` string and `content[0].type === "text"`
- **Widget HTML integrity** — `resources/read` on the widget HTML returns JS inlined as `<script type="module">` (no `src=` attribute) and CSS inlined in `<style>` (no `<link rel="stylesheet">`) — catches the Vite chunk-split regression that broke the ChatGPT sandbox
- **Admin auth** — no token → 401/503, wrong token → 401, correct token → 200 with `{ toolCounts, categoryCounts }`
- **Analytics write-through** — calling `track_analytics` via MCP persists the event, which is then readable via `GET /api/analytics/events`

**Config:** `server/vitest.integration.config.ts` — Node environment, 30 s timeout per test, no parallelism (single thread to avoid SQLite contention).

## Build Artifact Check

Script: `scripts/check-build.mjs`

Scans `assets/` for `main-*.js` files and asserts none contain external `import` statements. Exits non-zero if the bundle has been split into multiple chunks — this would break the ChatGPT sandboxed iframe which cannot resolve relative module URLs.

## Adding New Tests

### Server tool test
```typescript
// server/src/tools/my-tool.test.ts
import { describe, it, expect } from "vitest";
import { handleMyTool } from "./my-tool.js";

describe("my_tool", () => {
  it("returns expected data", async () => {
    const result = await handleMyTool({ param: "value" });
    expect(result.structuredContent.view).toBe("my-view");
    expect(result.content[0].type).toBe("text");
  });
});
```

### Widget component test
```typescript
// web/src/components/MyComponent/MyComponent.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders data", () => {
    render(<MyComponent data={mockData} />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```
