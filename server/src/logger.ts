import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  base: { service: "ask-aneeq", version: "1.0.0" },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino/file",
          options: { destination: 1 },
        },
      }),
});
