import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/integration/**/*.test.ts"],
    testTimeout: 15000,
    env: {
      ANALYTICS_DB_PATH: ":memory:",
      ADMIN_TOKEN: "test-token",
      NODE_ENV: "test",
    },
  },
});
