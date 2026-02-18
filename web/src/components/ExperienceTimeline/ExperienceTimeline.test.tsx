import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExperienceTimeline } from "./ExperienceTimeline";
import type { Experience } from "../../types";

const mockExperience: Experience[] = [
  {
    id: "company-a",
    company: "Company A",
    role: "Senior Engineer",
    duration: "2024 - Present",
    location: "Toronto, ON",
    technologies: ["React", "TypeScript"],
    achievements: ["Built a thing", "Improved performance by 50%"],
    current: true,
  },
  {
    id: "company-b",
    company: "Company B",
    role: "Junior Engineer",
    duration: "2022 - 2024",
    location: "New York, NY",
    technologies: ["Python"],
    achievements: ["Shipped a feature"],
    current: false,
  },
];

describe("ExperienceTimeline", () => {
  it("renders all experience entries", () => {
    render(<ExperienceTimeline data={mockExperience} />);

    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Junior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Company A")).toBeInTheDocument();
    expect(screen.getByText("Company B")).toBeInTheDocument();
  });

  it("renders achievements", () => {
    render(<ExperienceTimeline data={mockExperience} />);

    expect(screen.getByText("Built a thing")).toBeInTheDocument();
    expect(screen.getByText("Improved performance by 50%")).toBeInTheDocument();
  });

  it("renders technology badges", () => {
    render(<ExperienceTimeline data={mockExperience} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  it("shows Current badge for current roles", () => {
    render(<ExperienceTimeline data={mockExperience} />);

    expect(screen.getByText("Current")).toBeInTheDocument();
  });

  it("renders location and duration", () => {
    render(<ExperienceTimeline data={mockExperience} />);

    expect(screen.getByText("Toronto, ON")).toBeInTheDocument();
    expect(screen.getByText("2024 - Present")).toBeInTheDocument();
  });

  it("highlights focused entry", () => {
    const { container } = render(
      <ExperienceTimeline data={mockExperience} focusId="company-a" />,
    );

    const focusedCard = container.querySelector(".ring-2");
    expect(focusedCard).toBeInTheDocument();
  });

  it("renders empty list without errors", () => {
    const { container } = render(<ExperienceTimeline data={[]} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});
