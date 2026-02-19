# Tier 3: New Tools — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add five new MCP tools (`ask_anything`, `get_availability`, `compare_skills`, `get_recommendations`, `track_analytics`) with matching widget views, a search abstraction layer, and full test coverage.

**Architecture:** Approach A — extend existing `schema + handler + register` pattern. New `server/src/search/` directory holds a `SearchProvider` interface and a `KeywordSearchProvider` default implementation. All five tools follow the same conventions as existing tools. Three new React widget components added.

**Tech Stack:** Node.js + TypeScript + Zod (server), React 18 + Tailwind (widget), Vitest + React Testing Library (tests). No new dependencies.

---

## Task 1: Data layer — add Recommendation type and seed data

**Files:**
- Modify: `server/src/data/aneeq-data.ts`
- Modify: `web/src/types.ts`

**Step 1: Add `Recommendation` interface and field to `aneeq-data.ts`**

In `server/src/data/aneeq-data.ts`, after the `Contact` interface, add:

```typescript
export interface Recommendation {
  id: string;
  author: string;
  role: string;
  company: string;
  text: string;
  linkedIn?: string;
}
```

Add `recommendations: Recommendation[];` to the `AneeqData` interface.

Add a `recommendations` array to `aneeqData` (replace placeholders with real testimonials):

```typescript
recommendations: [
  {
    id: "rec-1",
    author: "Jane Smith",
    role: "Senior Engineering Manager",
    company: "Dayforce",
    text: "Aneeq consistently delivers beyond expectations. His ability to architect complex AI systems while keeping code clean and maintainable is rare for someone at his career stage.",
    linkedIn: "https://linkedin.com/in/janesmith",
  },
  {
    id: "rec-2",
    author: "John Doe",
    role: "Staff Engineer",
    company: "Koho Financial",
    text: "Working with Aneeq was a pleasure. He took ownership of the Google Pay integration end-to-end and drove it to $2M in transactions with minimal oversight.",
  },
  {
    id: "rec-3",
    author: "Alex Chen",
    role: "Engineering Lead",
    company: "Learning Mode AI",
    text: "Aneeq ramped up on our Go microservices stack incredibly fast and shipped production-quality features in his first week. Strong communicator and team player.",
    linkedIn: "https://linkedin.com/in/alexchen",
  },
],
```

**Step 2: Update `web/src/types.ts`**

Add `Recommendation` interface (after `Contact`):

```typescript
export interface Recommendation {
  id: string;
  author: string;
  role: string;
  company: string;
  text: string;
  linkedIn?: string;
}
```

Add `SkillMatch` interface (after `Recommendation`):

```typescript
export interface SkillMatch {
  name: string;
  proficiency: "expert" | "advanced" | "intermediate" | "not found";
  category: string | null;
}
```

Extend `ViewType` to include new views:

```typescript
export type ViewType =
  | "overview"
  | "experience"
  | "projects"
  | "skills"
  | "education"
  | "contact"
  | "hobbies"
  | "resume"
  | "recommendations"
  | "availability"
  | "skill-comparison"
  | "analytics";
```

**Step 3: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0, no errors

**Step 4: Commit**

```bash
git add server/src/data/aneeq-data.ts web/src/types.ts
git commit -m "feat: add Recommendation type and seed data to data layer"
```

---

## Task 2: Search provider interface

**Files:**
- Create: `server/src/search/provider.ts`

**Step 1: Create the interface**

```typescript
// server/src/search/provider.ts
import type { AneeqData } from "../data/aneeq-data.js";

export interface SearchResult {
  view: string;
  data: unknown;
  score: number;
  matchedFields: string[];
}

export interface SearchProvider {
  search(query: string, data: AneeqData): SearchResult[];
}
```

**Step 2: Verify types compile**

Run: `npm run typecheck`
Expected: exit 0

**Step 3: Commit**

```bash
git add server/src/search/provider.ts
git commit -m "feat: add SearchProvider interface for ask_anything abstraction"
```

---

## Task 3: KeywordSearchProvider (TDD)

**Files:**
- Create: `server/src/search/keyword-provider.test.ts`
- Create: `server/src/search/keyword-provider.ts`

**Step 1: Write the failing tests**

