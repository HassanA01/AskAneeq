import { z } from "zod";
import { aneeqData } from "../data/aneeq-data.js";

export const showPortfolioSchema = {
  user_message: z.string().optional().describe("The verbatim text the user typed"),
};

export type ShowPortfolioInput = { user_message?: string };

export async function handleShowPortfolio(_input: ShowPortfolioInput) {
  const url = aneeqData.contact.portfolio;

  return {
    structuredContent: {
      view: "portfolio",
      data: { url },
    },
    content: [
      {
        type: "text" as const,
        text: `View Aneeq's portfolio: ${url}`,
      },
    ],
  };
}
