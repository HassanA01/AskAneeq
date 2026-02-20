# Tier 3: New Tools — Design Document

**Date:** 2026-02-19
**Status:** Approved
**Branch:** feature/tier3-new-tools

---

## Overview

Tier 3 expands the MCP server with five new tools, making the ChatGPT connector more capable and interactive. All tools follow the existing `schema + handler + register` pattern. The only structural addition is a `search/` directory for the `ask_anything` search abstraction.

---

## Approach

**Approach A** — extend existing patterns + search abstraction. See [IDEAS.md](../../IDEAS.md) for Approach B (tool service layer), which is the recommended migration path if tools grow significantly in complexity.

---

## Architecture

### New Files

```
server/src/
  search/
    provider.ts                  # SearchProvider interface + SearchResult type
    keyword-provider.ts          # KeywordSearchProvider (default implementation)
    keyword-provider.test.ts     # Unit tests for search logic
  tools/
    ask-anything.ts              # Free-form Q&A tool
    ask-anything.test.ts
    get-availability.ts          # Calendly booking link tool
    get-availability.test.ts
    compare-skills.ts            # Skill proficiency comparison tool
    compare-skills.test.ts
    get-recommendations.ts       # Testimonials/endorsements tool
    get-recommendations.test.ts
    track-analytics.ts           # Query event logging tool
    track-analytics.test.ts
    index.ts                     # Updated: register all 5 new tools

web/src/components/
  RecommendationsCard/           # New widget view
    RecommendationsCard.tsx
    RecommendationsCard.test.tsx
    index.ts
  AvailabilityCard/              # New widget view
    AvailabilityCard.tsx
    AvailabilityCard.test.tsx
    index.ts
  SkillComparisonView/           # New widget view
    SkillComparisonView.tsx
    SkillComparisonView.test.tsx
    index.ts
```

### Modified Files

```
server/src/data/aneeq-data.ts    # Add Recommendation type + recommendations[]
.env.example                     # Add CALENDLY_URL
web/src/App.tsx                  # Add view cases: recommendations, availability, skill-comparison
docs/project-structure.md        # Update directory layout
CLAUDE.md                        # Update tools table + project structure
README.md                        # Update features section
SCALE_PLAN.md                    # Check off Tier 3 new tools items
```

---

## Tool Specifications

### `ask_anything`

**Purpose:** Free-form Q&A — user asks anything about Aneeq, tool finds the best matching data.

**Input schema:**
```typescript
{ query: z.string().min(1).describe("Any question about Aneeq Hassan") }
```

**Behavior:**
- Passes query to `KeywordSearchProvider`
- Top-scoring result drives the widget view (e.g., an experience hit → `ExperienceTimeline`)
- Graceful fallback if no results: returns a helpful text response with suggestions
- Returns top 3 results in structured content for widget context

**Widget view:** Reuses existing views based on result type. No new component needed.

**Scalability hook:** `SearchProvider` interface — swap `KeywordSearchProvider` for LLM or vector implementation without touching the tool handler.

---

### `get_availability`

**Purpose:** Return a booking link so visitors can schedule time with Aneeq.

**Input schema:** None (no parameters).

**Behavior:**
- Reads `CALENDLY_URL` from `process.env`
- Falls back to `aneeqData.contact.portfolio` if env var is unset
- Returns structured content with URL and CTA text

**Widget view:** New `AvailabilityCard` component — displays a clean booking card with name, link, and button.

**Env var:** `CALENDLY_URL=https://calendly.com/your-handle` (added to `.env.example`)

---

### `compare_skills`

**Purpose:** Compare Aneeq's proficiency across 2–4 skills side-by-side.

**Input schema:**
```typescript
{
  skills: z.array(z.string()).min(2).max(4)
    .describe("2–4 skill names to compare (e.g. ['Python', 'Go', 'TypeScript'])")
}
```

**Behavior:**
- Looks up each skill name (case-insensitive) in `aneeqData.skills`
- Returns found skills with proficiency level and category
- Returns a "not found" entry for any skill not in the data
- Text content summarizes the comparison

**Widget view:** New `SkillComparisonView` component — side-by-side proficiency cards.

---

### `get_recommendations`

**Purpose:** Surface testimonials and endorsements from people who've worked with Aneeq.

**Input schema:**
```typescript
{ limit: z.number().int().min(1).max(10).optional()
    .describe("Max number of recommendations to return (default: all)") }
```

**Behavior:**
- Reads from `aneeqData.recommendations[]`
- Respects optional `limit` parameter
- Each recommendation includes `author`, `role`, `company`, `text`, optional `linkedIn`

**Widget view:** New `RecommendationsCard` component — quote cards with author attribution.

**Data:** Real testimonials populated in `aneeq-data.ts` during implementation.

