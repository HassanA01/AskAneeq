import { describe, it, expect } from "vitest";
import { handleAskAboutAneeq } from "./ask-about.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("ask_about_aneeq tool", () => {
  it("returns overview data with correct view", async () => {
    const result = await handleAskAboutAneeq({ category: "overview" });

    expect(result.structuredContent).toEqual({
      view: "overview",
      data: aneeqData.overview,
    });
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain(aneeqData.overview.name);
  });

  it("returns current role with focusId", async () => {
    const result = await handleAskAboutAneeq({ category: "current-role" });
    const currentRole = aneeqData.experience.find((e) => e.current);

    expect(result.structuredContent.view).toBe("experience");
    expect(result.structuredContent.focusId).toBe(currentRole?.id);
    expect(result.structuredContent.data).toEqual([currentRole]);
  });

  it("returns all experience entries", async () => {
    const result = await handleAskAboutAneeq({ category: "experience" });

    expect(result.structuredContent.view).toBe("experience");
    expect(result.structuredContent.data).toEqual(aneeqData.experience);
    expect(result.structuredContent.data).toHaveLength(
      aneeqData.experience.length,
    );
  });

  it("returns all projects", async () => {
    const result = await handleAskAboutAneeq({ category: "projects" });

    expect(result.structuredContent.view).toBe("projects");
    expect(result.structuredContent.data).toEqual(aneeqData.projects);
  });

  it("returns skills with categories", async () => {
    const result = await handleAskAboutAneeq({ category: "skills" });

    expect(result.structuredContent.view).toBe("skills");
    expect(result.structuredContent.data).toEqual(aneeqData.skills);
    expect(result.content[0].text).toContain("Expert in");
  });

  it("returns education data", async () => {
    const result = await handleAskAboutAneeq({ category: "education" });

    expect(result.structuredContent.view).toBe("education");
    expect(result.structuredContent.data).toEqual(aneeqData.education);
    expect(result.content[0].text).toContain("University of Toronto");
  });

  it("returns contact information", async () => {
    const result = await handleAskAboutAneeq({ category: "contact" });

    expect(result.structuredContent.view).toBe("contact");
    expect(result.structuredContent.data).toEqual(aneeqData.contact);
    expect(result.content[0].text).toContain(aneeqData.contact.email);
  });

  it("returns hobbies list", async () => {
    const result = await handleAskAboutAneeq({ category: "hobbies" });

    expect(result.structuredContent.view).toBe("hobbies");
    expect(result.structuredContent.data).toEqual(aneeqData.hobbies);
    expect(result.content[0].text).toContain("Soccer");
  });

  it("always returns text content for LLM consumption", async () => {
    const categories = [
      "overview",
      "experience",
      "projects",
      "skills",
      "education",
      "contact",
      "hobbies",
      "current-role",
    ] as const;

    for (const category of categories) {
      const result = await handleAskAboutAneeq({ category });
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text.length).toBeGreaterThan(0);
    }
  });
});
