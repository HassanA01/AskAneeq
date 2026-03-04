import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvailabilityCard } from "./AvailabilityCard";

const mockData = {
  bookingUrl: "https://calendly.com/aneeq",
  name: "Aneeq Hassan",
};

describe("AvailabilityCard", () => {
  it("renders the person's name", () => {
    render(<AvailabilityCard data={mockData} />);
    expect(screen.getByText(/Aneeq Hassan/)).toBeInTheDocument();
  });

  it("renders an iframe with the booking URL", () => {
    render(<AvailabilityCard data={mockData} />);
    const iframe = screen.getByTitle(/Schedule time with Aneeq Hassan/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://calendly.com/aneeq");
  });

  it("renders a fallback link with correct href", () => {
    render(<AvailabilityCard data={mockData} />);
    const link = screen.getByRole("link", { name: /Can't see it/i });
    expect(link).toHaveAttribute("href", "https://calendly.com/aneeq");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
