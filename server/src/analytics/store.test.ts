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
    // Ordering relies on ORDER BY timestamp DESC, id DESC — id tiebreaker ensures
    // deterministic order when two inserts share the same millisecond timestamp.
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
