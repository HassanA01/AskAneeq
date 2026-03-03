import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PortfolioView } from "./PortfolioView";

const mockData = { url: "https://aneeqhassan.com" };

describe("PortfolioView", () => {
  it("renders the heading", () => {
    render(<PortfolioView data={mockData} />);
    expect(screen.getByText("Aneeq's Portfolio")).toBeInTheDocument();
  });

  it("renders an iframe with the portfolio URL", () => {
    render(<PortfolioView data={mockData} />);
    const iframe = screen.getByTitle("Aneeq Hassan's Portfolio");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://aneeqhassan.com");
  });

  it("renders a fallback link with correct href", () => {
    render(<PortfolioView data={mockData} />);
    const link = screen.getByRole("link", { name: /Open in a new tab/i });
    expect(link).toHaveAttribute("href", "https://aneeqhassan.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
