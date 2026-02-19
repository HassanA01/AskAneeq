import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryChart } from "./CategoryChart";

describe("CategoryChart", () => {
  it("renders each category name", () => {
    render(
      <CategoryChart
        categoryCounts={[
          { category: "skills", count: 8 },
          { category: "experience", count: 3 },
        ]}
      />
    );
    expect(screen.getByText("skills")).toBeInTheDocument();
    expect(screen.getByText("experience")).toBeInTheDocument();
  });

  it("renders each count value", () => {
    render(
      <CategoryChart
        categoryCounts={[
          { category: "skills", count: 8 },
          { category: "experience", count: 3 },
        ]}
      />
    );
    // counts 8 and 3 → share% are 73 and 27 — no collision risk
    expect(screen.getAllByText("8").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1);
  });

  it("renders empty state when no data", () => {
    render(<CategoryChart categoryCounts={[]} />);
    expect(screen.getByText("No data yet.")).toBeInTheDocument();
  });
});
