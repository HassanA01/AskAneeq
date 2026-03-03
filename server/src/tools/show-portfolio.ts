import { aneeqData } from "../data/aneeq-data.js";

export const showPortfolioSchema = {};

export type ShowPortfolioInput = Record<string, never>;

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
