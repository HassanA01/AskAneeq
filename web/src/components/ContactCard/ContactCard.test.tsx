import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactCard } from "./ContactCard";
import type { Contact } from "../../types";

const mockContact: Contact = {
  email: "test@example.com",
  github: "https://github.com/testuser",
  linkedin: "https://linkedin.com/in/testuser",
  portfolio: "https://testuser.com",
};

describe("ContactCard", () => {
  it("renders heading", () => {
    render(<ContactCard data={mockContact} />);

    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
  });

  it("renders email with mailto link", () => {
    render(<ContactCard data={mockContact} />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    const emailLink = screen.getByText("test@example.com").closest("a");
    expect(emailLink).toHaveAttribute("href", "mailto:test@example.com");
  });

  it("renders GitHub handle from URL", () => {
    render(<ContactCard data={mockContact} />);

    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("renders portfolio without https://", () => {
    render(<ContactCard data={mockContact} />);

    expect(screen.getByText("testuser.com")).toBeInTheDocument();
  });

  it("all links open in new tab", () => {
    render(<ContactCard data={mockContact} />);

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