---

### `track_analytics`

**Purpose:** Log query events so patterns can be analyzed from structured logs.

**Input schema:**
```typescript
{
  tool: z.string().describe("The tool that was called"),
  query: z.string().optional().describe("The query or question asked"),
  category: z.string().optional().describe("Category if applicable"),
}
```

**Behavior:**
- Emits a pino `info` log with tag `"analytics"` and the event payload
- Returns a simple acknowledgement (no widget render needed)
- Called by ChatGPT alongside other tools to record what visitors ask

**Widget view:** None — tool is write-only, acknowledgement only.

**Future:** Log aggregation (Datadog, Loki, etc.) can pick up structured `"analytics"` events. No code changes needed to upgrade observability.

---

## Search Abstraction

### `server/src/search/provider.ts`

```typescript
export interface SearchResult {
  view: string;            // widget view key
  data: unknown;           // matched data payload
  score: number;           // relevance 0–1
  matchedFields: string[]; // fields that matched (for transparency/debugging)
}

export interface SearchProvider {
  search(query: string, data: AneeqData): SearchResult[];
}
```

### `server/src/search/keyword-provider.ts`

**Algorithm:**
1. Lowercase query, split into tokens
2. Scan all text fields across `experience`, `projects`, `skills`, `education`, `contact`, `hobbies`, `recommendations`
3. Score by token hit count — title/name fields weighted 2×, body fields 1×
4. Return results sorted descending by score, filtered to score > 0

**Upgrade path:** Implement `SearchProvider` interface with a new class, inject into `ask-anything.ts`. Zero changes to tool handler logic.

---

## Data Layer Changes

### New `Recommendation` type (added to `aneeq-data.ts`)

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

`AneeqData` interface gets a new `recommendations: Recommendation[]` field, populated with real testimonials.

### New environment variable

```bash
# .env.example
CALENDLY_URL=https://calendly.com/your-handle   # Booking link for get_availability tool
```

---

## Widget Changes

### New views added to `App.tsx`

```tsx
{view === "recommendations" && <RecommendationsCard data={data} />}
{view === "availability" && <AvailabilityCard data={data} />}
{view === "skill-comparison" && <SkillComparisonView data={data} />}
```

### New components

| Component | Renders |
|-----------|---------|
| `RecommendationsCard` | Quote cards: author name, role, company, testimonial text, optional LinkedIn link |
| `AvailabilityCard` | Booking card: name, CTA text, Calendly button |
| `SkillComparisonView` | Side-by-side proficiency badges per skill with category labels |

---

## Testing Plan

### Server — unit tests

| File | Key cases |
|------|-----------|
| `keyword-provider.test.ts` | Single token match, multi-token, case-insensitivity, zero results, field weighting, score ordering |
| `ask-anything.test.ts` | Returns results, correct view on top hit, empty query fallback, zero-result fallback message |
| `get-availability.test.ts` | Returns `CALENDLY_URL` from env, falls back to portfolio URL when env unset |
| `compare-skills.test.ts` | Known skills return proficiency, unknown skill returns not-found, min 2 / max 4 enforced |
| `get-recommendations.test.ts` | Returns all recommendations, respects `limit`, handles empty array |
| `track-analytics.test.ts` | `vi.spyOn(logger, 'info')` — asserts structured event shape with `"analytics"` tag |

### Widget — component tests

| File | Key cases |
|------|-----------|
| `RecommendationsCard.test.tsx` | Renders author, role, company, text; LinkedIn link when present |
| `AvailabilityCard.test.tsx` | Renders booking URL, correct `href` on CTA button |
| `SkillComparisonView.test.tsx` | Renders skill names, proficiency labels side-by-side |

---

## Documentation Updates

| File | Change |
|------|--------|
| `docs/project-structure.md` | Add new tool files, search/ directory, new components |
| `docs/testing.md` | Add entries for new tool tests and `keyword-provider` |
| `CLAUDE.md` | Add 5 new tools to tools table |
| `README.md` | Update features/tools section |
| `SCALE_PLAN.md` | Check off all Tier 3 new tool items on completion |

---

## Architecture Decision Log Entry

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-19 | `SearchProvider` abstraction for `ask_anything` | Start with keyword search, make LLM/vector upgrade a one-file swap |
| 2026-02-19 | `get_availability` reads from `CALENDLY_URL` env var | Zero external API dependency, trivially upgradable to embedded booking (see IDEAS.md) |
| 2026-02-19 | `track_analytics` logs to pino only | Reuses existing observability layer; log aggregation tools can consume structured events without code changes |
| 2026-02-19 | Recommendations as static data in `aneeq-data.ts` | Consistent with existing data layer; LinkedIn API integration deferred to Tier 4 (see IDEAS.md) |
