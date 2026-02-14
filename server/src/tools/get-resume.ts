import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const getResumeSchema = {
  format: z
    .enum(["full", "summary"])
    .default("summary")
    .describe("Full resume or executive summary"),
};

export type GetResumeInput = { format: "full" | "summary" };

export async function handleGetResume(input: GetResumeInput) {
  const { format } = input;

  const resumeData = {
    ...aneeqData.overview,
    experience: aneeqData.experience,
    projects: aneeqData.projects.filter((p) => p.featured),
    skills: aneeqData.skills,
    education: aneeqData.education,
    contact: aneeqData.contact,
  };

  const structuredContent = {
    view: "resume" as const,
    format,
    data: resumeData,
  };

  const textContent =
    format === "full"
      ? `Complete resume for ${aneeqData.overview.name}, including ${aneeqData.experience.length} positions and ${aneeqData.projects.filter((p) => p.featured).length} featured projects.`
      : `Executive summary for ${aneeqData.overview.name}: ${aneeqData.overview.title} with ${aneeqData.overview.yearsExperience}+ years experience.`;

  return {
    structuredContent,
    content: [{ type: "text" as const, text: textContent }],
  };
}
