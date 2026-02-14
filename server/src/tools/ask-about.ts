import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const askAboutAneeqSchema = {
  category: z
    .enum([
      "overview",
      "experience",
      "projects",
      "skills",
      "education",
      "contact",
      "hobbies",
      "current-role",
    ])
    .describe("The category of information to retrieve about Aneeq"),
};

export type AskAboutAneeqInput = {
  category:
    | "overview"
    | "experience"
    | "projects"
    | "skills"
    | "education"
    | "contact"
    | "hobbies"
    | "current-role";
};

export async function handleAskAboutAneeq(input: AskAboutAneeqInput) {
  console.log("[Tool] ask_about_aneeq called with category:", input.category);
  const { category } = input;

  let structuredContent: Record<string, unknown>;
  let textContent: string;

  switch (category) {
    case "overview":
      structuredContent = { view: "overview", data: aneeqData.overview };
      textContent = `${aneeqData.overview.name} is an ${aneeqData.overview.title} with ${aneeqData.overview.yearsExperience}+ years of experience. ${aneeqData.overview.tagline}`;
      break;

    case "current-role": {
      const currentRole = aneeqData.experience.find((e) => e.current);
      structuredContent = {
        view: "experience",
        data: [currentRole],
        focusId: currentRole?.id,
      };
      textContent = currentRole
        ? `Currently working at ${currentRole.company} as ${currentRole.role}. ${currentRole.achievements[0]}`
        : "No current role found.";
      break;
    }

    case "experience":
      structuredContent = { view: "experience", data: aneeqData.experience };
      textContent = `Aneeq has worked at ${aneeqData.experience.length} companies including ${aneeqData.experience
        .slice(0, 3)
        .map((e) => e.company)
        .join(", ")}`;
      break;

    case "projects":
      structuredContent = { view: "projects", data: aneeqData.projects };
      textContent = `Featured projects: ${aneeqData.projects
        .filter((p) => p.featured)
        .map((p) => p.name)
        .join(", ")}`;
      break;

    case "skills":
      structuredContent = { view: "skills", data: aneeqData.skills };
      textContent = `Expert in ${aneeqData.skills
        .flatMap((c) =>
          c.skills.filter((s) => s.proficiency === "expert").map((s) => s.name),
        )
        .join(", ")}`;
      break;

    case "education":
      structuredContent = { view: "education", data: aneeqData.education };
      textContent = `${aneeqData.education[0].degree} in ${aneeqData.education[0].field} from ${aneeqData.education[0].institution}`;
      break;

    case "contact":
      structuredContent = { view: "contact", data: aneeqData.contact };
      textContent = `Email: ${aneeqData.contact.email}, Portfolio: ${aneeqData.contact.portfolio}`;
      break;

    case "hobbies":
      structuredContent = { view: "hobbies", data: aneeqData.hobbies };
      textContent = `Interests: ${aneeqData.hobbies.join(", ")}`;
      break;
  }

  return {
    structuredContent: structuredContent!,
    content: [{ type: "text" as const, text: textContent! }],
  };
}
