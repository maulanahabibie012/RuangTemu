import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EventForm from "./event-form";

describe("EventForm", () => {
  const mockSubmit = vi.fn().mockResolvedValue(undefined);

  it("renders required fields", () => {
    render(<EventForm onSubmit={mockSubmit} />);
    expect(screen.getByText("Judul Event *")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi *")).toBeInTheDocument();
    expect(screen.getByText("Kategori *")).toBeInTheDocument();
    expect(screen.getByText("Tanggal Mulai *")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nama tempat atau alamat")).toBeInTheDocument();
    expect(screen.getByText("Kapasitas Maksimum *")).toBeInTheDocument();
  });

  it("renders optional fields", () => {
    render(<EventForm onSubmit={mockSubmit} />);
    expect(screen.getByPlaceholderText("-6.2088")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("106.8456")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://example.com/image.jpg")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("shows create button by default", () => {
    render(<EventForm onSubmit={mockSubmit} />);
    expect(screen.getByRole("button", { name: /Buat Event/ })).toBeInTheDocument();
  });

  it("shows save button in edit mode", () => {
    render(<EventForm onSubmit={mockSubmit} isEdit />);
    expect(screen.getByRole("button", { name: /Simpan Perubahan/ })).toBeInTheDocument();
  });

  it("shows price field when ticket type is PAID", () => {
    render(<EventForm onSubmit={mockSubmit} />);
    const ticketSelect = document.getElementById("ticketType") as HTMLSelectElement;
    fireEvent.change(ticketSelect, { target: { value: "PAID" } });
    expect(screen.getByText("Harga (Rp)")).toBeInTheDocument();
  });

  it("pre-fills values from initialData", () => {
    render(
      <EventForm
        onSubmit={mockSubmit}
        initialData={{
          title: "Test Event",
          description: "Test desc",
          locationName: "Jakarta",
          maxCapacity: 50,
        }}
      />,
    );
    expect(screen.getByDisplayValue("Test Event")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test desc")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Jakarta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });
});