import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryLog } from "./QueryLog";

const mockEvents = [
  {
    id: 1,
    tool: "ask_about_aneeq",
    query: "What are his skills?",
    category: "skills",
    timestamp: "2026-01-15T10:30:00.000Z",
  },
  {
    id: 2,
    tool: "get_resume",
    query: null,
    category: null,
    timestamp: "2026-01-15T11:00:00.000Z",
  },
];

describe("QueryLog", () => {
  it("renders tool name for each event", () => {
    render(<QueryLog events={mockEvents} />);
    expect(screen.getByText("ask_about_aneeq")).toBeInTheDocument();
    expect(screen.getByText("get_resume")).toBeInTheDocument();
  });

  it("renders query text when present", () => {
    render(<QueryLog events={mockEvents} />);
    expect(screen.getByText("What are his skills?")).toBeInTheDocument();
  });

  it("renders category when present", () => {
    render(<QueryLog events={mockEvents} />);
    expect(screen.getByText("skills")).toBeInTheDocument();
  });

  it("renders — for null query and category", () => {
    render(<QueryLog events={mockEvents} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("renders empty state when no events", () => {
    render(<QueryLog events={[]} />);
    expect(screen.getByText("No queries yet.")).toBeInTheDocument();
  });
});
