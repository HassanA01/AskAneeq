import { GraduationCap, Calendar } from "lucide-react";
import type { Education } from "../types";

interface EducationCardProps {
  data: Education[];
}

export function EducationCard({ data }: EducationCardProps) {
  return (
    <div className="space-y-3 animate-fade-in">
      {data.map((edu) => (
        <div key={edu.institution} className="rounded-xl border border-default bg-surface p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1">
              <h3 className="heading-xs">{edu.institution}</h3>
              <p className="text-sm text-blue-600 font-medium">
                {edu.degree} in {edu.field}
              </p>
              <p className="flex items-center gap-1 text-xs text-tertiary mt-1">
                <Calendar className="w-3 h-3" />
                {edu.duration}
              </p>

              {edu.highlights.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {edu.highlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-secondary flex items-start"
                    >
                      <span className="text-blue-400 mr-2 mt-0.5 text-xs">
                        &#9679;
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