```typescript
// server/src/search/keyword-provider.test.ts
import { describe, it, expect } from "vitest";
import { KeywordSearchProvider } from "./keyword-provider.js";
import { aneeqData } from "../data/aneeq-data.js";

const provider = new KeywordSearchProvider();

describe("KeywordSearchProvider", () => {
  it("returns empty array for empty query", () => {
    const results = provider.search("", aneeqData);
    expect(results).toHaveLength(0);
  });

  it("returns empty array for whitespace-only query", () => {
    const results = provider.search("   ", aneeqData);
    expect(results).toHaveLength(0);
  });

  it("matches experience by company name", () => {
    const results = provider.search("Dayforce", aneeqData);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].view).toBe("experience");
    expect(results[0].matchedFields).toContain("company");
  });

  it("matches projects by name", () => {
    const results = provider.search("MailflowAI", aneeqData);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].view).toBe("projects");
  });

  it("matches skills by name", () => {
    const results = provider.search("Python", aneeqData);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.view === "skills")).toBe(true);
  });

  it("is case-insensitive", () => {
    const lower = provider.search("python", aneeqData);
    const upper = provider.search("PYTHON", aneeqData);
    expect(lower.length).toBe(upper.length);
  });

  it("returns results sorted by score descending", () => {
    const results = provider.search("Python", aneeqData);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("returns empty array when nothing matches", () => {
    const results = provider.search("xyznonexistent999", aneeqData);
    expect(results).toHaveLength(0);
  });

  it("multi-token query scores higher for more matches", () => {
    const single = provider.search("Python", aneeqData);
    const multi = provider.search("Python AI engineer", aneeqData);
    const singleTop = single[0]?.score ?? 0;
    const multiTop = multi[0]?.score ?? 0;
    expect(multiTop).toBeGreaterThanOrEqual(singleTop);
  });

  it("each result has required fields", () => {
    const results = provider.search("experience", aneeqData);
    for (const r of results) {
      expect(r).toHaveProperty("view");
      expect(r).toHaveProperty("data");
      expect(typeof r.score).toBe("number");
      expect(Array.isArray(r.matchedFields)).toBe(true);
    }
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:server -- --reporter=verbose keyword-provider`
Expected: FAIL — "Cannot find module './keyword-provider.js'"

**Step 3: Implement `KeywordSearchProvider`**

```typescript
// server/src/search/keyword-provider.ts
import type { AneeqData } from "../data/aneeq-data.js";
import type { SearchProvider, SearchResult } from "./provider.js";

type ScoredField = [fieldName: string, value: string, weight: number];

export class KeywordSearchProvider implements SearchProvider {
  search(query: string, data: AneeqData): SearchResult[] {
    if (!query.trim()) return [];

    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];

    // Experience
    for (const exp of data.experience) {
      const fields: ScoredField[] = [
        ["company", exp.company, 2],
        ["role", exp.role, 2],
        ["technologies", exp.technologies.join(" "), 1],
        ["achievements", exp.achievements.join(" "), 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "experience", data: [exp], score, matchedFields });
      }
    }

    // Projects
    for (const project of data.projects) {
      const fields: ScoredField[] = [
        ["name", project.name, 2],
        ["techStack", project.techStack.join(" "), 1],
        ["description", project.description, 1],
        ["impact", project.impact ?? "", 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "projects", data: [project], score, matchedFields });
      }
    }

    // Skills (score per category, but always return the full skills array)
    const skillScores: { score: number; matchedFields: string[] }[] = [];
    for (const cat of data.skills) {
      const fields: ScoredField[] = [
        ["category", cat.category, 2],
        ["skills", cat.skills.map((s) => s.name).join(" "), 1],
      ];
      skillScores.push(this.score(tokens, fields));
    }
    const bestSkill = skillScores.reduce(
      (best, s) => (s.score > best.score ? s : best),
      { score: 0, matchedFields: [] as string[] },
    );
    if (bestSkill.score > 0) {
      results.push({ view: "skills", data: data.skills, ...bestSkill });
    }

    // Overview
    const overviewFields: ScoredField[] = [
      ["name", data.overview.name, 2],
      ["title", data.overview.title, 2],
      ["tagline", data.overview.tagline, 1],
    ];
    const overviewScore = this.score(tokens, overviewFields);
    if (overviewScore.score > 0) {
      results.push({ view: "overview", data: data.overview, ...overviewScore });
    }

    // Education
    for (const edu of data.education) {
      const fields: ScoredField[] = [
        ["institution", edu.institution, 2],
        ["degree", edu.degree, 2],
        ["field", edu.field, 1],
        ["highlights", edu.highlights.join(" "), 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "education", data: data.education, score, matchedFields });
      }
    }

    // Recommendations
    for (const rec of data.recommendations) {
      const fields: ScoredField[] = [
        ["author", rec.author, 2],
        ["company", rec.company, 1],
        ["role", rec.role, 1],
        ["text", rec.text, 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "recommendations", data: [rec], score, matchedFields });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private score(
    tokens: string[],
    fields: ScoredField[],
  ): { score: number; matchedFields: string[] } {
    let score = 0;
    const matchedFields: string[] = [];

    for (const [fieldName, value, weight] of fields) {
      if (!value) continue;
      const lower = value.toLowerCase();
      const hits = tokens.filter((t) => lower.includes(t)).length;
      if (hits > 0) {
        score += hits * weight;
        matchedFields.push(fieldName);
      }
    }

    return { score, matchedFields };
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:server -- --reporter=verbose keyword-provider`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add server/src/search/keyword-provider.ts server/src/search/keyword-provider.test.ts
git commit -m "feat: implement KeywordSearchProvider with weighted field scoring"
```

---

## Task 4: `track_analytics` tool (TDD)

**Files:**
- Create: `server/src/tools/track-analytics.test.ts`
- Create: `server/src/tools/track-analytics.ts`
- Modify: `server/src/tools/index.ts`

**Step 1: Write the failing tests**

```typescript
// server/src/tools/track-analytics.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleTrackAnalytics } from "./track-analytics.js";
import { logger } from "../logger.js";

