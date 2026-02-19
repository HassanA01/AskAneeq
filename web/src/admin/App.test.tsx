import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { App } from "./App";

const mockSummary = {
  toolCounts: [{ tool: "ask_about_aneeq", count: 5 }],
  categoryCounts: [{ category: "skills", count: 3 }],
};
const mockEvents = {
  events: [
    { id: 1, tool: "ask_about_aneeq", query: "hi", category: "skills", timestamp: "2026-01-01T00:00:00.000Z" },
  ],
};

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("App — login gate", () => {
  it("shows login form when no token in sessionStorage", () => {
    render(<App />);
    expect(screen.getByPlaceholderText("Admin token")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows error on wrong token (401 response)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    );
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Admin token"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/analytics/summary",
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: "Bearer wrong" }),
        })
      );
      expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
    });
  });

  it("stores token and shows dashboard on valid token", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockEvents), { status: 200 })
      );
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText("Admin token"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText("Tool Calls")).toBeInTheDocument();
    });
    expect(sessionStorage.getItem("adminToken")).toBe("secret");
  });

  it("shows dashboard immediately when token already in sessionStorage", async () => {
    sessionStorage.setItem("adminToken", "secret");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockEvents), { status: 200 })
      );
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Tool Calls")).toBeInTheDocument();
    });
  });
});

describe("App — logout", () => {
  it("clears token and returns to login on logout", async () => {
    sessionStorage.setItem("adminToken", "secret");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockSummary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(mockEvents), { status: 200 })
      );
    render(<App />);
    await waitFor(() => screen.getByRole("button", { name: /logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(screen.getByPlaceholderText("Admin token")).toBeInTheDocument();
    expect(sessionStorage.getItem("adminToken")).toBeNull();
  });
});
