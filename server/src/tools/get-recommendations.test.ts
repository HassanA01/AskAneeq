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
    const original = aneeqData.recommendations;
    (aneeqData as any).recommendations = [];

    const result = await handleGetRecommendations({});
    expect(result.structuredContent.data).toHaveLength(0);
    expect(result.content[0].text).toContain("0");

    (aneeqData as any).recommendations = original;
  });
});
