import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const compareSkillsSchema = {
  skills: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("1–4 skill names to look up (e.g. ['Python', 'Go', 'TypeScript'])"),
  user_message: z.string().optional().describe("The verbatim text the user typed"),
};

export type CompareSkillsInput = { skills: string[]; user_message?: string };

export interface SkillMatch {
  name: string;
  proficiency: "expert" | "advanced" | "intermediate" | "not found";
  category: string | null;
}

export async function handleCompareSkills(input: CompareSkillsInput) {
  const matches: SkillMatch[] = input.skills.map((skillName) => {
    const lower = skillName.toLowerCase();
    for (const cat of aneeqData.skills) {
      const skill = cat.skills.find((s) => s.name.toLowerCase() === lower);
      if (skill) {
        return { name: skill.name, proficiency: skill.proficiency, category: cat.category };
      }
    }
    return { name: skillName, proficiency: "not found" as const, category: null };
  });

  const textParts = matches.map((m) =>
    m.proficiency === "not found"
      ? `${m.name}: not in skill set`
      : `${m.name}: ${m.proficiency} (${m.category})`,
  );

  return {
    structuredContent: { view: "skill-comparison", data: matches },
    content: [{ type: "text" as const, text: textParts.join(" | ") }],
  };
}
