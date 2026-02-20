import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { handleGetAvailability } from "./get-availability.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("get_availability tool", () => {
  const originalEnv = process.env.CALENDLY_URL;

  beforeEach(() => {
    delete process.env.CALENDLY_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CALENDLY_URL = originalEnv;
    } else {
      delete process.env.CALENDLY_URL;
    }
  });

  it("returns CALENDLY_URL from environment when set", async () => {
    process.env.CALENDLY_URL = "https://calendly.com/aneeq";
    const result = await handleGetAvailability({});

    expect(result.structuredContent.view).toBe("availability");
    expect(result.structuredContent.data.bookingUrl).toBe("https://calendly.com/aneeq");
  });

  it("falls back to portfolio URL when CALENDLY_URL is not set", async () => {
    const result = await handleGetAvailability({});

    expect(result.structuredContent.data.bookingUrl).toBe(aneeqData.contact.portfolio);
  });

  it("includes name in structured content", async () => {
    const result = await handleGetAvailability({});

    expect(result.structuredContent.data.name).toBe(aneeqData.overview.name);
  });

  it("returns text content with booking URL", async () => {
    process.env.CALENDLY_URL = "https://calendly.com/aneeq";
    const result = await handleGetAvailability({});

    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("https://calendly.com/aneeq");
    expect(result.content[0].text).toContain(aneeqData.overview.name);
  });
});
