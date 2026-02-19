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