describe("track_analytics tool", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("logs an analytics event with the correct shape", async () => {
    const spy = vi.spyOn(logger, "info");

    await handleTrackAnalytics({ tool: "ask_about_aneeq", category: "skills" });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ analytics: true, tool: "ask_about_aneeq", category: "skills" }),
      "analytics event",
    );
  });

  it("logs optional query when provided", async () => {
    const spy = vi.spyOn(logger, "info");

    await handleTrackAnalytics({ tool: "ask_anything", query: "What is Aneeq's experience?" });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ analytics: true, query: "What is Aneeq's experience?" }),
      "analytics event",
    );
  });

  it("returns acknowledgement text content", async () => {
    vi.spyOn(logger, "info");
    const result = await handleTrackAnalytics({ tool: "get_resume" });

    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toBe("Query logged.");
  });

  it("works with only required tool field", async () => {
    const spy = vi.spyOn(logger, "info");

    await expect(handleTrackAnalytics({ tool: "get_resume" })).resolves.toBeDefined();
    expect(spy).toHaveBeenCalledOnce();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:server -- --reporter=verbose track-analytics`
Expected: FAIL — "Cannot find module './track-analytics.js'"

**Step 3: Implement the tool**

```typescript
// server/src/tools/track-analytics.ts
import { z } from "zod";
import { logger } from "../logger.js";

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

  return {
    structuredContent: { view: "analytics", data: { logged: true } },
    content: [{ type: "text" as const, text: "Query logged." }],
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:server -- --reporter=verbose track-analytics`
Expected: All tests PASS

**Step 5: Register in `tools/index.ts`**

Add import at top:
```typescript
import {
  trackAnalyticsSchema,
  handleTrackAnalytics,
} from "./track-analytics.js";
```

Add registration inside `registerTools`:
```typescript
registerAppTool(
  server,
  "track_analytics",
  {
    title: "Track Analytics",
    description:
      "Log a query event for analytics. Call this alongside other tools to record what visitors are asking about Aneeq.",
    inputSchema: trackAnalyticsSchema,
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
    _meta: {
      ui: { resourceUri: "ui://widget/aneeq-profile.html" },
    },
  },
  handleTrackAnalytics,
);
```

**Step 6: Run full server test suite**

Run: `npm run test:server`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add server/src/tools/track-analytics.ts server/src/tools/track-analytics.test.ts server/src/tools/index.ts
git commit -m "feat: add track_analytics tool with pino structured logging"
```

---

## Task 5: `get_availability` tool (TDD)

**Files:**
- Create: `server/src/tools/get-availability.test.ts`
- Create: `server/src/tools/get-availability.ts`
- Modify: `server/src/tools/index.ts`

**Step 1: Write the failing tests**

```typescript
// server/src/tools/get-availability.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { handleGetAvailability } from "./get-availability.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("get_availability tool", () => {
  const originalEnv = process.env.CALENDLY_URL;

  beforeEach(() => {
    delete process.env.CALENDLY_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CALENDLY_URL = originalEnv;
    } else {
      delete process.env.CALENDLY_URL;
    }
  });

  it("returns CALENDLY_URL from environment when set", async () => {
    process.env.CALENDLY_URL = "https://calendly.com/aneeq";
    const result = await handleGetAvailability({});

    expect(result.structuredContent.view).toBe("availability");
    expect(result.structuredContent.data.bookingUrl).toBe("https://calendly.com/aneeq");
  });

  it("falls back to portfolio URL when CALENDLY_URL is not set", async () => {
    const result = await handleGetAvailability({});

    expect(result.structuredContent.data.bookingUrl).toBe(aneeqData.contact.portfolio);
  });

  it("includes name in structured content", async () => {
    const result = await handleGetAvailability({});

    expect(result.structuredContent.data.name).toBe(aneeqData.overview.name);
  });

  it("returns text content with booking URL", async () => {
    process.env.CALENDLY_URL = "https://calendly.com/aneeq";
    const result = await handleGetAvailability({});

    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("https://calendly.com/aneeq");
    expect(result.content[0].text).toContain(aneeqData.overview.name);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:server -- --reporter=verbose get-availability`
Expected: FAIL — "Cannot find module './get-availability.js'"

**Step 3: Implement the tool**

```typescript
// server/src/tools/get-availability.ts
import { aneeqData } from "../data/aneeq-data.js";

export const getAvailabilitySchema = {};

export type GetAvailabilityInput = Record<string, never>;

export async function handleGetAvailability(_input: GetAvailabilityInput) {
  const bookingUrl =
    process.env.CALENDLY_URL ?? aneeqData.contact.portfolio;

  return {
    structuredContent: {
      view: "availability",
      data: { bookingUrl, name: aneeqData.overview.name },
    },
    content: [
      {
        type: "text" as const,
        text: `Schedule time with ${aneeqData.overview.name}: ${bookingUrl}`,
      },
    ],
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:server -- --reporter=verbose get-availability`
Expected: All tests PASS

**Step 5: Register in `tools/index.ts`**

Add import:
```typescript
import {
  getAvailabilitySchema,
  handleGetAvailability,
} from "./get-availability.js";
```

Add registration:
```typescript
registerAppTool(
  server,
  "get_availability",
  {
    title: "Get Availability",
    description:
      "Get a link to schedule time with Aneeq Hassan — for coffee chats, interviews, or collaboration.",
    inputSchema: getAvailabilitySchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
    _meta: {
      ui: { resourceUri: "ui://widget/aneeq-profile.html" },
    },
  },
  handleGetAvailability,
);
```

**Step 6: Run full server test suite**

Run: `npm run test:server`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add server/src/tools/get-availability.ts server/src/tools/get-availability.test.ts server/src/tools/index.ts
git commit -m "feat: add get_availability tool with Calendly env var support"
```

---

## Task 6: `get_recommendations` tool (TDD)

**Files:**
- Create: `server/src/tools/get-recommendations.test.ts`
- Create: `server/src/tools/get-recommendations.ts`
- Modify: `server/src/tools/index.ts`

**Step 1: Write the failing tests**

```typescript
// server/src/tools/get-recommendations.test.ts
import { describe, it, expect } from "vitest";
import { handleGetRecommendations } from "./get-recommendations.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("get_recommendations tool", () => {
  it("returns all recommendations by default", async () => {
    const result = await handleGetRecommendations({});

    expect(result.structuredContent.view).toBe("recommendations");
    expect(result.structuredContent.data).toHaveLength(
      aneeqData.recommendations.length,
    );
  });

  it("respects the limit parameter", async () => {
    const result = await handleGetRecommendations({ limit: 1 });

    expect(result.structuredContent.data).toHaveLength(1);
  });

  it("returns full list when limit exceeds total", async () => {
    const result = await handleGetRecommendations({ limit: 999 });

    expect(result.structuredContent.data).toHaveLength(
      aneeqData.recommendations.length,
    );
  });

  it("returns text content with count", async () => {
    const result = await handleGetRecommendations({});
    const count = aneeqData.recommendations.length;

    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain(String(count));
  });

  it("handles empty recommendations gracefully", async () => {
    // Temporarily mock empty recommendations
    const original = aneeqData.recommendations;
    (aneeqData as any).recommendations = [];

    const result = await handleGetRecommendations({});
    expect(result.structuredContent.data).toHaveLength(0);
    expect(result.content[0].text).toContain("0");

    (aneeqData as any).recommendations = original;
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:server -- --reporter=verbose get-recommendations`
Expected: FAIL — "Cannot find module './get-recommendations.js'"

**Step 3: Implement the tool**

```typescript
// server/src/tools/get-recommendations.ts
import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const getRecommendationsSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Max number of recommendations to return (default: all)"),
};

export type GetRecommendationsInput = { limit?: number };

export async function handleGetRecommendations(
  input: GetRecommendationsInput,
) {
  const recs =
    input.limit !== undefined
      ? aneeqData.recommendations.slice(0, input.limit)
      : aneeqData.recommendations;

  const count = recs.length;

  return {
    structuredContent: { view: "recommendations", data: recs },
    content: [
      {
        type: "text" as const,
        text: `${count} recommendation${count !== 1 ? "s" : ""} from people who've worked with ${aneeqData.overview.name}.`,
      },
    ],
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:server -- --reporter=verbose get-recommendations`
Expected: All tests PASS

**Step 5: Register in `tools/index.ts`**

Add import:
```typescript
import {
  getRecommendationsSchema,
  handleGetRecommendations,
} from "./get-recommendations.js";
```

Add registration:
```typescript
registerAppTool(
  server,
  "get_recommendations",
  {
    title: "Get Recommendations",
    description:
      "Retrieve testimonials and endorsements from people who have worked with Aneeq Hassan.",
    inputSchema: getRecommendationsSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
    _meta: {
      ui: { resourceUri: "ui://widget/aneeq-profile.html" },
    },
  },
  handleGetRecommendations,
);
```

**Step 6: Run full server test suite**

Run: `npm run test:server`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add server/src/tools/get-recommendations.ts server/src/tools/get-recommendations.test.ts server/src/tools/index.ts
git commit -m "feat: add get_recommendations tool with static testimonial data"
```

---

## Task 7: `compare_skills` tool (TDD)

**Files:**
- Create: `server/src/tools/compare-skills.test.ts`
- Create: `server/src/tools/compare-skills.ts`
- Modify: `server/src/tools/index.ts`

**Step 1: Write the failing tests**

```typescript
// server/src/tools/compare-skills.test.ts
import { describe, it, expect } from "vitest";
import { handleCompareSkills } from "./compare-skills.js";

describe("compare_skills tool", () => {
  it("returns correct view", async () => {
    const result = await handleCompareSkills({ skills: ["Python", "Go"] });
    expect(result.structuredContent.view).toBe("skill-comparison");
  });

  it("returns proficiency for known skills (case-insensitive)", async () => {
    const result = await handleCompareSkills({ skills: ["python", "typescript"] });
    const data = result.structuredContent.data as Array<{
      name: string;
      proficiency: string;
      category: string | null;
    }>;

    expect(data).toHaveLength(2);
    expect(data[0].proficiency).not.toBe("not found");
    expect(data[1].proficiency).not.toBe("not found");
  });

  it("returns 'not found' for unknown skills", async () => {
    const result = await handleCompareSkills({ skills: ["COBOL", "Python"] });
    const data = result.structuredContent.data as Array<{
      name: string;
      proficiency: string;
    }>;

    const cobol = data.find((d) => d.name === "COBOL");
    expect(cobol?.proficiency).toBe("not found");
  });

  it("returns category for known skills", async () => {
    const result = await handleCompareSkills({ skills: ["React"] });
    const data = result.structuredContent.data as Array<{
      name: string;
      category: string | null;
    }>;

    expect(data[0].category).toBe("Frontend");
  });

  it("returns null category for unknown skills", async () => {
    const result = await handleCompareSkills({ skills: ["COBOL"] });
    const data = result.structuredContent.data as Array<{
      category: string | null;
    }>;

    expect(data[0].category).toBeNull();
  });

  it("returns result for every requested skill", async () => {
    const skills = ["Python", "React", "UnknownTech"];
    const result = await handleCompareSkills({ skills });
    expect(result.structuredContent.data).toHaveLength(3);
  });

  it("returns text content summarizing comparison", async () => {
    const result = await handleCompareSkills({ skills: ["Python", "Go"] });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Python");
    expect(result.content[0].text).toContain("Go");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:server -- --reporter=verbose compare-skills`
Expected: FAIL — "Cannot find module './compare-skills.js'"

**Step 3: Implement the tool**

```typescript
// server/src/tools/compare-skills.ts
import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const compareSkillsSchema = {
  skills: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("1–4 skill names to look up (e.g. ['Python', 'Go', 'TypeScript'])"),
};

export type CompareSkillsInput = { skills: string[] };

export interface SkillMatch {
  name: string;
  proficiency: "expert" | "advanced" | "intermediate" | "not found";
  category: string | null;
}

export async function handleCompareSkills(input: CompareSkillsInput) {
  const matches: SkillMatch[] = input.skills.map((skillName) => {
    const lower = skillName.toLowerCase();
    for (const cat of aneeqData.skills) {
      const skill = cat.skills.find((s) => s.name.toLowerCase() === lower);
      if (skill) {
        return { name: skill.name, proficiency: skill.proficiency, category: cat.category };
      }
    }
    return { name: skillName, proficiency: "not found" as const, category: null };
  });

  const textParts = matches.map((m) =>
    m.proficiency === "not found"
      ? `${m.name}: not in skill set`
      : `${m.name}: ${m.proficiency} (${m.category})`,
  );

  return {
    structuredContent: { view: "skill-comparison", data: matches },
    content: [{ type: "text" as const, text: textParts.join(" | ") }],
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:server -- --reporter=verbose compare-skills`
Expected: All tests PASS

**Step 5: Register in `tools/index.ts`**

Add import:
```typescript
import {
  compareSkillsSchema,
  handleCompareSkills,
} from "./compare-skills.js";
```

Add registration:
```typescript
registerAppTool(
  server,
  "compare_skills",
  {
    title: "Compare Skills",
    description:
      "Look up and compare Aneeq Hassan's proficiency in one or more technologies. Pass up to 4 skill names.",
    inputSchema: compareSkillsSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
    _meta: {
      ui: { resourceUri: "ui://widget/aneeq-profile.html" },
    },
  },
  handleCompareSkills,
);
```

**Step 6: Run full server test suite**

Run: `npm run test:server`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add server/src/tools/compare-skills.ts server/src/tools/compare-skills.test.ts server/src/tools/index.ts
git commit -m "feat: add compare_skills tool with case-insensitive proficiency lookup"
```

---

## Task 8: `ask_anything` tool (TDD)

**Files:**
- Create: `server/src/tools/ask-anything.test.ts`
- Create: `server/src/tools/ask-anything.ts`
- Modify: `server/src/tools/index.ts`

**Step 1: Write the failing tests**

```typescript
// server/src/tools/ask-anything.test.ts
import { describe, it, expect } from "vitest";
import { handleAskAnything } from "./ask-anything.js";

describe("ask_anything tool", () => {
  it("returns a result for a known topic", async () => {
    const result = await handleAskAnything({ query: "Python experience" });

    expect(result.structuredContent).toBeDefined();
    expect(result.content[0].type).toBe("text");
  });

  it("returns a view matching the top result type", async () => {
    const result = await handleAskAnything({ query: "Dayforce" });

    expect(result.structuredContent.view).toBe("experience");
  });

  it("returns projects view for project query", async () => {
    const result = await handleAskAnything({ query: "MailflowAI" });

    expect(result.structuredContent.view).toBe("projects");
  });

  it("returns fallback overview when nothing matches", async () => {
    const result = await handleAskAnything({ query: "xyznonexistent999" });

    expect(result.structuredContent.view).toBe("overview");
    expect(result.content[0].text).toContain("couldn't find");
  });

  it("includes searchQuery in structured content", async () => {
    const result = await handleAskAnything({ query: "React skills" });

    expect(result.structuredContent.searchQuery).toBe("React skills");
  });

  it("always returns text content", async () => {
    const result = await handleAskAnything({ query: "anything" });

    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text.length).toBeGreaterThan(0);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:server -- --reporter=verbose ask-anything`
Expected: FAIL — "Cannot find module './ask-anything.js'"

**Step 3: Implement the tool**

```typescript
// server/src/tools/ask-anything.ts
import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";
import { KeywordSearchProvider } from "../search/keyword-provider.js";

export const askAnythingSchema = {
  query: z.string().min(1).describe("Any question about Aneeq Hassan"),
};

export type AskAnythingInput = { query: string };

export async function handleAskAnything(input: AskAnythingInput) {
  const { query } = input;
  const provider = new KeywordSearchProvider();
  const results = provider.search(query, aneeqData);

  if (results.length === 0) {
    return {
      structuredContent: {
        view: "overview",
        data: aneeqData.overview,
        searchQuery: query,
      },
      content: [
        {
          type: "text" as const,
          text: `I couldn't find specific information about "${query}". Try asking about experience, projects, skills, education, or contact details.`,
        },
      ],
    };
  }

  const top = results[0];
  return {
    structuredContent: { view: top.view, data: top.data, searchQuery: query },
    content: [
      {
        type: "text" as const,
        text: `Found information about "${query}" (matched: ${top.matchedFields.join(", ")}).`,
      },
    ],
  };
}
```

**Step 4: Run tests to verify they pass**

Run: `npm run test:server -- --reporter=verbose ask-anything`
Expected: All tests PASS

**Step 5: Register in `tools/index.ts`**

Add import:
```typescript
import { askAnythingSchema, handleAskAnything } from "./ask-anything.js";
```

Add registration:
```typescript
registerAppTool(
  server,
  "ask_anything",
  {
    title: "Ask Anything About Aneeq",
    description:
      "Free-form search across all of Aneeq Hassan's profile data. Use this when the question doesn't fit a specific category — it will find the most relevant information.",
    inputSchema: askAnythingSchema,
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
    _meta: {
      ui: { resourceUri: "ui://widget/aneeq-profile.html" },
    },
  },
  handleAskAnything,
);
```

**Step 6: Run full server test suite**

Run: `npm run test:server`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add server/src/tools/ask-anything.ts server/src/tools/ask-anything.test.ts server/src/tools/index.ts
git commit -m "feat: add ask_anything tool with keyword search and graceful fallback"
```

---

## Task 9: `RecommendationsCard` widget component (TDD)

**Files:**
- Create: `web/src/components/RecommendationsCard/RecommendationsCard.test.tsx`
- Create: `web/src/components/RecommendationsCard/RecommendationsCard.tsx`
- Create: `web/src/components/RecommendationsCard/index.ts`

**Step 1: Write the failing tests**

```tsx
// web/src/components/RecommendationsCard/RecommendationsCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationsCard } from "./RecommendationsCard";
import type { Recommendation } from "../../types";

const mockRecs: Recommendation[] = [
  {
    id: "rec-1",
    author: "Jane Smith",
    role: "Engineering Manager",
    company: "Acme Corp",
    text: "Outstanding developer with exceptional skills.",
    linkedIn: "https://linkedin.com/in/janesmith",
  },
  {
    id: "rec-2",
    author: "Bob Jones",
    role: "Staff Engineer",
    company: "Beta Inc",
    text: "A pleasure to work with.",
  },
];

describe("RecommendationsCard", () => {
  it("renders each recommendation's author", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("renders role and company", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getByText("Engineering Manager at Acme Corp")).toBeInTheDocument();
  });

  it("renders the testimonial text", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getByText(/Outstanding developer/)).toBeInTheDocument();
  });

  it("renders LinkedIn link when provided", () => {
    render(<RecommendationsCard data={mockRecs} />);
    const link = screen.getByRole("link", { name: /LinkedIn/i });
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/janesmith");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not render LinkedIn link when not provided", () => {
    render(<RecommendationsCard data={[mockRecs[1]]} />);
    expect(screen.queryByRole("link", { name: /LinkedIn/i })).not.toBeInTheDocument();
  });

  it("renders all recommendations", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getAllByText(/at /)).toHaveLength(2);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:web -- --reporter=verbose RecommendationsCard`
Expected: FAIL — "Cannot find module './RecommendationsCard'"

**Step 3: Implement the component**

```tsx
// web/src/components/RecommendationsCard/RecommendationsCard.tsx
import type { Recommendation } from "../../types";

interface Props {
  data: Recommendation[];
}

export function RecommendationsCard({ data }: Props) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-md">Recommendations</h2>
      {data.map((rec) => (
        <div
          key={rec.id}
          className="rounded-xl border border-default bg-surface p-5 shadow-sm"
        >
          <p className="text-sm text-secondary italic mb-4">
            &ldquo;{rec.text}&rdquo;
          </p>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{rec.author}</p>
              <p className="text-xs text-secondary">
                {rec.role} at {rec.company}
              </p>
            </div>
            {rec.linkedIn && (
              <a
                href={rec.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-text-info)] shrink-0"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 4: Create the barrel export**

```typescript
// web/src/components/RecommendationsCard/index.ts
export { RecommendationsCard } from "./RecommendationsCard";
```

**Step 5: Run tests to verify they pass**

Run: `npm run test:web -- --reporter=verbose RecommendationsCard`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add web/src/components/RecommendationsCard/
git commit -m "feat: add RecommendationsCard widget component"
```

---

## Task 10: `AvailabilityCard` widget component (TDD)

**Files:**
- Create: `web/src/components/AvailabilityCard/AvailabilityCard.test.tsx`
- Create: `web/src/components/AvailabilityCard/AvailabilityCard.tsx`
- Create: `web/src/components/AvailabilityCard/index.ts`

**Step 1: Write the failing tests**

```tsx
// web/src/components/AvailabilityCard/AvailabilityCard.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvailabilityCard } from "./AvailabilityCard";

const mockData = {
  bookingUrl: "https://calendly.com/aneeq",
  name: "Aneeq Hassan",
};

describe("AvailabilityCard", () => {
  it("renders the person's name", () => {
    render(<AvailabilityCard data={mockData} />);
    expect(screen.getByText(/Aneeq Hassan/)).toBeInTheDocument();
  });

  it("renders a booking link with correct href", () => {
    render(<AvailabilityCard data={mockData} />);
    const link = screen.getByRole("link", { name: /Book a Meeting/i });
    expect(link).toHaveAttribute("href", "https://calendly.com/aneeq");
  });

  it("opens booking link in new tab", () => {
    render(<AvailabilityCard data={mockData} />);
    const link = screen.getByRole("link", { name: /Book a Meeting/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:web -- --reporter=verbose AvailabilityCard`
Expected: FAIL — "Cannot find module './AvailabilityCard'"

**Step 3: Implement the component**

```tsx
// web/src/components/AvailabilityCard/AvailabilityCard.tsx
interface Props {
  data: { bookingUrl: string; name: string };
}

export function AvailabilityCard({ data }: Props) {
  return (
    <div className="rounded-xl border border-default bg-surface p-5 shadow-sm animate-fade-in">
      <h2 className="heading-md mb-1">Schedule Time with {data.name}</h2>
      <p className="text-sm text-secondary mb-4">
        Available for coffee chats, interviews, or collaborations.
      </p>
      <a
        href={data.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--color-background-info-surface)] text-[var(--color-text-info)] text-sm font-medium hover:opacity-80 transition-opacity"
      >
        Book a Meeting
      </a>
    </div>
  );
}
```

**Step 4: Create the barrel export**

```typescript
// web/src/components/AvailabilityCard/index.ts
export { AvailabilityCard } from "./AvailabilityCard";
```

**Step 5: Run tests to verify they pass**

Run: `npm run test:web -- --reporter=verbose AvailabilityCard`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add web/src/components/AvailabilityCard/
git commit -m "feat: add AvailabilityCard widget component with Calendly CTA"
```

---

## Task 11: `SkillComparisonView` widget component (TDD)

**Files:**
- Create: `web/src/components/SkillComparisonView/SkillComparisonView.test.tsx`
- Create: `web/src/components/SkillComparisonView/SkillComparisonView.tsx`
- Create: `web/src/components/SkillComparisonView/index.ts`

**Step 1: Write the failing tests**

```tsx
// web/src/components/SkillComparisonView/SkillComparisonView.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillComparisonView } from "./SkillComparisonView";
import type { SkillMatch } from "../../types";

const mockData: SkillMatch[] = [
  { name: "Python", proficiency: "expert", category: "Languages" },
  { name: "Go", proficiency: "advanced", category: "Languages" },
  { name: "COBOL", proficiency: "not found", category: null },
];

describe("SkillComparisonView", () => {
  it("renders each skill name", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("COBOL")).toBeInTheDocument();
  });

  it("renders proficiency labels for known skills", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getByText("expert")).toBeInTheDocument();
    expect(screen.getByText("advanced")).toBeInTheDocument();
  });

  it("renders 'not found' for unknown skills", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getByText("not found")).toBeInTheDocument();
  });

  it("renders category label for known skills", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getAllByText("Languages")).toHaveLength(2);
  });

  it("renders all skill cards", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getAllByText(/Python|Go|COBOL/)).toHaveLength(3);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm run test:web -- --reporter=verbose SkillComparisonView`
Expected: FAIL — "Cannot find module './SkillComparisonView'"

**Step 3: Implement the component**

```tsx
// web/src/components/SkillComparisonView/SkillComparisonView.tsx
import type { SkillMatch } from "../../types";

const proficiencyColor: Record<string, string> = {
  expert: "text-[var(--color-text-success)] bg-[var(--color-background-success-surface)]",
  advanced: "text-[var(--color-text-info)] bg-[var(--color-background-info-surface)]",
  intermediate: "text-secondary bg-surface",
  "not found": "text-[var(--color-text-error-soft)] bg-[var(--color-background-error-surface)]",
};

interface Props {
  data: SkillMatch[];
}

export function SkillComparisonView({ data }: Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="heading-md mb-3">Skill Comparison</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.map((skill) => (
          <div
            key={skill.name}
            className="rounded-xl border border-default bg-surface p-4 shadow-sm flex flex-col gap-2"
          >
            <p className="text-sm font-medium">{skill.name}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${proficiencyColor[skill.proficiency] ?? ""}`}
            >
              {skill.proficiency}
            </span>
            {skill.category && (
              <p className="text-xs text-secondary">{skill.category}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 4: Create the barrel export**

```typescript
// web/src/components/SkillComparisonView/index.ts
export { SkillComparisonView } from "./SkillComparisonView";
```

**Step 5: Run tests to verify they pass**

Run: `npm run test:web -- --reporter=verbose SkillComparisonView`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add web/src/components/SkillComparisonView/
git commit -m "feat: add SkillComparisonView widget component with proficiency badges"
```

---

## Task 12: Wire new views into `App.tsx`

**Files:**
- Modify: `web/src/App.tsx`

**Step 1: Add imports for the three new components**

At the top of `web/src/App.tsx`, add:
```typescript
import { RecommendationsCard } from "./components/RecommendationsCard";
import { AvailabilityCard } from "./components/AvailabilityCard";
import { SkillComparisonView } from "./components/SkillComparisonView";
```

**Step 2: Add view cases inside the returned JSX**

After the `{view === "resume" && ...}` block, add:

```tsx
{view === "recommendations" && <RecommendationsCard data={data} />}

{view === "availability" && <AvailabilityCard data={data} />}

{view === "skill-comparison" && <SkillComparisonView data={data} />}
```

**Step 3: Run typecheck and full test suite**

Run: `npm run typecheck && npm test`
Expected: exit 0, all tests PASS

**Step 4: Commit**

```bash
git add web/src/App.tsx
git commit -m "feat: wire recommendations, availability, and skill-comparison views into App"
```

---

## Task 13: Update environment config and documentation

**Files:**
- Modify: `.env.example`
- Modify: `CLAUDE.md`
- Modify: `docs/project-structure.md`
- Modify: `docs/testing.md`
- Modify: `SCALE_PLAN.md`

**Step 1: Add `CALENDLY_URL` to `.env.example`**

Add after `RATE_LIMIT_MAX`:
```bash
# Calendly booking link for get_availability tool
# CALENDLY_URL=https://calendly.com/your-handle
```

**Step 2: Update tools table in `CLAUDE.md`**

Replace the existing `## Tools` table with:

```markdown
| Tool                  | Description                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `ask_about_aneeq`     | Query by category: overview, experience, projects, skills, education, contact, hobbies, current-role |
| `get_resume`          | Full or summary resume format                                                                        |
| `search_projects`     | Filter projects by keyword or technology                                                             |
| `ask_anything`        | Free-form keyword search across all profile data                                                     |
| `get_availability`    | Return a Calendly booking link (reads `CALENDLY_URL` env var)                                        |
| `compare_skills`      | Look up proficiency for 1–4 skills side-by-side                                                     |
| `get_recommendations` | Return testimonials and endorsements                                                                  |
| `track_analytics`     | Log query events as structured pino log entries                                                      |
```

**Step 3: Update `docs/project-structure.md`**

In the `server/src/` section, add `search/` directory:
```
│       ├── search/
│       │   ├── provider.ts           # SearchProvider interface
│       │   ├── keyword-provider.ts   # KeywordSearchProvider
│       │   └── keyword-provider.test.ts
```

Add new tool files to the `tools/` section:
```
│           ├── ask-anything.ts
│           ├── ask-anything.test.ts
│           ├── get-availability.ts
│           ├── get-availability.test.ts
│           ├── compare-skills.ts
│           ├── compare-skills.test.ts
│           ├── get-recommendations.ts
│           ├── get-recommendations.test.ts
│           ├── track-analytics.ts
│           └── track-analytics.test.ts
```

Add new components to the `web/src/components/` section:
```
│           ├── RecommendationsCard/
│           │   ├── RecommendationsCard.tsx
│           │   ├── RecommendationsCard.test.tsx
│           │   └── index.ts
│           ├── AvailabilityCard/
│           │   ├── AvailabilityCard.tsx
│           │   ├── AvailabilityCard.test.tsx
│           │   └── index.ts
│           └── SkillComparisonView/
│               ├── SkillComparisonView.tsx
│               ├── SkillComparisonView.test.tsx
│               └── index.ts
```

**Step 4: Update `docs/testing.md`**

In "Server Tests — What's tested" section, add:
```
- `ask-anything.test.ts` — known topic returns result, fallback on no match, searchQuery in structured content
- `get-availability.test.ts` — returns CALENDLY_URL from env, falls back to portfolio URL
- `compare-skills.test.ts` — known/unknown skills, case-insensitivity, category lookup
- `get-recommendations.test.ts` — all recs returned, limit respected, empty array handled
- `track-analytics.test.ts` — vi.spyOn(logger, 'info') asserts structured event shape
- `keyword-provider.test.ts` — scoring, case-insensitivity, sort order, empty/no-match cases
```

In "Widget Tests — What's tested" section, add:
```
- `RecommendationsCard` — author/role/company/text rendered; LinkedIn link conditional
- `AvailabilityCard` — booking link with correct href/target/rel
- `SkillComparisonView` — skill names, proficiency labels, category labels, not-found state
```

**Step 5: Mark items complete in `SCALE_PLAN.md`**

Change all `- [ ]` under `### New Tools` to `- [x]`.

**Step 6: Run the full CI pipeline**

Run: `npm run ci`
Expected: exit 0 — lint, typecheck, test, build all pass

**Step 7: Final commit**

```bash
git add .env.example CLAUDE.md docs/project-structure.md docs/testing.md SCALE_PLAN.md
git commit -m "docs: update docs, CLAUDE.md, and SCALE_PLAN for Tier 3 new tools"
```

---

## Final verification

Run: `npm run ci`
Expected: All steps pass — lint, typecheck, test (all new + existing), build.

Check test count has grown by verifying new test files are picked up:
Run: `npm test -- --reporter=verbose`
Expected: Approximately 50+ tests passing across server and web workspaces.
