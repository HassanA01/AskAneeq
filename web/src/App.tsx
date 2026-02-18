import { useToolResult } from "./hooks/use-tool-result";
import { ProfileCard } from "./components/ProfileCard";
import { ExperienceTimeline } from "./components/ExperienceTimeline";
import { ProjectsGallery } from "./components/ProjectsGallery";
import { SkillsView } from "./components/SkillsView";
import { ContactCard } from "./components/ContactCard";
import { EducationCard } from "./components/EducationCard";
import { HelpCircle } from "lucide-react";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";

export function App() {
  const toolResult = useToolResult();

  const view = toolResult?.structuredContent?.view;
  const data = toolResult?.structuredContent?.data;

  if (!toolResult || !view || !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <div className="rounded-xl border border-default bg-surface p-5 shadow-sm max-w-sm text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="heading-md mb-1">Ask About Aneeq</h2>
          <p className="text-sm text-secondary mb-3">Try asking:</p>
          <ul className="text-left text-sm text-secondary space-y-1.5">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">&#8226;</span>
              What is Aneeq's current role?
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">&#8226;</span>
              Show me his projects
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">&#8226;</span>
              What are his technical skills?
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">&#8226;</span>
              How can I contact Aneeq?
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {view === "overview" && <ProfileCard data={data} />}

      {view === "experience" && (
        <ExperienceTimeline
          data={data}
          focusId={toolResult.structuredContent?.focusId}
        />
      )}

      {view === "projects" && (
        <ProjectsGallery
          data={data}
          searchQuery={toolResult.structuredContent?.searchQuery}
          technologyFilter={toolResult.structuredContent?.technologyFilter}
        />
      )}

      {view === "skills" && <SkillsView data={data} />}

      {view === "education" && <EducationCard data={data} />}

      {view === "contact" && <ContactCard data={data} />}

      {view === "hobbies" && (
        <div className="rounded-xl border border-default bg-surface p-5 shadow-sm animate-fade-in">
          <h2 className="heading-md mb-3">Interests & Hobbies</h2>
          <div className="flex flex-wrap gap-2">
            {(data as string[]).map((hobby) => (
              <Badge key={hobby} color="secondary" size="md">
                {hobby}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {view === "resume" && (
        <div className="space-y-4">
          <ProfileCard data={data} />
          {data.experience && <ExperienceTimeline data={data.experience} />}
          {data.projects && <ProjectsGallery data={data.projects} />}
          {data.skills && <SkillsView data={data.skills} />}
          {data.education && <EducationCard data={data.education} />}
          {data.contact && <ContactCard data={data.contact} />}
        </div>
      )}
    </div>
  );
}
