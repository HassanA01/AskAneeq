import { Building2, MapPin, Calendar } from "lucide-react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import type { Experience } from "../types";

interface ExperienceTimelineProps {
  data: Experience[];
  focusId?: string;
}

export function ExperienceTimeline({ data, focusId }: ExperienceTimelineProps) {
  return (
    <div className="space-y-3 animate-slide-up">
      {data.map((exp) => (
        <div
          key={exp.id}
          className={`rounded-xl border border-default bg-surface p-5 shadow-sm transition-all ${
            focusId === exp.id ? "ring-2 ring-blue-400 shadow-md" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="heading-xs">{exp.role}</h3>
                {exp.current && (
                  <Badge color="success" size="sm">Current</Badge>
                )}
              </div>
              <p className="text-blue-600 font-medium text-sm">{exp.company}</p>

              <div className="flex items-center gap-3 mt-1 text-xs text-tertiary">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {exp.duration}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {exp.location}
                </span>
              </div>
            </div>
          </div>

          <ul className="mt-3 space-y-1 ml-[52px]">
            {exp.achievements.map((achievement, idx) => (
              <li key={idx} className="text-sm text-secondary flex items-start">
                <span className="text-blue-400 mr-2 mt-0.5 text-xs">&#9679;</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>

          <div className="mt-3 ml-[52px] flex flex-wrap gap-1.5">
            {exp.technologies.map((tech) => (
              <Badge key={tech} color="info" size="sm">{tech}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
