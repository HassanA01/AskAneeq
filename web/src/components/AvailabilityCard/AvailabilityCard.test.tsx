import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AvailabilityCard } from "./AvailabilityCard";

vi.mock("react-calendly", () => ({
  InlineWidget: ({ url }: { url: string }) => (
    <div data-testid="calendly-widget" data-url={url} />
  ),
}));

const mockData = {
  bookingUrl: "https://calendly.com/aneeq",
  name: "Aneeq Hassan",
};

describe("AvailabilityCard", () => {
  it("renders the person's name", () => {
    render(<AvailabilityCard data={mockData} />);
    expect(screen.getByText(/Aneeq Hassan/)).toBeInTheDocument();
  });

  it("renders the Calendly inline widget with correct URL", () => {
    render(<AvailabilityCard data={mockData} />);
    const widget = screen.getByTestId("calendly-widget");
    expect(widget).toBeInTheDocument();
    expect(widget).toHaveAttribute("data-url", "https://calendly.com/aneeq");
  });

  it("renders a fallback link with correct href", () => {
    render(<AvailabilityCard data={mockData} />);
    const link = screen.getByRole("link", { name: /Can't see it/i });
    expect(link).toHaveAttribute("href", "https://calendly.com/aneeq");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
