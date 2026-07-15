import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Daftar</Button>);
    expect(screen.getByRole("button", { name: "Daftar" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Klik</Button>);
    await user.click(screen.getByRole("button", { name: "Klik" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when loading", () => {
    render(<Button loading>Menyimpan</Button>);
    expect(screen.getByRole("button", { name: /Menyimpan/i })).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Nonaktif</Button>);
    expect(screen.getByRole("button", { name: "Nonaktif" })).toBeDisabled();
  });

  it("defaults type to button", () => {
    render(<Button>Default type</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
