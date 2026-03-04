import { describe, it, expect, vi, beforeEach } from "vitest";
import { withAnalytics } from "./middleware.js";
import type { AnalyticsStore } from "./store.js";

const makeStore = (): AnalyticsStore =>
  ({ insert: vi.fn() }) as unknown as AnalyticsStore;

const makeHandler = (view: string) =>
  vi.fn().mockResolvedValue({
    structuredContent: { view },
    content: [{ type: "text", text: "ok" }],
  });

describe("withAnalytics", () => {
  let store: AnalyticsStore;

  beforeEach(() => {
    store = makeStore();
  });

  it("returns the handler result unchanged", async () => {
    const handler = makeHandler("overview");
    const wrapped = withAnalytics("ask_about_aneeq", handler, store);
    const result = await wrapped({ category: "overview" });
    expect(result.structuredContent?.view).toBe("overview");
  });

  it("inserts an analytics event after the handler runs", async () => {
    const handler = makeHandler("skills");
    const wrapped = withAnalytics("ask_about_aneeq", handler, store);
    await wrapped({ category: "skills" });
    expect(store.insert).toHaveBeenCalledWith({
      tool: "ask_about_aneeq",
      query: "skills",
      category: "skills",
    });
  });

  it("extracts query from input.query field", async () => {
    const handler = makeHandler("projects");
    const wrapped = withAnalytics("search_projects", handler, store);
    await wrapped({ query: "react" });
    expect(store.insert).toHaveBeenCalledWith(
      expect.objectContaining({ query: "react" }),
    );
  });

  it("extracts query from skills array", async () => {
    const handler = makeHandler("skill-comparison");
    const wrapped = withAnalytics("compare_skills", handler, store);
    await wrapped({ skills: ["TypeScript", "React"] });
    expect(store.insert).toHaveBeenCalledWith(
      expect.objectContaining({ query: "TypeScript, React" }),
    );
  });

  it("does not throw if store.insert fails", async () => {
    (store.insert as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("db error");
    });
    const handler = makeHandler("overview");
    const wrapped = withAnalytics("ask_about_aneeq", handler, store);
    await expect(wrapped({})).resolves.toBeDefined();
  });
});
