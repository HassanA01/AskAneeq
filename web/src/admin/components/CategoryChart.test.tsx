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
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<CategoryChart categoryCounts={[]} />);
    expect(screen.getByText("No data yet.")).toBeInTheDocument();
  });
});
