import { describe, it, expect } from "vitest";
import { logger } from "./logger.js";

describe("logger", () => {
  it("exports a pino logger instance", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.child).toBe("function");
  });

  it("creates child loggers with additional context", () => {
    const child = logger.child({ requestId: "test-123" });
    expect(child).toBeDefined();
    expect(typeof child.info).toBe("function");
  });
});
