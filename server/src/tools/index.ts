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
import {
  trackAnalyticsSchema,
  handleTrackAnalytics,
} from "./track-analytics.js";
import {
  getAvailabilitySchema,
  handleGetAvailability,
} from "./get-availability.js";
import {
  getRecommendationsSchema,
  handleGetRecommendations,
} from "./get-recommendations.js";
import {
  compareSkillsSchema,
  handleCompareSkills,
} from "./compare-skills.js";

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

  registerAppTool(
    server,
    "track_analytics",
    {
      title: "Track Analytics",
      description:
        "Log a query event for analytics. Call this alongside other tools to record what visitors are asking about Aneeq.",
      inputSchema: trackAnalyticsSchema,
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleTrackAnalytics,
  );

  registerAppTool(
    server,
    "get_availability",
    {
      title: "Get Availability",
      description:
        "Get a link to schedule time with Aneeq Hassan — for coffee chats, interviews, or collaboration.",
      inputSchema: getAvailabilitySchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleGetAvailability,
  );

  registerAppTool(
    server,
    "get_recommendations",
    {
      title: "Get Recommendations",
      description:
        "Retrieve testimonials and endorsements from people who have worked with Aneeq Hassan.",
      inputSchema: getRecommendationsSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleGetRecommendations,
  );

  registerAppTool(
    server,
    "compare_skills",
    {
      title: "Compare Skills",
      description:
        "Look up and compare Aneeq Hassan's proficiency in one or more technologies. Pass up to 4 skill names.",
      inputSchema: compareSkillsSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    handleCompareSkills,
  );
}
