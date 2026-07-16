import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockAuth = { isAuthenticated: false, user: null, accessToken: null, refreshToken: null, logout: vi.fn(), setAuth: vi.fn(), setTokens: vi.fn(), updateUser: vi.fn() };
vi.mock("@/stores/auth", () => ({
  useAuthStore: Object.assign(() => mockAuth, {
    getState: () => mockAuth,
    setState: vi.fn(),
    subscribe: vi.fn(),
  }),
}));

vi.mock("@/lib/events-api", () => ({
  getOrganizerEvents: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/components/layout/navbar", () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/layout/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/components/event/event-card", () => ({
  EventCard: ({ event }: { event: { title: string } }) => <div data-testid="event-card">{event.title}</div>,
}));

import MyEventsPage from "./page";

describe("MyEventsPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows login required when not authenticated", () => {
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    render(<MyEventsPage />);
    expect(screen.getByText("Login Diperlukan")).toBeInTheDocument();
  });

  it("shows page title when authenticated", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: "u1", name: "Test", email: "t@t.com", role: "ATTENDEE" } as never;
    render(<MyEventsPage />);
    expect(screen.getByText("Event Saya")).toBeInTheDocument();
  });

  it("has create event button", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: "u1", name: "Test", email: "t@t.com", role: "ATTENDEE" } as never;
    render(<MyEventsPage />);
    const btns = screen.getAllByText("Buat Event");
    expect(btns.length).toBeGreaterThan(0);
  });

  it("shows status filter buttons", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: "u1", name: "Test", email: "t@t.com", role: "ATTENDEE" } as never;
    render(<MyEventsPage />);
    expect(screen.getByText("Semua")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();
  });
});