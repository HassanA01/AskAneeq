import type { Recommendation } from "../../types";

interface Props {
  data: Recommendation[];
}

export function RecommendationsCard({ data }: Props) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="heading-md">Recommendations</h2>
      {data.map((rec) => (
        <div
          key={rec.id}
          className="rounded-xl border border-default bg-surface p-5 shadow-sm"
        >
          <p className="text-sm text-secondary italic mb-4">
            &ldquo;{rec.text}&rdquo;
          </p>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{rec.author}</p>
              <p className="text-xs text-secondary">
                {rec.role} at {rec.company}
              </p>
            </div>
            {rec.linkedIn && (
              <a
                href={rec.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--color-text-info)] shrink-0"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
