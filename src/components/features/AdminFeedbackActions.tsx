"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminFeedbackActions({ id }: { id: string }) {
  const router = useRouter();
  const [loadingLu, setLoadingLu] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [done, setDone] = useState<"lu" | "deleted" | null>(null);

  async function handleLu() {
    setLoadingLu(true);
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, { method: "PATCH" });
      if (res.ok) {
        setDone("lu");
        setTimeout(() => router.refresh(), 400);
      }
    } finally {
      setLoadingLu(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce retour définitivement ?")) return;
    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/admin/feedbacks/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDone("deleted");
        setTimeout(() => router.refresh(), 400);
      }
    } finally {
      setLoadingDelete(false);
    }
  }

  if (done === "lu") return <span className="text-xs font-bold text-green-600">✓ Lu</span>;
  if (done === "deleted") return <span className="text-xs font-bold text-gray-400">Supprimé</span>;

  return (
    <div className="flex shrink-0 gap-1.5">
      <button
        onClick={handleLu}
        disabled={loadingLu || loadingDelete}
        className="rounded-lg border-2 border-[#1a1a1a] bg-[#6bcb77] px-3 py-1.5 text-xs font-bold text-[#1a1a1a] transition-all hover:bg-[#52b862] disabled:opacity-60"
      >
        {loadingLu ? "..." : "✓ Lu"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loadingLu || loadingDelete}
        className="rounded-lg border-2 border-[#1a1a1a] bg-[#ff6b6b] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#e05555] disabled:opacity-60"
      >
        {loadingDelete ? "..." : "🗑"}
      </button>
    </div>
  );
}
