import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillsView } from "./SkillsView";
import type { SkillCategory } from "../../types";

const mockSkills: SkillCategory[] = [
  {
    category: "Languages",
    skills: [
      { name: "Python", proficiency: "expert" },
      { name: "Go", proficiency: "advanced" },
      { name: "C++", proficiency: "intermediate" },
    ],
  },
  {
    category: "Frontend",
    skills: [{ name: "React", proficiency: "expert" }],
  },
];

describe("SkillsView", () => {
  it("renders skill categories", () => {
    render(<SkillsView data={mockSkills} />);

    expect(screen.getByText("Languages")).toBeInTheDocument();
    expect(screen.getByText("Frontend")).toBeInTheDocument();
  });

  it("renders all skills", () => {
    render(<SkillsView data={mockSkills} />);

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("C++")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders proficiency legend", () => {
    render(<SkillsView data={mockSkills} />);

    expect(screen.getByText(/expert/)).toBeInTheDocument();
    expect(screen.getByText(/advanced/)).toBeInTheDocument();
    expect(screen.getByText(/intermediate/)).toBeInTheDocument();
  });
});
