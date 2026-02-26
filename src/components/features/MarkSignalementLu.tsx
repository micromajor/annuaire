"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkSignalementLu({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleMark() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/signalements/${id}`, { method: "PATCH" });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.refresh(), 400);
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <span className="text-xs font-bold text-green-600">✓ Traité</span>;
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className="shrink-0 rounded-lg border-2 border-[#1a1a1a] bg-[#6bcb77] px-3 py-1.5 text-xs font-bold text-[#1a1a1a] transition-all hover:bg-[#52b862] disabled:opacity-60"
    >
      {loading ? "..." : "✓ Marquer lu"}
    </button>
  );
}
