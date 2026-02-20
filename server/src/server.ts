import { app, analyticsStore } from "./app.js";
import { logger } from "./logger.js";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;
const SERVER_URL = process.env.SERVER_URL;

process.on("exit", () => analyticsStore.close());

app.listen(PORT, () => {
  logger.info({ port: PORT }, "AskAneeq MCP Server started");
  logger.info(`  Health:   http://localhost:${PORT}/health`);
  logger.info(`  MCP:      http://localhost:${PORT}/mcp`);
  if (SERVER_URL) {
    logger.info(`  Public:   ${SERVER_URL}/mcp`);
  }
});
