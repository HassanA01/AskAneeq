import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationsCard } from "./RecommendationsCard";
import type { Recommendation } from "../../types";

const mockRecs: Recommendation[] = [
  {
    id: "rec-1",
    author: "Jane Smith",
    role: "Engineering Manager",
    company: "Acme Corp",
    text: "Outstanding developer with exceptional skills.",
    linkedIn: "https://linkedin.com/in/janesmith",
  },
  {
    id: "rec-2",
    author: "Bob Jones",
    role: "Staff Engineer",
    company: "Beta Inc",
    text: "A pleasure to work with.",
  },
];

describe("RecommendationsCard", () => {
  it("renders each recommendation's author", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("renders role and company", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getByText("Engineering Manager at Acme Corp")).toBeInTheDocument();
  });

  it("renders the testimonial text", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getByText(/Outstanding developer/)).toBeInTheDocument();
  });

  it("renders LinkedIn link when provided", () => {
    render(<RecommendationsCard data={mockRecs} />);
    const link = screen.getByRole("link", { name: /LinkedIn/i });
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/janesmith");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("does not render LinkedIn link when not provided", () => {
    render(<RecommendationsCard data={[mockRecs[1]]} />);
    expect(screen.queryByRole("link", { name: /LinkedIn/i })).not.toBeInTheDocument();
  });

  it("renders all recommendations", () => {
    render(<RecommendationsCard data={mockRecs} />);
    expect(screen.getAllByText(/at /)).toHaveLength(2);
  });
});
