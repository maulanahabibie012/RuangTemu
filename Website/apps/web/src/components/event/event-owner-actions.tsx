"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { deleteEvent } from "@/lib/events-api";

interface Props {
  eventId: string;
  eventTitle: string;
  organizerId: string;
}

export function EventOwnerActions({ eventId, eventTitle, organizerId }: Props) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isAuthenticated || !user || user.id !== organizerId) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteEvent(eventId);
      router.push("/my-events");
    } catch {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="mt-6 flex gap-2">
        <Link href={`/events/${eventId}/edit`}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="size-4" />
            Edit
          </Button>
        </Link>
        <Button variant="danger" size="sm" className="gap-1.5" onClick={() => setShowConfirm(true)}>
          <Trash2 className="size-4" />
          Hapus
        </Button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowConfirm(false)}>
          <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-foreground">Hapus Event</h3>
            <p className="text-sm text-muted">
              Yakin ingin menghapus &ldquo;{eventTitle}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting} loading={deleting}>
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}