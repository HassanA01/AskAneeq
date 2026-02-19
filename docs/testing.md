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
- `ask-anything.test.ts` — known topic returns result, correct view on top hit, fallback to overview on no match, searchQuery in structured content
- `get-availability.test.ts` — returns CALENDLY_URL from env, falls back to portfolio URL when unset
- `compare-skills.test.ts` — known/unknown skills, case-insensitivity, category lookup, null category
- `get-recommendations.test.ts` — all recs returned, limit respected, handles empty array
- `track-analytics.test.ts` — vi.spyOn(logger, 'info') asserts structured event shape with analytics tag
- `keyword-provider.test.ts` — scoring, case-insensitivity, sort order, empty/no-match cases

**Config:** `server/vitest.config.ts` — Node environment, globals enabled.

## Widget Tests

Located in `web/src/components/<ComponentName>/<ComponentName>.test.tsx`. Component tests using React Testing Library.

**What's tested:**
- Each component renders correct data (names, titles, descriptions, etc.)
- Interactive elements (links with correct hrefs, `target="_blank"`)
- Conditional rendering (featured badges, impact sections, empty states)
- Focus highlighting (`ExperienceTimeline` with `focusId`)
- `RecommendationsCard` — author/role/company/text rendered; LinkedIn link conditional; rel="noopener noreferrer" enforced
- `AvailabilityCard` — booking link with correct href, target="_blank", rel="noopener noreferrer"
- `SkillComparisonView` — skill names, proficiency labels, category labels, not-found state

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
