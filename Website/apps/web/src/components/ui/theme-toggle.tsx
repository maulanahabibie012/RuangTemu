"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toggles light ↔ dark only.
 * Touch target ≥ 44px (ui-ux rules).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-muted",
          className,
        )}
        aria-label="Ganti tema"
        disabled
      >
        <Sun className="size-4 opacity-40" aria-hidden />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-[var(--radius-md)]",
        "text-foreground transition-colors duration-200 hover:bg-surface",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      aria-label={isDark ? "Mode gelap — klik untuk mode terang" : "Mode terang — klik untuk mode gelap"}
      title={isDark ? "Mode gelap — klik untuk mode terang" : "Mode terang — klik untuk mode gelap"}
    >
      {isDark ? (
        <Moon className="size-4" aria-hidden />
      ) : (
        <Sun className="size-4" aria-hidden />
      )}
    </button>
  );
}
