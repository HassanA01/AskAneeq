import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileCard } from "./ProfileCard";
import type { Overview } from "../../types";

const mockData: Overview = {
  name: "Aneeq Hassan",
  title: "AI Software Engineer",
  tagline: "Building intelligent systems",
  yearsExperience: 3,
  languages: ["English", "French", "Spanish"],
};

describe("ProfileCard", () => {
  it("renders name and title", () => {
    render(<ProfileCard data={mockData} />);

    expect(screen.getByRole("heading", { name: "Aneeq Hassan" })).toBeInTheDocument();
    expect(screen.getByText("AI Software Engineer")).toBeInTheDocument();
  });

  it("renders tagline", () => {
    render(<ProfileCard data={mockData} />);

    expect(screen.getByText("Building intelligent systems")).toBeInTheDocument();
  });

  it("renders years of experience", () => {
    render(<ProfileCard data={mockData} />);

    expect(screen.getByText("3+ years experience")).toBeInTheDocument();
  });

  it("renders language count", () => {
    render(<ProfileCard data={mockData} />);

    expect(screen.getByText("3 languages")).toBeInTheDocument();
  });

  it("renders all spoken languages as badges", () => {
    render(<ProfileCard data={mockData} />);

    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("French")).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
  });
});
