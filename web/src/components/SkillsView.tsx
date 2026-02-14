import { Code, Sparkles } from "lucide-react";
import type { SkillCategory } from "../types";

interface SkillsViewProps {
  data: SkillCategory[];
}

const proficiencyColors: Record<string, string> = {
  expert: "bg-emerald-50 text-emerald-700 border-emerald-200",
  advanced: "bg-sky-50 text-sky-700 border-sky-200",
  intermediate: "bg-gray-50 text-gray-600 border-gray-200",
};

export function SkillsView({ data }: SkillsViewProps) {
  return (
    <div className="space-y-3 animate-slide-up">
      {data.map((category) => (
        <div key={category.category} className="card">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-gray-900 text-sm">
              {category.category}
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {category.skills.map((skill) => (
              <span
                key={skill.name}
                className={`badge border ${proficiencyColors[skill.proficiency]} inline-flex items-center gap-1`}
              >
                {skill.proficiency === "expert" && (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="text-[10px] text-gray-400 text-center pt-1">
        <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
        expert &middot; blue = advanced &middot; gray = intermediate
      </div>
    </div>
  );
}
