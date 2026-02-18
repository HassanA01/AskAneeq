import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EducationCard } from "./EducationCard";
import type { Education } from "../../types";

const mockEducation: Education[] = [
  {
    institution: "University of Toronto",
    degree: "Bachelor of Science",
    field: "Computer Science",
    duration: "2020 - 2025",
    highlights: ["Teaching Assistant", "Dean's List"],
  },
];

describe("EducationCard", () => {
  it("renders institution name", () => {
    render(<EducationCard data={mockEducation} />);

    expect(screen.getByText("University of Toronto")).toBeInTheDocument();
  });

  it("renders degree and field", () => {
    render(<EducationCard data={mockEducation} />);

    expect(
      screen.getByText("Bachelor of Science in Computer Science"),
    ).toBeInTheDocument();
  });

  it("renders duration", () => {
    render(<EducationCard data={mockEducation} />);

    expect(screen.getByText("2020 - 2025")).toBeInTheDocument();
  });

  it("renders highlights", () => {
    render(<EducationCard data={mockEducation} />);

    expect(screen.getByText("Teaching Assistant")).toBeInTheDocument();
    expect(screen.getByText("Dean's List")).toBeInTheDocument();
  });

  it("renders multiple education entries", () => {
    const multipleEdu: Education[] = [
      ...mockEducation,
      {
        institution: "MIT",
        degree: "Master of Science",
        field: "AI",
        duration: "2025 - 2027",
        highlights: [],
      },
    ];

    render(<EducationCard data={multipleEdu} />);

    expect(screen.getByText("University of Toronto")).toBeInTheDocument();
    expect(screen.getByText("MIT")).toBeInTheDocument();
  });

  it("handles empty highlights gracefully", () => {
    const noHighlights: Education[] = [
      {
        institution: "Test University",
        degree: "BSc",
        field: "CS",
        duration: "2020",
        highlights: [],
      },
    ];

    render(<EducationCard data={noHighlights} />);

    expect(screen.getByText("Test University")).toBeInTheDocument();
  });
});
