import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

// ponytail: keep DemoEvent for fallback; remove when API fully live
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

function isApiEvent(e: DemoEvent | Event): e is Event {
  return "ticketType" in e && "eventDate" in e && "organizerId" in e;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(type: string, price: number) {
  if (type === "FREE") return "Gratis";
  return `Rp ${price.toLocaleString("id-ID")}`;
}

const categoryGradients: Record<string, string> = {
  MUSIC: "from-pink-500 to-purple-600",
  SPORTS: "from-green-500 to-emerald-600",
  EDUCATION: "from-blue-500 to-cyan-600",
  TECHNOLOGY: "from-indigo-500 to-blue-600",
  ART: "from-orange-400 to-rose-500",
  FOOD: "from-yellow-400 to-orange-500",
  BUSINESS: "from-gray-600 to-slate-700",
  HEALTH: "from-teal-400 to-green-500",
  SOCIAL: "from-violet-500 to-purple-600",
  OTHER: "from-gray-400 to-gray-600",
};

export function EventCard({ event }: { event: DemoEvent | Event }) {
  const isApi = isApiEvent(event);

  const category = isApi ? event.category : event.category;
  const title = event.title;
  const location = isApi ? event.locationName : event.location;
  const dateLabel = isApi ? formatDate(event.eventDate) : event.dateLabel;
  const priceLabel = isApi ? formatPrice(event.ticketType, event.ticketPrice) : event.priceLabel;
  const isFree = isApi ? event.ticketType === "FREE" : event.isFree;
  const quotaLabel = isApi
    ? event.maxCapacity
      ? `${event.currentCount}/${event.maxCapacity}`
      : "Unlimited"
    : event.quotaLabel;
  const gradient = isApi
    ? categoryGradients[event.category] || categoryGradients.OTHER
    : event.coverGradient;
  const coverUrl = isApi ? event.coverImageUrl : null;

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
            "relative aspect-[16/10] w-full",
            !coverUrl && `bg-gradient-to-br ${gradient}`,
          )}
          aria-hidden
        >
          {coverUrl && (
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          <div className="absolute left-3 top-3">
            <Badge variant={isFree ? "success" : "secondary"}>{priceLabel}</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <CardHeader className="mb-2 p-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {category}
            </p>
            <CardTitle className="line-clamp-2 text-base group-hover:text-primary">
              {title}
            </CardTitle>
            <CardDescription className="sr-only">Detail event {title}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto flex flex-col gap-2 p-0 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              {dateLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 shrink-0" aria-hidden />
              {quotaLabel}
            </span>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}