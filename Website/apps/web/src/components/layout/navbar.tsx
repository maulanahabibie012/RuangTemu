"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CalendarPlus, Menu, Search, Ticket, X, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const publicLinks = [
  { href: "/", label: "Beranda" },
  { href: "/search", label: "Cari" },
];

const authLinks = [
  { href: "/my-tickets", label: "Tiket saya" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = mounted && isAuthenticated ? [...publicLinks, ...authLinks] : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface-elevated/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-primary text-sm font-bold text-primary-fg shadow-sm">
            RT
          </span>
          <span className="hidden sm:inline">RuangTemu</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/search" aria-label="Cari gathering">
            <Button variant="ghost" size="sm" className="min-w-0 px-3">
              <Search className="size-4" />
            </Button>
          </Link>
          <Link href="/organizer/events/new">
            <Button size="sm" className="gap-1.5">
              <CalendarPlus className="size-4" />
              Buat Event
            </Button>
          </Link>
          
          {mounted && isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted hover:text-foreground">
                  <UserIcon className="size-4" />
                  <span className="max-w-[100px] truncate">{user?.name || 'Profil'}</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logout()}
                aria-label="Keluar"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : mounted ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Daftar
                </Button>
              </Link>
            </>
          ) : (
            <div className="w-[120px] h-9 bg-muted/20 animate-pulse rounded-md ml-2" />
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)] text-foreground hover:bg-surface"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

      </div>

      <div
        className={cn(
          "border-t border-border bg-surface-elevated md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3" aria-label="Menu mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium text-foreground hover:bg-surface"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/organizer/events/new"
            className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium text-primary"
            onClick={() => setOpen(false)}
          >
            <CalendarPlus className="size-4" />
            Buat Event
          </Link>
          
          <div className="my-2 h-px bg-border" />
          
          {mounted && isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium text-foreground hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                <UserIcon className="size-4" />
                Profil Saya
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium text-error hover:bg-error-light/50 text-left"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
              >
                <LogOut className="size-4" />
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium text-foreground hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium text-primary hover:bg-surface"
                onClick={() => setOpen(false)}
              >
                Daftar Akun
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}