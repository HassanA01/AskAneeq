import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const getRecommendationsSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("Max number of recommendations to return (default: all)"),
};

export type GetRecommendationsInput = { limit?: number };

export async function handleGetRecommendations(
  input: GetRecommendationsInput,
) {
  const recs =
    input.limit !== undefined
      ? aneeqData.recommendations.slice(0, input.limit)
      : aneeqData.recommendations;

  const count = recs.length;

  return {
    structuredContent: { view: "recommendations", data: recs },
    content: [
      {
        type: "text" as const,
        text: `${count} recommendation${count !== 1 ? "s" : ""} from people who've worked with ${aneeqData.overview.name}.`,
      },
    ],
  };
}
