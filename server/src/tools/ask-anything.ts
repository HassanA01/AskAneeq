import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";
import { KeywordSearchProvider } from "../search/keyword-provider.js";

export const askAnythingSchema = {
  query: z.string().min(1).describe("Any question about Aneeq Hassan"),
};

export type AskAnythingInput = { query: string };

export async function handleAskAnything(input: AskAnythingInput) {
  const { query } = input;
  const provider = new KeywordSearchProvider();
  const results = provider.search(query, aneeqData);

  if (results.length === 0) {
    return {
      structuredContent: {
        view: "overview",
        data: aneeqData.overview,
        searchQuery: query,
      },
      content: [
        {
          type: "text" as const,
          text: `I couldn't find specific information about "${query}". Try asking about experience, projects, skills, education, or contact details.`,
        },
      ],
    };
  }

  const top = results[0];
  return {
    structuredContent: { view: top.view, data: top.data, searchQuery: query },
    content: [
      {
        type: "text" as const,
        text: `Found information about "${query}" (matched: ${top.matchedFields.join(", ")}).`,
      },
    ],
  };
}
