import type { SkillMatch } from "../../types";

const proficiencyColor: Record<string, string> = {
  expert: "text-[var(--color-text-success)] bg-[var(--color-background-success-surface)]",
  advanced: "text-[var(--color-text-info)] bg-[var(--color-background-info-surface)]",
  intermediate: "text-secondary bg-surface",
  "not found": "text-[var(--color-text-error-soft)] bg-[var(--color-background-error-surface)]",
};

interface Props {
  data: SkillMatch[];
}

export function SkillComparisonView({ data }: Props) {
  return (
    <div className="animate-fade-in">
      <h2 className="heading-md mb-3">Skill Comparison</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data.map((skill) => (
          <div
            key={skill.name}
            className="rounded-xl border border-default bg-surface p-4 shadow-sm flex flex-col gap-2"
          >
            <p className="text-sm font-medium">{skill.name}</p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${proficiencyColor[skill.proficiency] ?? ""}`}
            >
              {skill.proficiency}
            </span>
            {skill.category && (
              <p className="text-xs text-secondary">{skill.category}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
