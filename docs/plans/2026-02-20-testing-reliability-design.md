# Testing & Reliability Design
**Date:** 2026-02-20
**Branch:** tier-3.5/testing-and-reliability
**Tier:** 3.5

## Problem

Previous merges to main broke the UI despite tool calls succeeding. The root cause was Vite bundle splitting — the widget was emitting a `client-*.js` shared chunk alongside `main-*.js`. The server inlines `main-*.js` into HTML, but `main-*.js` contained an `import "./client-*.js"` statement that the ChatGPT sandboxed iframe could not resolve. The fix landed in `4a8eb54`, but nothing in CI prevents this class of regression from recurring.

The existing test suite is entirely unit tests (mocked). There are no integration tests, no build artifact assertions, and no post-build validation in CI.

## Goal

Add a test layer that catches regressions before they reach main, specifically:
- Widget bundle self-containment (no chunk splitting)
- Tool response shape correctness (widget knows what to render)
- Full HTTP server behaviour (auth, analytics pipeline)

## Pipeline

```
lint → typecheck → test:server → test:web → build → test:integration → test:build
```

Build runs before integration tests so the widget HTML integrity test has real assets to validate. `test:build` runs last as a pure artifact assertion.

## Architecture Changes

### Server split: `app.ts` + `server.ts`

`server.ts` currently calls `app.listen()` at module load time. Supertest requires an importable Express app with no port binding. Standard fix: extract app creation into `app.ts` (exported), keep `server.ts` as the entry point that imports and calls `listen()`.

No behaviour change — this is purely a structural refactor.

### New files

```
server/src/app.ts                          # Express app (no listen)
server/src/integration/
  server.integration.test.ts               # HTTP integration tests
scripts/
  check-build.mjs                          # Build artifact assertions
```

### Modified files

- `server/src/server.ts` — becomes entry point only (imports app, calls listen)
- `server/package.json` — adds `test:integration` script
- `package.json` — adds `test:integration` and `test:build` scripts
- `.github/workflows/ci.yml` — adds build → test:integration → test:build steps

## Integration Tests (`test:integration`)

Vitest suite. Uses supertest against the real in-process Express app. No ports, no network, no external services.

Requires an `ADMIN_TOKEN` env var — tests set this to a hardcoded value (`test-token`) via test setup, controlling both sides of the auth handshake.

### 1. Tool response shape

For each of the 8 tools, POST a valid MCP `tools/call` request and assert:
- `content[0].type === "text"` — LLM always gets readable text
- `structuredContent.view` is a non-empty string — widget knows which view to render
- `structuredContent.data` exists — widget has data to display

Tools covered: `ask_about_aneeq`, `get_resume`, `search_projects`, `ask_anything`, `get_availability`, `compare_skills`, `get_recommendations`, `track_analytics`.

### 2. Widget HTML integrity

Call the MCP resource endpoint (`resources/read` for the widget resource) and assert the returned HTML:
- Contains `<script type="module">` with JS **inlined** as text content
- Contains `<style>` with CSS inlined
- Does **not** contain `<script src=` — this is the exact regression that broke ChatGPT

This test will fail if Vite ever re-introduces chunk splitting on the widget build.

### 3. Admin auth

Full HTTP flow against real Express middleware:
- No `Authorization` header → 401 or 503
- Wrong token → 401
- Correct token (`Bearer test-token`) → 200 with expected JSON shape (`toolCounts`, `categoryCounts`)

### 4. Analytics write-through

1. POST `track_analytics` via `/mcp`
2. GET `/api/analytics/events` with auth token
3. Assert the event appears in the response

Validates the full pipeline: MCP tool → SQLite write → admin API read.

## Build Artifact Checks (`test:build`)

Node ESM script (`scripts/check-build.mjs`) run after `npm run build`. Fast, no server, pure filesystem assertions:

1. `assets/main-*.js` exists (exactly one) — widget bundle present
2. No `assets/client-*.js` exists — Vite chunk splitting regression guard
3. `main-*.js` content contains no `import "` statements — bundle is self-contained
4. `assets/admin.html` exists — admin build intact
5. `assets/admin-*.js` exists — admin bundle present

Exits with code 1 on any failure so CI blocks the merge.

## CI Changes

```yaml
# After existing "Test web" step:
- name: Build
  run: npm run build

- name: Test integration
  run: npm run test:integration
  env:
    ADMIN_TOKEN: test-token

- name: Check build artifacts
  run: npm run test:build
```

The `ADMIN_TOKEN: test-token` is safe — this is a CI-only test value, not a production secret.

## What This Catches

| Regression | Caught by |
|---|---|
| Vite creates `client-*.js` chunk | `test:build` (no client-*.js assert) |
| `main-*.js` has external `import` | `test:build` (no import statements assert) |
| Widget served as `<script src>` instead of inlined | `test:integration` (widget HTML integrity) |
| Tool returns wrong shape / missing `view` | `test:integration` (tool response shape) |
| Admin auth middleware bypassed | `test:integration` (admin auth flow) |
| Analytics not persisted | `test:integration` (write-through test) |
| Admin build missing | `test:build` (admin.html assert) |
