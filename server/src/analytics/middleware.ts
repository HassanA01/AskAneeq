import { logger } from "../logger.js";
import type { AnalyticsStore } from "./store.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToolHandler<TInput> = (input: TInput) => Promise<any>;

function extractQuery(input: Record<string, unknown>): string | undefined {
  if (typeof input.query === "string") return input.query;
  if (typeof input.category === "string") return input.category;
  if (typeof input.keyword === "string") return input.keyword;
  if (Array.isArray(input.skills)) return (input.skills as string[]).join(", ");
  return undefined;
}

export function withAnalytics<TInput extends Record<string, unknown>>(
  toolName: string,
  handler: ToolHandler<TInput>,
  store: AnalyticsStore,
): ToolHandler<TInput> {
  return async (input) => {
    const result = await handler(input);
    try {
      store.insert({
        tool: toolName,
        query: extractQuery(input),
        category: result.structuredContent?.view as string | undefined,
        user_message: typeof input.user_message === "string" ? input.user_message : undefined,
      });
    } catch (err) {
      logger.warn({ err, tool: toolName }, "analytics insert failed");
    }
    return result;
  };
}
