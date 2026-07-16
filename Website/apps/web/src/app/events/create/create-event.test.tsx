import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

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
  createEvent: vi.fn(),
}));

vi.mock("@/components/layout/navbar", () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/layout/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));
vi.mock("@/components/event/event-form", () => ({
  default: ({ isEdit }: { isEdit?: boolean }) => (
    <form data-testid="event-form">
      <button type="submit">{isEdit ? "Simpan Perubahan" : "Buat Event"}</button>
    </form>
  ),
}));

import CreateEventPage from "./page";

describe("CreateEventPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows login required when not authenticated", () => {
    mockAuth.isAuthenticated = false;
    render(<CreateEventPage />);
    expect(screen.getByText("Login Diperlukan")).toBeInTheDocument();
  });

  it("shows form when authenticated", () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: "u1", name: "Test", email: "t@t.com", role: "ORGANIZER" } as never;
    render(<CreateEventPage />);
    expect(screen.getByText("Buat Event Baru")).toBeInTheDocument();
    expect(screen.getByTestId("event-form")).toBeInTheDocument();
  });

  it("has login link when unauthenticated", () => {
    mockAuth.isAuthenticated = false;
    render(<CreateEventPage />);
    expect(screen.getByText("Masuk")).toHaveAttribute("href", "/login");
  });
});