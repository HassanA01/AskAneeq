import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppTool } from "@modelcontextprotocol/ext-apps/server";
import {
  askAboutAneeqSchema,
  handleAskAboutAneeq,
} from "./ask-about.js";
import { getResumeSchema, handleGetResume } from "./get-resume.js";
import {
  searchProjectsSchema,
  handleSearchProjects,
} from "./search-projects.js";

export function registerTools(server: McpServer) {
  registerAppTool(
    server,
    "ask_about_aneeq",
    {
      title: "Ask About Aneeq Hassan",
      description:
        "Get information about Aneeq Hassan - his experience, projects, skills, education, or contact info. Use the category parameter to specify what information you want.",
      inputSchema: askAboutAneeqSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleAskAboutAneeq,
  );

  registerAppTool(
    server,
    "get_resume",
    {
      title: "Get Aneeq's Resume",
      description:
        "Retrieve Aneeq Hassan's resume in full or summary format, showing his complete professional profile.",
      inputSchema: getResumeSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleGetResume,
  );

  registerAppTool(
    server,
    "search_projects",
    {
      title: "Search Aneeq's Projects",
      description:
        "Search through Aneeq Hassan's projects by keyword or technology. Returns matching projects with details.",
      inputSchema: searchProjectsSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleSearchProjects,
  );
}
