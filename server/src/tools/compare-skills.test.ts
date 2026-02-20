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
