import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createAdminRouter } from "./admin.js";
import type { AnalyticsStore } from "../analytics/store.js";

function makeMockStore(): AnalyticsStore {
  return {
    insert: vi.fn(),
    getToolCounts: vi.fn().mockReturnValue([{ tool: "ask_about_aneeq", count: 5 }]),
    getCategoryCounts: vi.fn().mockReturnValue([{ category: "skills", count: 3 }]),
    getRecentEvents: vi.fn().mockReturnValue([
      { id: 1, tool: "ask_about_aneeq", query: "hi", category: "skills", timestamp: "2026-01-01T00:00:00.000Z" },
    ]),
    close: vi.fn(),
  } as unknown as AnalyticsStore;
}

function makeApp(token: string | undefined) {
  const app = express();
  app.use(express.json());
  const store = makeMockStore();
  app.use("/api/analytics", createAdminRouter(store, token));
  return app;
}

describe("admin router — auth", () => {
  it("returns 503 when ADMIN_TOKEN is not configured", async () => {
    const app = makeApp(undefined);
    const res = await request(app).get("/api/analytics/summary");
    expect(res.status).toBe(503);
  });

  it("returns 401 when Authorization header is missing", async () => {
    const app = makeApp("secret");
    const res = await request(app).get("/api/analytics/summary");
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is wrong", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("allows request with correct token", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer secret");
    expect(res.status).toBe(200);
  });
});

describe("admin router — GET /summary", () => {
  it("returns toolCounts and categoryCounts", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer secret");
    expect(res.body).toEqual({
      toolCounts: [{ tool: "ask_about_aneeq", count: 5 }],
      categoryCounts: [{ category: "skills", count: 3 }],
    });
  });
});

describe("admin router — GET /events", () => {
  it("returns events array", async () => {
    const app = makeApp("secret");
    const res = await request(app)
      .get("/api/analytics/events")
      .set("Authorization", "Bearer secret");
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].tool).toBe("ask_about_aneeq");
  });

  it("passes limit query param to store", async () => {
    const store = makeMockStore();
    const app = express();
    app.use(express.json());
    app.use("/api/analytics", createAdminRouter(store, "secret"));
    await request(app)
      .get("/api/analytics/events?limit=10")
      .set("Authorization", "Bearer secret");
    expect(store.getRecentEvents).toHaveBeenCalledWith(10);
  });

  it("defaults limit to 50 when query param is absent", async () => {
    const store = makeMockStore();
    const app = express();
    app.use(express.json());
    app.use("/api/analytics", createAdminRouter(store, "secret"));
    await request(app)
      .get("/api/analytics/events")
      .set("Authorization", "Bearer secret");
    expect(store.getRecentEvents).toHaveBeenCalledWith(50);
  });
});
