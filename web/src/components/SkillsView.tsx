import { Code, Sparkles } from "lucide-react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import type { SkillCategory } from "../types";

interface SkillsViewProps {
  data: SkillCategory[];
}

const proficiencyColor: Record<string, "success" | "info" | "secondary"> = {
  expert: "success",
  advanced: "info",
  intermediate: "secondary",
};

export function SkillsView({ data }: SkillsViewProps) {
  return (
    <div className="space-y-3 animate-slide-up">
      {data.map((category) => (
        <div key={category.category} className="rounded-xl border border-default bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Code className="w-4 h-4 text-blue-600" />
            <h3 className="heading-xs">{category.category}</h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {category.skills.map((skill) => (
              <Badge
                key={skill.name}
                color={proficiencyColor[skill.proficiency] ?? "secondary"}
                variant="outline"
                size="sm"
              >
                {skill.proficiency === "expert" && (
                  <Sparkles className="w-2.5 h-2.5" />
                )}
                {skill.name}
              </Badge>
            ))}
          </div>
        </div>
      ))}

      <div className="text-2xs text-tertiary text-center pt-1">
        <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />
        expert &middot; blue = advanced &middot; gray = intermediate
      </div>
    </div>
  );
}
