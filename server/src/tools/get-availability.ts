import { aneeqData } from "../data/aneeq-data.js";

export const getAvailabilitySchema = {};

export type GetAvailabilityInput = Record<string, never>;

export async function handleGetAvailability(_input: GetAvailabilityInput) {
  const bookingUrl =
    process.env.CALENDLY_URL ?? aneeqData.contact.portfolio;

  return {
    structuredContent: {
      view: "availability",
      data: { bookingUrl, name: aneeqData.overview.name },
    },
    content: [
      {
        type: "text" as const,
        text: `Schedule time with ${aneeqData.overview.name}: ${bookingUrl}`,
      },
    ],
  };
}
