import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { app, analyticsStore } from "../app.js";

afterAll(() => {
  analyticsStore.close();
});

// Helper: build a JSON-RPC tools/call payload
function toolCall(name: string, args: Record<string, unknown> = {}, id = 1) {
  return {
    jsonrpc: "2.0",
    method: "tools/call",
    params: { name, arguments: args },
    id,
  };
}

// Helper: build a generic JSON-RPC request
function rpcCall(method: string, params: Record<string, unknown>, id = 1) {
  return { jsonrpc: "2.0", method, params, id };
}

// POST to /mcp and return the response
// The MCP StreamableHTTP transport requires both application/json and
// text/event-stream in the Accept header (MCP spec requirement).
async function mcp(body: object) {
  return request(app)
    .post("/mcp")
    .set("Content-Type", "application/json")
    .set("Accept", "application/json, text/event-stream")
    .send(body);
}

function assertToolShape(result: unknown) {
  expect(result, "tool result must be defined (check for JSON-RPC error in res.body)").toBeDefined();
  expect(result).not.toBeNull();
  const r = result as { content: unknown[]; structuredContent: Record<string, unknown> };
  expect(r.content).toHaveLength(1);
  expect((r.content[0] as { type: string }).type).toBe("text");
  expect(typeof r.structuredContent.view).toBe("string");
  expect((r.structuredContent.view as string).length).toBeGreaterThan(0);
  expect(r.structuredContent.data).toBeDefined();
}

describe("Tool response shapes", () => {
  it("ask_about_aneeq: overview", async () => {
    const res = await mcp(toolCall("ask_about_aneeq", { category: "overview" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("ask_about_aneeq: experience", async () => {
    const res = await mcp(toolCall("ask_about_aneeq", { category: "experience" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("ask_about_aneeq: skills", async () => {
    const res = await mcp(toolCall("ask_about_aneeq", { category: "skills" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_resume: summary", async () => {
    const res = await mcp(toolCall("get_resume", { format: "summary" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_resume: full", async () => {
    const res = await mcp(toolCall("get_resume", { format: "full" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("search_projects: by technology", async () => {
    const res = await mcp(toolCall("search_projects", { technology: "React" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("ask_anything: free-form query", async () => {
    const res = await mcp(toolCall("ask_anything", { query: "remote work" }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_availability: returns booking link view", async () => {
    const res = await mcp(toolCall("get_availability", {}));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("compare_skills: two skills", async () => {
    const res = await mcp(toolCall("compare_skills", { skills: ["TypeScript", "React"] }));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("get_recommendations: returns testimonials view", async () => {
    const res = await mcp(toolCall("get_recommendations", {}));
    expect(res.status).toBe(200);
    assertToolShape(res.body.result);
  });

  it("track_analytics: logs event", async () => {
    const res = await mcp(toolCall("track_analytics", { tool: "ask_about_aneeq", category: "skills" }));
    expect(res.status).toBe(200);
    expect(res.body.result.content[0].type).toBe("text");
  });
});

describe("Widget HTML integrity", () => {
  it("widget resource HTML has JS inlined, not linked", async () => {
    const res = await mcp(
      rpcCall("resources/read", { uri: "ui://widget/aneeq-profile.html" })
    );
    expect(res.status).toBe(200);

    const html: string = res.body.result.contents[0].text;

    // JS must be inlined as text content, not linked as a src attribute
    expect(html).toContain('<script type="module">');
    expect(html).not.toMatch(/<script\s[^>]*src=/);

    // CSS must be inlined in a <style> tag
    expect(html).toContain("<style>");
    expect(html).not.toMatch(/<link\s[^>]*rel=["']stylesheet["']/);
  });
});

describe("Admin auth", () => {
  it("returns 401 or 503 with no Authorization header", async () => {
    const res = await request(app).get("/api/analytics/summary");
    expect([401, 503]).toContain(res.status);
  });

  it("returns 401 with wrong token", async () => {
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("returns 200 with correct token and expected shape", async () => {
    const res = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer test-token");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("toolCounts");
    expect(res.body).toHaveProperty("categoryCounts");
  });
});

describe("Analytics write-through", () => {
  it("track_analytics persists event readable via admin API", async () => {
    // Fire an analytics event through the MCP tool
    const trackRes = await mcp(
      toolCall("track_analytics", {
        tool: "ask_about_aneeq",
        category: "integration-test",
        query: "write-through test",
      })
    );
    expect(trackRes.status).toBe(200);

    // Read events back via admin API
    const eventsRes = await request(app)
      .get("/api/analytics/events")
      .set("Authorization", "Bearer test-token");
    expect(eventsRes.status).toBe(200);

    const events = eventsRes.body.events as Array<{
      tool: string;
      category: string | null;
      query: string | null;
    }>;
    const match = events.find(
      (e) => e.tool === "ask_about_aneeq" && e.category === "integration-test"
    );
    expect(match).toBeDefined();
  });
});
