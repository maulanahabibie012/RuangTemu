import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DemoEvent = {
  id: string;
  title: string;
  category: string;
  location: string;
  dateLabel: string;
  quotaLabel: string;
  priceLabel: string;
  isFree: boolean;
  coverGradient: string;
};

export function EventCard({ event }: { event: DemoEvent }) {
  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <Card
        className={cn(
          "flex h-full flex-col overflow-hidden p-0",
          "hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary",
        )}
      >
        <div
          className={cn(
            "relative aspect-[16/10] w-full bg-gradient-to-br",
            event.coverGradient,
          )}
          aria-hidden
        >
          <div className="absolute left-3 top-3">
            <Badge variant={event.isFree ? "success" : "secondary"}>{event.priceLabel}</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <CardHeader className="mb-2 p-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {event.category}
            </p>
            <CardTitle className="line-clamp-2 text-base group-hover:text-primary">
              {event.title}
            </CardTitle>
            <CardDescription className="sr-only">Detail event {event.title}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex flex-col gap-2 p-0 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              {event.dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {event.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 shrink-0" aria-hidden />
              {event.quotaLabel}
            </span>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
