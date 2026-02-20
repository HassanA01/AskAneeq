# Analytics Dashboard — Design Document

**Date:** 2026-02-19
**Status:** Approved
**Branch:** feature/analytics-dashboard

---

## Overview

Add persistent analytics tracking and a private admin dashboard to AskAneeq. The `track_analytics` MCP tool currently only writes to pino logs. This feature persists events to SQLite and surfaces insights — tool call counts, category breakdowns, and a recent query log — behind a token-protected admin UI.

---

## Approach

**Approach A** — `better-sqlite3` + `AnalyticsStore` abstraction + second Vite entry point. See IDEAS.md for Approach B (Drizzle ORM), the recommended migration path if the schema grows complex.

---

## Architecture

### New Files

```
server/src/
  analytics/
    store.ts              # AnalyticsStore class (SQLite via better-sqlite3)
    store.test.ts         # Unit tests (in-memory :memory: DB)
  routes/
    admin.ts              # Express router: GET /api/analytics/summary + /events
    admin.test.ts         # Route tests with mocked store

web/src/
  admin/
    main.tsx              # Vite entry point
    App.tsx               # Login gate + dashboard shell
    App.test.tsx          # Auth flow tests
    components/
      ToolChart.tsx        # Tool call counts (Tailwind bar chart)
      ToolChart.test.tsx
      CategoryChart.tsx    # Category breakdown (Tailwind bar chart)
      CategoryChart.test.tsx
      QueryLog.tsx         # Recent events table
      QueryLog.test.tsx
```

### Modified Files

```
server/src/tools/track-analytics.ts   # Call analyticsStore.insert() + pino log
server/src/server.ts                  # Mount admin router, serve /admin HTML
web/vite.config.ts                    # Add admin entry point
web/admin.html                        # New HTML shell for admin app
.env.example                          # Add ADMIN_TOKEN, ANALYTICS_DB_PATH
.gitignore                            # Add *.db
CLAUDE.md                             # Update project structure
docs/project-structure.md             # Add new files
docs/testing.md                       # Add new test descriptions
SCALE_PLAN.md                         # Check off Tier 3 analytics dashboard items
```

---

## Data Layer

### SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  tool      TEXT NOT NULL,
  query     TEXT,
  category  TEXT,
  timestamp TEXT NOT NULL  -- ISO 8601
);
```

### `AnalyticsStore` API

```typescript
class AnalyticsStore {
  constructor(dbPath: string)
  insert(event: { tool: string; query?: string; category?: string }): void
  getToolCounts(): { tool: string; count: number }[]
  getCategoryCounts(): { category: string; count: number }[]
  getRecentEvents(limit?: number): AnalyticsEvent[]  // default 50
  close(): void
}

export interface AnalyticsEvent {
  id: number;
  tool: string;
  query: string | null;
  category: string | null;
  timestamp: string;
}
```

### Config

- `ANALYTICS_DB_PATH` env var — defaults to `./analytics.db`
- DB file added to `.gitignore`
- Store instantiated once at server startup, passed to admin router and tool handler

---

## Server — Auth + API Routes

### Auth Middleware

Checks `Authorization: Bearer <token>` header against `process.env.ADMIN_TOKEN`:
- `401` if header missing or token mismatch
- `503` if `ADMIN_TOKEN` env var is not set
- `next()` if valid

### API Routes

| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/api/analytics/summary` | `{ toolCounts: [{tool, count}], categoryCounts: [{category, count}] }` |
| `GET` | `/api/analytics/events?limit=50` | `{ events: [{id, tool, query, category, timestamp}] }` |

### `/admin` Route

Serves built `assets/admin/index.html`. Falls back to plain "Dashboard not built" message if file missing (same pattern as widget).

---

## Admin Dashboard UI

### Auth Flow

1. `/admin` loads React app
2. No token in `sessionStorage` → show centered login form
3. Submit → test request to `/api/analytics/summary`:
   - 200 → store token in `sessionStorage`, show dashboard
   - 401 → show error message
4. Logout → clear `sessionStorage`, return to login form

### Layout

```
┌─────────────────────────────────────────────┐
│  AskAneeq Analytics          [Logout]        │
├──────────────────┬──────────────────────────┤
│  Tool Calls      │  Category Breakdown       │
│  ┌────────────┐  │  ┌────────────────────┐  │
│  │ bar chart  │  │  │ bar chart          │  │
│  └────────────┘  │  └────────────────────┘  │
├──────────────────┴──────────────────────────┤
│  Recent Queries                              │
│  ┌──────────────────────────────────────┐   │
│  │ timestamp │ tool │ category │ query  │   │
│  │ ...       │ ...  │ ...      │ ...    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Implementation Notes

- **No charting library** — horizontal bar charts built with Tailwind `div` widths (percentage of max count)
- **Styling** — matches existing widget aesthetic (same Tailwind config)
- **Data fetching** — plain `fetch` with `Authorization: Bearer <token>` header, no new HTTP client

---

## Testing Plan

### Server — Unit Tests

| File | Key cases |
|------|-----------|
| `analytics/store.test.ts` | `insert` persists event; `getToolCounts` aggregates correctly; `getCategoryCounts` excludes nulls; `getRecentEvents` respects limit; uses `:memory:` DB |
| `routes/admin.test.ts` | 401 on missing token; 401 on wrong token; 200 with correct token; summary shape correct; events shape correct |
| `tools/track-analytics.test.ts` | Updated: asserts `analyticsStore.insert` called with correct payload |

### Widget — Component Tests

| File | Key cases |
|------|-----------|
| `admin/App.test.tsx` | Shows login form when no token; stores token on successful auth; shows dashboard after login; logout clears token |
| `admin/components/ToolChart.test.tsx` | Renders tool names and counts; handles empty state |
| `admin/components/CategoryChart.test.tsx` | Renders category names and counts; handles empty state |
| `admin/components/QueryLog.test.tsx` | Renders event rows; shows "no queries yet" on empty |

---

## Environment Variables

```bash
# Admin dashboard token — required to access /admin API routes
ADMIN_TOKEN=your-secret-token-here

# SQLite database path (default: ./analytics.db)
# ANALYTICS_DB_PATH=./analytics.db
```

---

## Architecture Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-19 | `better-sqlite3` over Drizzle ORM | Single table, simple queries — ORM adds overhead without benefit at this scale |
| 2026-02-19 | `AnalyticsStore` abstraction | Mirrors `SearchProvider` pattern — swap backing store without touching tool handler |
| 2026-02-19 | Tailwind bar charts, no charting lib | Zero new dependencies; data is simple counts, not time-series |
| 2026-02-19 | Second Vite entry point for admin | Reuses existing React + Tailwind stack; consistent styling; no new build tooling |
| 2026-02-19 | `sessionStorage` for token | Token clears on tab close — appropriate for a private admin tool |
