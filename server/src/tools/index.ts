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
import { askAnythingSchema, handleAskAnything } from "./ask-anything.js";
import {
  showPortfolioSchema,
  handleShowPortfolio,
} from "./show-portfolio.js";
import { withAnalytics } from "../analytics/middleware.js";
import type { AnalyticsStore } from "../analytics/store.js";

export function registerTools(server: McpServer, store: AnalyticsStore) {
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
    withAnalytics("ask_about_aneeq", handleAskAboutAneeq, store),
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
    withAnalytics("get_resume", handleGetResume, store),
  );

  registerAppTool(
    server,
    "search_projects",
    {
      title: "Search Aneeq's Projects",
      description:
        "Search through Aneeq Hassan's projects by keyword or technology. When the user says 'search', 'find', or mentions a topic/tech, pass that as the query or technology parameter. Omit both only when they want to see all projects.",
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
    withAnalytics("search_projects", handleSearchProjects, store),
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
    withAnalytics("get_availability", handleGetAvailability, store),
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
    withAnalytics("get_recommendations", handleGetRecommendations, store),
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
    withAnalytics("compare_skills", handleCompareSkills, store),
  );

  registerAppTool(
    server,
    "ask_anything",
    {
      title: "Ask Anything About Aneeq",
      description:
        "Free-form search across all of Aneeq Hassan's profile data. Use this when the question doesn't fit a specific category — it will find the most relevant information.",
      inputSchema: askAnythingSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    withAnalytics("ask_anything", handleAskAnything, store),
  );

  registerAppTool(
    server,
    "show_portfolio",
    {
      title: "Show Portfolio",
      description:
        "See Aneeq's full portfolio website — embedded inline for a rich visual overview of his work.",
      inputSchema: showPortfolioSchema,
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
        destructiveHint: false,
      },
      _meta: {
        ui: { resourceUri: "ui://widget/aneeq-profile.html" },
      },
    },
    withAnalytics("show_portfolio", handleShowPortfolio, store),
  );
}
