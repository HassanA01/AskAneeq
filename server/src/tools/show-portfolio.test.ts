import { describe, it, expect } from "vitest";
import { handleShowPortfolio } from "./show-portfolio.js";
import { aneeqData } from "../data/aneeq-data.js";

describe("show_portfolio tool", () => {
  it("returns portfolio view in structured content", async () => {
    const result = await handleShowPortfolio({});

    expect(result.structuredContent.view).toBe("portfolio");
  });

  it("returns portfolio URL from aneeq data", async () => {
    const result = await handleShowPortfolio({});

    expect(result.structuredContent.data.url).toBe(aneeqData.contact.portfolio);
  });

  it("returns text content with portfolio URL", async () => {
    const result = await handleShowPortfolio({});

    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain(aneeqData.contact.portfolio);
  });
});
