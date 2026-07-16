import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "e1" }),
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
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
  getEvent: vi.fn().mockResolvedValue({
    id: "e1",
    title: "Test Event Detail",
    description: "A great event",
    category: "TECHNOLOGY",
    coverImageUrl: null,
    locationName: "Jakarta Pusat",
    locationLat: -6.2,
    locationLng: 106.8,
    eventDate: "2024-06-15T10:00:00Z",
    eventEndDate: "2024-06-15T12:00:00Z",
    maxCapacity: 50,
    currentCount: 10,
    ticketType: "FREE",
    ticketPrice: 0,
    status: "ACTIVE",
    organizerId: "org1",
    organizer: { id: "org1", name: "Organizer", avatarUrl: null, email: "org@test.com" },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  }),
  deleteEvent: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/demo-events", () => ({
  DEMO_EVENTS: [],
}));

vi.mock("@/components/layout/navbar", () => ({ Navbar: () => <nav data-testid="navbar" /> }));
vi.mock("@/components/layout/footer", () => ({ Footer: () => <footer data-testid="footer" /> }));

import EventDetailPage from "./page";

describe("EventDetailPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders event title and location after loading", async () => {
    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Event Detail")).toBeInTheDocument();
    });

    expect(screen.getByText("Jakarta Pusat")).toBeInTheDocument();
    expect(screen.getByText("Daftar Sekarang")).toBeInTheDocument();
  });

  it("shows organizer info", async () => {
    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Organizer")).toBeInTheDocument();
    });

    expect(screen.getByText("org@test.com")).toBeInTheDocument();
  });

  it("shows Gratis for free events", async () => {
    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Gratis")).toBeInTheDocument();
    });
  });

  it("shows edit/delete buttons for owner", async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { id: "org1", name: "Organizer", email: "org@test.com", role: "ORGANIZER" } as never;

    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByTitle("Edit")).toBeInTheDocument();
    });

    expect(screen.getByTitle("Hapus")).toBeInTheDocument();
  });
});
