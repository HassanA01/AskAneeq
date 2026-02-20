import { z } from "zod";
import { logger } from "../logger.js";
import { getStore } from "../analytics/store.js";

export const trackAnalyticsSchema = {
  tool: z.string().describe("The tool that was called"),
  query: z.string().optional().describe("The query or question asked"),
  category: z.string().optional().describe("Category if applicable"),
};

export type TrackAnalyticsInput = {
  tool: string;
  query?: string;
  category?: string;
};

export async function handleTrackAnalytics(input: TrackAnalyticsInput) {
  logger.info({ analytics: true, ...input }, "analytics event");
  getStore()?.insert({ tool: input.tool, query: input.query, category: input.category });

  return {
    structuredContent: { view: "analytics", data: { logged: true } },
    content: [{ type: "text" as const, text: "Query logged." }],
  };
}
