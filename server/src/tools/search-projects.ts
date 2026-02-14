import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const searchProjectsSchema = {
  query: z.string().optional().describe("Search term to filter projects"),
  technology: z
    .string()
    .optional()
    .describe("Filter by specific technology"),
};

export type SearchProjectsInput = { query?: string; technology?: string };

export async function handleSearchProjects(input: SearchProjectsInput) {
  const { query, technology } = input;

  let filteredProjects = aneeqData.projects;

  if (query) {
    const lowerQuery = query.toLowerCase();
    filteredProjects = filteredProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery),
    );
  }

  if (technology) {
    const lowerTech = technology.toLowerCase();
    filteredProjects = filteredProjects.filter((p) =>
      p.techStack.some((t) => t.toLowerCase().includes(lowerTech)),
    );
  }

  const structuredContent = {
    view: "projects" as const,
    data: filteredProjects,
    searchQuery: query,
    technologyFilter: technology,
  };

  const textContent = `Found ${filteredProjects.length} project${filteredProjects.length !== 1 ? "s" : ""}${query ? ` matching "${query}"` : ""}${technology ? ` using ${technology}` : ""}`;

  return {
    structuredContent,
    content: [{ type: "text" as const, text: textContent }],
  };
}
