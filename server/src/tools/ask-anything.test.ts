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
