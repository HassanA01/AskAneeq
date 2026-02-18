import { describe, it, expect } from "vitest";
import { handleGetResume } from "./get-resume.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("get_resume tool", () => {
  it("returns full resume with all sections", async () => {
    const result = await handleGetResume({ format: "full" });

    expect(result.structuredContent.view).toBe("resume");
    expect(result.structuredContent.format).toBe("full");

    const data = result.structuredContent.data as Record<string, unknown>;
    expect(data.name).toBe(aneeqData.overview.name);
    expect(data.title).toBe(aneeqData.overview.title);
    expect(data.experience).toEqual(aneeqData.experience);
    expect(data.skills).toEqual(aneeqData.skills);
    expect(data.education).toEqual(aneeqData.education);
    expect(data.contact).toEqual(aneeqData.contact);
  });

  it("includes only featured projects", async () => {
    const result = await handleGetResume({ format: "full" });
    const data = result.structuredContent.data as Record<string, unknown>;
    const projects = data.projects as Array<{ featured: boolean }>;

    expect(projects.every((p) => p.featured)).toBe(true);
    expect(projects.length).toBe(
      aneeqData.projects.filter((p) => p.featured).length,
    );
  });

  it("returns summary format with shorter text", async () => {
    const result = await handleGetResume({ format: "summary" });

    expect(result.structuredContent.format).toBe("summary");
    expect(result.content[0].text).toContain("Executive summary");
  });

  it("returns full format with detailed text", async () => {
    const result = await handleGetResume({ format: "full" });

    expect(result.content[0].text).toContain("Complete resume");
    expect(result.content[0].text).toContain(
      `${aneeqData.experience.length} positions`,
    );
  });

  it("always returns valid structured content", async () => {
    for (const format of ["full", "summary"] as const) {
      const result = await handleGetResume({ format });

      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.view).toBe("resume");
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
    }
  });
});
