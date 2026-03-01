"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminBesoinActions({ id }: { id: string }) {
  const router = useRouter();
  const [loadingTraite, setLoadingTraite] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [done, setDone] = useState<"traite" | "deleted" | null>(null);

  async function handleTraite() {
    setLoadingTraite(true);
    try {
      const res = await fetch(`/api/admin/besoins/${id}`, { method: "PATCH" });
      if (res.ok) {
        setDone("traite");
        setTimeout(() => router.refresh(), 400);
      }
    } finally {
      setLoadingTraite(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce besoin définitivement ?")) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/admin/besoins/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDone("deleted");
        setTimeout(() => router.refresh(), 400);
      }
    } finally {
      setLoadingDelete(false);
    }
  }

  if (done === "traite") return <span className="text-xs font-bold text-green-600">✓ Traité</span>;
  if (done === "deleted") return <span className="text-xs font-bold text-gray-400">Supprimé</span>;

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        onClick={handleTraite}
        disabled={loadingTraite || loadingDelete}
        className="rounded-lg border-2 border-[#1a1a1a] bg-[#6bcb77] px-3 py-1.5 text-xs font-bold text-[#1a1a1a] transition-all hover:bg-[#52b862] disabled:opacity-60"
      >
        {loadingTraite ? "..." : "✓ Traité"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loadingTraite || loadingDelete}
        className="rounded-lg border-2 border-[#1a1a1a] bg-[#ff6b6b] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#e05555] disabled:opacity-60"
      >
        {loadingDelete ? "..." : "🗑"}
      </button>
    </div>
  );
}
