import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillComparisonView } from "./SkillComparisonView";
import type { SkillMatch } from "../../types";

const mockData: SkillMatch[] = [
  { name: "Python", proficiency: "expert", category: "Languages" },
  { name: "Go", proficiency: "advanced", category: "Languages" },
  { name: "COBOL", proficiency: "not found", category: null },
];

describe("SkillComparisonView", () => {
  it("renders each skill name", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("COBOL")).toBeInTheDocument();
  });

  it("renders proficiency labels for known skills", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getByText("expert")).toBeInTheDocument();
    expect(screen.getByText("advanced")).toBeInTheDocument();
  });

  it("renders 'not found' for unknown skills", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getByText("not found")).toBeInTheDocument();
  });

  it("renders category label for known skills", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getAllByText("Languages")).toHaveLength(2);
  });

  it("renders all skill cards", () => {
    render(<SkillComparisonView data={mockData} />);
    expect(screen.getAllByText(/Python|Go|COBOL/)).toHaveLength(3);
  });
});
