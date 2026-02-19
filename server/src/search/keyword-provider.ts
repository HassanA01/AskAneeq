// server/src/search/keyword-provider.ts
import type { AneeqData } from "../data/aneeq-data.js";
import type { SearchProvider, SearchResult } from "./provider.js";

type ScoredField = [fieldName: string, value: string, weight: number];

export class KeywordSearchProvider implements SearchProvider {
  search(query: string, data: AneeqData): SearchResult[] {
    if (!query.trim()) return [];

    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];

    // Experience
    for (const exp of data.experience) {
      const fields: ScoredField[] = [
        ["company", exp.company, 2],
        ["role", exp.role, 2],
        ["technologies", exp.technologies.join(" "), 1],
        ["achievements", exp.achievements.join(" "), 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "experience", data: [exp], score, matchedFields });
      }
    }

    // Projects
    for (const project of data.projects) {
      const fields: ScoredField[] = [
        ["name", project.name, 2],
        ["techStack", project.techStack.join(" "), 1],
        ["description", project.description, 1],
        ["impact", project.impact ?? "", 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "projects", data: [project], score, matchedFields });
      }
    }

    // Skills (score per category, but always return the full skills array)
    const skillScores: { score: number; matchedFields: string[] }[] = [];
    for (const cat of data.skills) {
      const fields: ScoredField[] = [
        ["category", cat.category, 2],
        ["skills", cat.skills.map((s) => s.name).join(" "), 1],
      ];
      skillScores.push(this.score(tokens, fields));
    }
    const bestSkill = skillScores.reduce(
      (best, s) => (s.score > best.score ? s : best),
      { score: 0, matchedFields: [] as string[] },
    );
    if (bestSkill.score > 0) {
      results.push({ view: "skills", data: data.skills, ...bestSkill });
    }

    // Overview
    const overviewFields: ScoredField[] = [
      ["name", data.overview.name, 2],
      ["title", data.overview.title, 2],
      ["tagline", data.overview.tagline, 1],
    ];
    const overviewScore = this.score(tokens, overviewFields);
    if (overviewScore.score > 0) {
      results.push({ view: "overview", data: data.overview, ...overviewScore });
    }

    // Education
    for (const edu of data.education) {
      const fields: ScoredField[] = [
        ["institution", edu.institution, 2],
        ["degree", edu.degree, 2],
        ["field", edu.field, 1],
        ["highlights", edu.highlights.join(" "), 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "education", data: data.education, score, matchedFields });
      }
    }

    // Recommendations
    for (const rec of data.recommendations) {
      const fields: ScoredField[] = [
        ["author", rec.author, 2],
        ["company", rec.company, 1],
        ["role", rec.role, 1],
        ["text", rec.text, 1],
      ];
      const { score, matchedFields } = this.score(tokens, fields);
      if (score > 0) {
        results.push({ view: "recommendations", data: [rec], score, matchedFields });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private score(
    tokens: string[],
    fields: ScoredField[],
  ): { score: number; matchedFields: string[] } {
    let score = 0;
    const matchedFields: string[] = [];

    for (const [fieldName, value, weight] of fields) {
      if (!value) continue;
      const lower = value.toLowerCase();
      const hits = tokens.filter((t) => lower.includes(t)).length;
      if (hits > 0) {
        score += hits * weight;
        matchedFields.push(fieldName);
      }
    }

    return { score, matchedFields };
  }
}
