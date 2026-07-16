import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/event/event-card", () => ({
  EventCard: ({ event }: { event: { title: string } }) => <div data-testid="event-card">{event.title}</div>,
}));

vi.mock("@/lib/events-api", () => ({
  getPopularEvents: vi.fn().mockRejectedValue(new Error("no api")),
  getEvents: vi.fn().mockRejectedValue(new Error("no api")),
}));

import HomePage from "./page";

describe("HomePage", () => {
  it("renders hero section with key elements", async () => {
    const Page = await HomePage();
    render(Page);

    expect(screen.getByText(/Temukan gathering/i)).toBeInTheDocument();
    expect(screen.getByText("Cari gathering")).toBeInTheDocument();
    expect(screen.getByText("Buat event")).toBeInTheDocument();
  });

  it("renders demo events as fallback", async () => {
    const Page = await HomePage();
    render(Page);

    const cards = screen.getAllByTestId("event-card");
    expect(cards.length).toBeGreaterThan(0);
  });
});
