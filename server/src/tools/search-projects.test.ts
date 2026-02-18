import { describe, it, expect } from "vitest";
import { handleSearchProjects } from "./search-projects.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("search_projects tool", () => {
  it("returns all projects when no filters provided", async () => {
    const result = await handleSearchProjects({});

    expect(result.structuredContent.view).toBe("projects");
    expect(result.structuredContent.data).toHaveLength(
      aneeqData.projects.length,
    );
    expect(result.content[0].text).toContain(
      `${aneeqData.projects.length} project`,
    );
  });

  it("filters by query matching project name", async () => {
    const result = await handleSearchProjects({ query: "MailflowAI" });

    expect(result.structuredContent.data).toHaveLength(1);
    expect(result.structuredContent.data[0].name).toBe("MailflowAI");
    expect(result.structuredContent.searchQuery).toBe("MailflowAI");
  });

  it("filters by query matching project description", async () => {
    const result = await handleSearchProjects({ query: "customer service" });

    expect(result.structuredContent.data.length).toBeGreaterThan(0);
    expect(result.structuredContent.data[0].id).toBe("mailflowai");
  });

  it("query search is case-insensitive", async () => {
    const result = await handleSearchProjects({ query: "mailflowai" });

    expect(result.structuredContent.data).toHaveLength(1);
    expect(result.structuredContent.data[0].name).toBe("MailflowAI");
  });

  it("filters by technology", async () => {
    const result = await handleSearchProjects({ technology: "React" });

    expect(result.structuredContent.data.length).toBeGreaterThan(0);
    expect(
      result.structuredContent.data.every((p: { techStack: string[] }) =>
        p.techStack.some((t: string) =>
          t.toLowerCase().includes("react"),
        ),
      ),
    ).toBe(true);
    expect(result.structuredContent.technologyFilter).toBe("React");
  });

  it("technology search is case-insensitive", async () => {
    const result = await handleSearchProjects({ technology: "python" });

    expect(result.structuredContent.data.length).toBeGreaterThan(0);
  });

  it("combines query and technology filters", async () => {
    const result = await handleSearchProjects({
      query: "marketplace",
      technology: "React",
    });

    expect(result.structuredContent.data.length).toBeGreaterThan(0);
    expect(result.structuredContent.searchQuery).toBe("marketplace");
    expect(result.structuredContent.technologyFilter).toBe("React");
  });

  it("returns empty array when no matches found", async () => {
    const result = await handleSearchProjects({
      query: "nonexistent-project-xyz",
    });

    expect(result.structuredContent.data).toHaveLength(0);
    expect(result.content[0].text).toContain("0 projects");
  });

  it("returns correct text content grammar for single result", async () => {
    const result = await handleSearchProjects({ query: "MailflowAI" });

    expect(result.content[0].text).toMatch(/1 project[^s]/);
  });

  it("returns correct text content grammar for multiple results", async () => {
    const result = await handleSearchProjects({});

    expect(result.content[0].text).toContain("projects");
  });
});
