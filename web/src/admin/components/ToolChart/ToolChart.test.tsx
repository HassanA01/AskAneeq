import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToolChart } from "./ToolChart";

describe("ToolChart", () => {
  it("renders each tool name", () => {
    render(
      <ToolChart
        toolCounts={[
          { tool: "ask_about_aneeq", count: 10 },
          { tool: "get_resume", count: 4 },
        ]}
      />
    );
    expect(screen.getByText("ask_about_aneeq")).toBeInTheDocument();
    expect(screen.getByText("get_resume")).toBeInTheDocument();
  });

  it("renders each count value", () => {
    render(
      <ToolChart
        toolCounts={[
          { tool: "ask_about_aneeq", count: 10 },
          { tool: "get_resume", count: 4 },
        ]}
      />
    );
    // counts 10 and 4 → share% are 71 and 29 — no collision risk
    expect(screen.getAllByText("10").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when no data", () => {
    render(<ToolChart toolCounts={[]} />);
    expect(screen.getByText("No data yet.")).toBeInTheDocument();
  });
});
