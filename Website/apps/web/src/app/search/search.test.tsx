import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/events-api", () => ({
  fetchEventsClient: vi.fn().mockResolvedValue({ data: [], meta: { total: 0, totalPages: 1 } }),
}));

vi.mock("@/components/event/event-card", () => ({
  EventCard: ({ event }: { event: { title: string } }) => <div data-testid="event-card">{event.title}</div>,
}));

import SearchPage from "./page";

describe("SearchPage", () => {
  it("renders search inputs and filters", () => {
    render(<SearchPage />);
    expect(screen.getByText("Cari gathering")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Board game/)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Kategori" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Tipe tiket" })).toBeInTheDocument();
  });
});