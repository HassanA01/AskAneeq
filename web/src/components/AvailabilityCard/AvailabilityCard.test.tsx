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

  it("renders a booking link with correct href", () => {
    render(<AvailabilityCard data={mockData} />);
    const link = screen.getByRole("link", { name: /Book a Meeting/i });
    expect(link).toHaveAttribute("href", "https://calendly.com/aneeq");
  });

  it("opens booking link in new tab", () => {
    render(<AvailabilityCard data={mockData} />);
    const link = screen.getByRole("link", { name: /Book a Meeting/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
