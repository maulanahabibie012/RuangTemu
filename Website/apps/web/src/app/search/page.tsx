"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EventCard } from "@/components/event/event-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, DEMO_EVENTS } from "@/lib/demo-events";
import { fetchEventsClient } from "@/lib/events-api";
import type { DemoEvent } from "@/components/event/event-card";
import type { Event } from "@/types/event";

const TICKET_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "FREE", label: "Gratis" },
  { value: "PAID", label: "Berbayar" },
];

const SORT_OPTIONS = [
  { value: "date_asc", label: "Terdekat" },
  { value: "date_desc", label: "Terbaru" },
  { value: "popular", label: "Populer" },
  { value: "price_asc", label: "Harga ↑" },
  { value: "price_desc", label: "Harga ↓" },
];

const LIMIT = 9;

function useDebounce(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL
  const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [ticketType, setTicketType] = useState(searchParams.get("ticketType") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "date_asc");
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") ?? "");

  const [events, setEvents] = useState<(Event | DemoEvent)[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const debouncedKeyword = useDebounce(keyword);
  const abortRef = useRef<AbortController | null>(null);

  // Build params object
  const buildParams = useCallback(
    (p: number) => {
      const params: Record<string, string> = { page: String(p), limit: String(LIMIT) };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (category) params.category = category;
      if (ticketType) params.ticketType = ticketType;
      if (sort) params.sort = sort;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      return params;
    },
    [debouncedKeyword, category, ticketType, sort, dateFrom, dateTo],
  );

  // Sync URL with current filters
  const syncUrl = useCallback(() => {
    const sp = new URLSearchParams();
    if (debouncedKeyword) sp.set("keyword", debouncedKeyword);
    if (category) sp.set("category", category);
    if (ticketType) sp.set("ticketType", ticketType);
    if (sort && sort !== "date_asc") sp.set("sort", sort);
    if (dateFrom) sp.set("dateFrom", dateFrom);
    if (dateTo) sp.set("dateTo", dateTo);
    const qs = sp.toString();
    router.replace(`/search${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, debouncedKeyword, category, ticketType, sort, dateFrom, dateTo]);

  // Fetch page 1 when filters change
  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    setPage(1);
    syncUrl();

    fetchEventsClient(buildParams(1))
      .then((res) => {
        if (ac.signal.aborted) return;
        setEvents(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
        setIsDemo(false);
      })
      .catch(() => {
        if (ac.signal.aborted) return;
        setEvents(DEMO_EVENTS);
        setTotal(DEMO_EVENTS.length);
        setTotalPages(1);
        setIsDemo(true);
      })
      .finally(() => {
        if (!ac.signal.aborted) {
          setLoading(false);
          setInitialLoad(false);
        }
      });

    return () => ac.abort();
  }, [buildParams, syncUrl]);

  // Load more handler
  const loadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetchEventsClient(buildParams(nextPage));
      setEvents((prev) => [...prev, ...res.data]);
      setPage(nextPage);
      setTotalPages(res.meta.totalPages);
    } catch {
      // silently fail — existing results stay
    } finally {
      setLoading(false);
    }
  };

  const hasMore = page < totalPages && !isDemo;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Cari gathering
        </h1>
        <p className="text-[var(--muted)]">
          {isDemo
            ? "API offline — menampilkan data demo"
            : initialLoad
              ? "Memuat…"
              : `${total} event ditemukan`}
        </p>
      </header>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Keyword */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="keyword" className="sr-only">
            Kata kunci
          </label>
          <input
            id="keyword"
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Board game, meetup, futsal…"
            className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm"
          aria-label="Kategori"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c === "Semua" ? "" : c}>
              {c}
            </option>
          ))}
        </select>

        {/* Ticket type */}
        <select
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm"
          aria-label="Tipe tiket"
        >
          {TICKET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm"
          aria-label="Urutkan"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Date from */}
        <div>
          <label htmlFor="dateFrom" className="mb-1 block text-xs text-[var(--muted)]">
            Dari
          </label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm"
          />
        </div>

        {/* Date to */}
        <div>
          <label htmlFor="dateTo" className="mb-1 block text-xs text-[var(--muted)]">
            Sampai
          </label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] px-3 text-sm"
          />
        </div>
      </div>

      {/* Results */}
      {events.length === 0 && !loading ? (
        <p className="py-20 text-center text-[var(--muted)]">
          Tidak ada event yang cocok.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Memuat…" : "Muat lebih banyak"}
          </Button>
        </div>
      )}

      {loading && events.length === 0 && (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        </div>
      )}
    </div>
  );
}