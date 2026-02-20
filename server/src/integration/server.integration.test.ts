import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../app.js";

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

function assertToolShape(result: { content: unknown[]; structuredContent: Record<string, unknown> }) {
  expect(result.content).toHaveLength(1);
  expect((result.content[0] as { type: string }).type).toBe("text");
  expect(typeof result.structuredContent.view).toBe("string");
  expect((result.structuredContent.view as string).length).toBeGreaterThan(0);
  expect(result.structuredContent.data).toBeDefined();
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
