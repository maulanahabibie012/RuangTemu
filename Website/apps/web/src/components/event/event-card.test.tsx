import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventCard, type DemoEvent } from "./event-card";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const sample: DemoEvent = {
  id: "boardgame-night",
  title: "Board Game Night: Strategy & Snacks",
  category: "Board Game",
  location: "Jakarta Selatan",
  dateLabel: "Sab, 28 Mar · 19:00",
  quotaLabel: "12 / 20 kursi",
  priceLabel: "Gratis",
  isFree: true,
  coverGradient: "from-blue-500 to-indigo-600",
};

describe("EventCard", () => {
  it("shows title, category, location, date, and quota", () => {
    render(<EventCard event={sample} />);
    expect(screen.getByText(sample.title)).toBeInTheDocument();
    expect(screen.getByText(sample.category)).toBeInTheDocument();
    expect(screen.getByText(sample.location)).toBeInTheDocument();
    expect(screen.getByText(sample.dateLabel)).toBeInTheDocument();
    expect(screen.getByText(sample.quotaLabel)).toBeInTheDocument();
    expect(screen.getByText(sample.priceLabel)).toBeInTheDocument();
  });

  it("links to event detail page", () => {
    render(<EventCard event={sample} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `/events/${sample.id}`);
  });
});
