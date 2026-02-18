import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectsGallery } from "./ProjectsGallery";
import type { Project } from "../../types";

const mockProjects: Project[] = [
  {
    id: "project-a",
    name: "MailflowAI",
    description: "AI-powered email automation",
    techStack: ["Python", "GCP"],
    impact: "Reduced costs by $14K",
    metrics: "Response times from hours to minutes",
    links: { github: "https://github.com/test/mailflow" },
    featured: true,
  },
  {
    id: "project-b",
    name: "BizReach",
    description: "Full-stack marketplace",
    techStack: ["React", "Node.js"],
    featured: false,
  },
];

describe("ProjectsGallery", () => {
  it("renders all projects", () => {
    render(<ProjectsGallery data={mockProjects} />);

    expect(screen.getByText("MailflowAI")).toBeInTheDocument();
    expect(screen.getByText("BizReach")).toBeInTheDocument();
  });

  it("renders project descriptions", () => {
    render(<ProjectsGallery data={mockProjects} />);

    expect(screen.getByText("AI-powered email automation")).toBeInTheDocument();
  });

  it("renders tech stack badges", () => {
    render(<ProjectsGallery data={mockProjects} />);

    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("GCP")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("renders impact section when available", () => {
    render(<ProjectsGallery data={mockProjects} />);

    expect(screen.getByText("Reduced costs by $14K")).toBeInTheDocument();
    expect(
      screen.getByText("Response times from hours to minutes"),
    ).toBeInTheDocument();
  });

  it("renders Featured badge for featured projects", () => {
    render(<ProjectsGallery data={mockProjects} />);

    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("renders GitHub link", () => {
    render(<ProjectsGallery data={mockProjects} />);

    const codeLink = screen.getByText("Code");
    expect(codeLink.closest("a")).toHaveAttribute(
      "href",
      "https://github.com/test/mailflow",
    );
  });

  it("shows search context when searchQuery provided", () => {
    render(<ProjectsGallery data={mockProjects} searchQuery="mail" />);

    expect(screen.getByText(/matching/)).toBeInTheDocument();
  });

  it("shows technology filter context", () => {
    render(<ProjectsGallery data={mockProjects} technologyFilter="Python" />);

    expect(screen.getByText(/using/)).toBeInTheDocument();
  });

  it("shows empty state when no projects", () => {
    render(<ProjectsGallery data={[]} />);

    expect(
      screen.getByText("No projects found matching your criteria."),
    ).toBeInTheDocument();
  });
});
