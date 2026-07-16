"use client";

import { useState } from "react";
import type { EventCategory, EventStatus, TicketType } from "@/types/event";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "TECHNOLOGY", label: "Teknologi" },
  { value: "BUSINESS", label: "Bisnis" },
  { value: "ART", label: "Seni" },
  { value: "SPORTS", label: "Olahraga" },
  { value: "MUSIC", label: "Musik" },
  { value: "FOOD", label: "Makanan" },
  { value: "HEALTH", label: "Kesehatan" },
  { value: "EDUCATION", label: "Pendidikan" },
  { value: "SOCIAL", label: "Sosial" },
  { value: "OTHER", label: "Lainnya" },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "COMPLETED", label: "Selesai" },
];

interface EventFormData {
  title?: string;
  description?: string;
  category?: EventCategory;
  status?: EventStatus;
  eventDate?: string;
  eventEndDate?: string | null;
  locationName?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  coverImageUrl?: string | null;
  ticketType?: TicketType;
  ticketPrice?: number;
  maxCapacity?: number | null;
}

interface EventFormProps {
  initialData?: EventFormData;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitting?: boolean;
  isEdit?: boolean;
}

function toLocalDatetime(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventForm({ initialData, onSubmit, submitting, isEdit }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState<EventCategory>(initialData?.category || "TECHNOLOGY");
  const [status, setStatus] = useState<EventStatus>(initialData?.status || "DRAFT");
  const [eventDate, setEventDate] = useState(toLocalDatetime(initialData?.eventDate));
  const [eventEndDate, setEventEndDate] = useState(toLocalDatetime(initialData?.eventEndDate));
  const [locationName, setLocationName] = useState(initialData?.locationName || "");
  const [locationLat, setLocationLat] = useState(initialData?.locationLat?.toString() || "");
  const [locationLng, setLocationLng] = useState(initialData?.locationLng?.toString() || "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || "");
  const [ticketType, setTicketType] = useState<TicketType>(initialData?.ticketType || "FREE");
  const [ticketPrice, setTicketPrice] = useState(initialData?.ticketPrice?.toString() || "0");
  const [maxCapacity, setMaxCapacity] = useState(initialData?.maxCapacity?.toString() || "100");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = {
      title,
      description,
      category,
      status,
      eventDate: new Date(eventDate).toISOString(),
      locationName,
      ticketType,
      ticketPrice: ticketType === "PAID" ? parseFloat(ticketPrice) : 0,
      maxCapacity: parseInt(maxCapacity, 10),
    };
    if (eventEndDate) data.eventEndDate = new Date(eventEndDate).toISOString();
    if (locationLat) data.locationLat = parseFloat(locationLat);
    if (locationLng) data.locationLng = parseFloat(locationLng);
    if (coverImageUrl) data.coverImageUrl = coverImageUrl;
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Judul Event *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama event" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Deskripsi *</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan detail event..."
          required
          rows={5}
          className="flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Kategori *</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="eventDate">Tanggal Mulai *</Label>
          <Input id="eventDate" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventEndDate">Tanggal Selesai</Label>
          <Input id="eventEndDate" type="datetime-local" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationName">Lokasi *</Label>
        <Input id="locationName" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="Nama tempat atau alamat" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="locationLat">Latitude</Label>
          <Input id="locationLat" type="number" step="any" value={locationLat} onChange={(e) => setLocationLat(e.target.value)} placeholder="-6.2088" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locationLng">Longitude</Label>
          <Input id="locationLng" type="number" step="any" value={locationLng} onChange={(e) => setLocationLng(e.target.value)} placeholder="106.8456" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImageUrl">URL Gambar Cover</Label>
        <Input id="coverImageUrl" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
        {coverImageUrl && (
          <img src={coverImageUrl} alt="Preview" className="mt-2 h-40 w-full object-cover rounded-lg border border-[var(--border)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticketType">Tipe Tiket</Label>
          <select
            id="ticketType"
            value={ticketType}
            onChange={(e) => setTicketType(e.target.value as TicketType)}
            className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <option value="FREE">Gratis</option>
            <option value="PAID">Berbayar</option>
          </select>
        </div>
        {ticketType === "PAID" && (
          <div className="space-y-2">
            <Label htmlFor="ticketPrice">Harga (Rp)</Label>
            <Input id="ticketPrice" type="number" min="0" value={ticketPrice} onChange={(e) => setTicketPrice(e.target.value)} placeholder="50000" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxCapacity">Kapasitas Maksimum *</Label>
        <Input id="maxCapacity" type="number" min="1" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} required />
      </div>

      <Button type="submit" disabled={submitting} loading={submitting} size="lg" className="w-full">
        {isEdit ? "Simpan Perubahan" : "Buat Event"}
      </Button>
    </form>
  );
}