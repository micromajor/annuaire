"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";

export default function DangerZone() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      setError(null);
      const res = await fetch("/api/mon-espace/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Une erreur s'est produite. Réessayez ou contactez-nous.");
        return;
      }
      await signOut({ callbackUrl: "/?compte=supprime" });
    });
  }

  return (
    <div
      className="rounded-2xl border-4 border-[#ff6b6b] bg-white p-6"
      style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
    >
      <h2 className="bd-titre mb-1 text-xl text-[#ff6b6b]">⚠️ Zone dangereuse</h2>
      <p className="mb-4 text-sm text-gray-500">
        La suppression est <strong>définitive et irréversible</strong> : vos données, fiche, photos
        et historique sont effacés.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl border-2 border-[#ff6b6b] bg-white px-4 py-2 text-sm font-black text-[#ff6b6b] transition-colors hover:bg-[#ff6b6b] hover:text-white"
        >
          Supprimer mon compte
        </button>
      ) : (
        <div className="rounded-xl border-2 border-[#ff6b6b] bg-[#fff5f5] p-4">
          <p className="mb-4 text-sm font-bold text-[#1a1a2e]">
            Êtes-vous sûr(e) ? Cette action ne peut pas être annulée.
          </p>
          {error && (
            <p className="mb-3 rounded-lg bg-[#ff6b6b] p-2 text-xs font-bold text-white">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-xl border-2 border-[#ff6b6b] bg-[#ff6b6b] px-4 py-2 text-sm font-black text-white hover:bg-[#e55555] disabled:opacity-50"
            >
              {isPending ? "Suppression…" : "Oui, supprimer définitivement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
