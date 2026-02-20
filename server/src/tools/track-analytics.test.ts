import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn();
vi.mock("../analytics/store.js", () => ({
  getStore: () => ({ insert: mockInsert }),
}));

import { handleTrackAnalytics } from "./track-analytics.js";

describe("track_analytics tool", () => {
  beforeEach(() => {
    mockInsert.mockClear();
  });

  it("returns acknowledgement text", async () => {
    const result = await handleTrackAnalytics({
      tool: "ask_about_aneeq",
      category: "skills",
      query: "What are his skills?",
    });
    expect(result.content[0].text).toBe("Query logged.");
  });

  it("returns analytics view in structuredContent", async () => {
    const result = await handleTrackAnalytics({ tool: "get_resume" });
    expect(result.structuredContent.view).toBe("analytics");
  });

  it("calls store.insert with the event payload", async () => {
    await handleTrackAnalytics({
      tool: "ask_about_aneeq",
      category: "skills",
      query: "What are his skills?",
    });
    expect(mockInsert).toHaveBeenCalledWith({
      tool: "ask_about_aneeq",
      category: "skills",
      query: "What are his skills?",
    });
  });

  it("calls store.insert with only tool when optional fields omitted", async () => {
    await handleTrackAnalytics({ tool: "get_resume" });
    expect(mockInsert).toHaveBeenCalledWith({
      tool: "get_resume",
      category: undefined,
      query: undefined,
    });
  });
});
