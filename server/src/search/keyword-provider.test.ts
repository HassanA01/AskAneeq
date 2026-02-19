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
