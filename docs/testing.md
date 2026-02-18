# Testing Guide

## Overview

AskAneeq uses [Vitest](https://vitest.dev/) for both server and widget testing. Tests are co-located with source files following the `*.test.ts(x)` convention.

## Running Tests

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run web widget tests only
npm run test:web

# Watch mode (in each workspace)
npm run test:watch -w server
npm run test:watch -w web
```

## Server Tests

Located in `server/src/tools/*.test.ts`. These are pure unit tests for the MCP tool handlers — no HTTP server or transport layer involved.

**What's tested:**
- `ask-about.test.ts` — All 8 categories return correct view, data, and text content
- `get-resume.test.ts` — Full/summary formats, featured project filtering, data assembly
- `search-projects.test.ts` — Query/technology filtering, case-insensitivity, empty results, combined filters

**Config:** `server/vitest.config.ts` — Node environment, globals enabled.

## Widget Tests

Located in `web/src/components/<ComponentName>/<ComponentName>.test.tsx`. Component tests using React Testing Library.

**What's tested:**
- Each component renders correct data (names, titles, descriptions, etc.)
- Interactive elements (links with correct hrefs, `target="_blank"`)
- Conditional rendering (featured badges, impact sections, empty states)
- Focus highlighting (`ExperienceTimeline` with `focusId`)

**Config:** `web/vitest.config.ts` — jsdom environment, React plugin, global setup file.

**Setup file:** `web/src/test/setup.tsx` — Mocks for:
- `@openai/apps-sdk-ui` components (Avatar, Badge)
- `@modelcontextprotocol/ext-apps/react` (useApp hook)
- Profile image asset (avoids bundling 65KB base64 in tests)

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
