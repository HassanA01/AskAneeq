import { Folder, ExternalLink, Github, TrendingUp } from "lucide-react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import type { Project } from "../types";

interface ProjectsGalleryProps {
  data: Project[];
  searchQuery?: string;
  technologyFilter?: string;
}

export function ProjectsGallery({
  data,
  searchQuery,
  technologyFilter,
}: ProjectsGalleryProps) {
  return (
    <div className="animate-slide-up">
      {(searchQuery || technologyFilter) && (
        <p className="text-sm text-secondary mb-3">
          {data.length} project{data.length !== 1 ? "s" : ""}
          {searchQuery && (
            <>
              {" "}
              matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </>
          )}
          {technologyFilter && (
            <>
              {" "}
              using <strong>{technologyFilter}</strong>
            </>
          )}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((project) => (
          <div
            key={project.id}
            className="rounded-xl border border-default bg-surface p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-[var(--color-background-info-surface)] rounded-lg flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 text-[var(--color-text-info-soft)]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="heading-xs truncate">{project.name}</h3>
                  {project.featured && (
                    <Badge color="warning" size="sm">Featured</Badge>
                  )}
                </div>
                <p className="text-xs text-secondary mt-1 line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>

            {project.impact && (
              <div className="mt-3 flex items-start gap-2 bg-[var(--color-background-success-surface)] p-2.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-text-success)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-success-soft)]">
                    {project.impact}
                  </p>
                  {project.metrics && (
                    <p className="text-2xs text-[var(--color-text-success)] mt-0.5">
                      {project.metrics}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
              {project.techStack.map((tech) => (
                <Badge key={tech} color="info" size="sm">{tech}</Badge>
              ))}
            </div>

            {project.links && (
              <div className="mt-3 flex gap-3 pt-2.5 border-t border-default">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-secondary hover:text-[var(--color-text-info-soft)] transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    Code
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-secondary hover:text-[var(--color-text-info-soft)] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Demo
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-10 text-tertiary text-sm">
          No projects found matching your criteria.
        </div>
      )}
    </div>
  );
}
