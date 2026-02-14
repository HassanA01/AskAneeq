import { Folder, ExternalLink, Github, TrendingUp } from "lucide-react";
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
        <p className="text-sm text-gray-500 mb-3">
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
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Folder className="w-4 h-4 text-sky-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {project.name}
                  </h3>
                  {project.featured && (
                    <span className="badge bg-amber-50 text-amber-700 text-[10px] flex-shrink-0">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>

            {project.impact && (
              <div className="mt-3 flex items-start gap-2 bg-emerald-50 p-2.5 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-emerald-800">
                    {project.impact}
                  </p>
                  {project.metrics && (
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      {project.metrics}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="badge badge-primary text-[10px]"
                >
                  {tech}
                </span>
              ))}
            </div>

            {project.links && (
              <div className="mt-3 flex gap-3 pt-2.5 border-t border-gray-100">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-sky-600 transition-colors"
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
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-sky-600 transition-colors"
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
        <div className="text-center py-10 text-gray-400 text-sm">
          No projects found matching your criteria.
        </div>
      )}
    </div>
  );
}
