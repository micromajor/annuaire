"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JsonValue } from "@prisma/client/runtime/client";

/** Sous-ensemble des champs Artisan utilisés par ce composant */
export interface AdminUserData {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  raisonSociale: string | null;
  status: string;
  draftData: JsonValue;
  createdAt: Date;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-[#ffd93d]" },
  VALIDE: { label: "Validé", color: "bg-[#6bcb77]" },
  REJETE: { label: "Rejeté", color: "bg-[#ff6b6b] text-white" },
};

export default function AdminUserRow({ artisan }: { artisan: AdminUserData }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const draft = artisan.draftData as Record<string, unknown> | null;
  const isParticulier = draft?.isParticulier === true;
  const nomAffiche = isParticulier
    ? `${artisan.prenom} ${artisan.nom}`
    : (artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`);
  const statusInfo = STATUS_LABELS[artisan.status] ?? {
    label: artisan.status,
    color: "bg-gray-200",
  };

  async function handleDelete() {
    setLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/artisans/${artisan.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleted(true);
        setTimeout(() => router.refresh(), 500);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setDeleteError(data.error ?? `Erreur ${res.status} — reconnectez-vous en admin.`);
      }
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (deleted) {
    return (
      <div className="rounded-xl border-2 border-[#1a1a1a] bg-[#ff6b6b] p-4 text-center font-bold text-white">
        🗑️ Supprimé — {nomAffiche}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border-2 border-[#1a1a1a] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
    >
      {/* Infos */}
      <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
        {/* Rôle badge */}
        <span
          className={`shrink-0 rounded-lg border-2 border-[#1a1a1a] px-2 py-0.5 text-xs font-bold ${
            isParticulier ? "bg-[#60c5f1]" : "bg-[#ffd93d]"
          }`}
        >
          {isParticulier ? "👤 Particulier" : "🔨 Artisan"}
        </span>

        {/* Statut — non pertinent pour les particuliers */}
        {!isParticulier && (
          <span
            className={`shrink-0 rounded-lg border-2 border-[#1a1a1a] px-2 py-0.5 text-xs font-bold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        )}

        {/* Nom + email */}
        <div className="min-w-0">
          <p className="truncate font-black text-[#1a1a2e]">{nomAffiche}</p>
          <p className="truncate text-xs text-gray-500">{artisan.email}</p>
        </div>

        {/* Date */}
        <p className="ml-auto shrink-0 text-xs text-gray-400">
          {new Date(artisan.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {deleteError && (
        <p className="rounded-lg bg-[#ff6b6b]/20 px-3 py-2 text-xs font-bold text-[#ff6b6b]">
          ⚠️ {deleteError}
        </p>
      )}
      {/* Bouton supprimer */}
      <div className="flex shrink-0 items-center gap-2">
        {confirm ? (
          <>
            <span className="text-sm font-bold text-[#ff6b6b]">Confirmer ?</span>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg border-2 border-[#1a1a1a] bg-[#ff6b6b] px-3 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_#1a1a1a] hover:bg-[#e05555] disabled:opacity-60"
            >
              {loading ? "…" : "Oui, supprimer"}
            </button>
            <button
              onClick={() => setConfirm(false)}
              disabled={loading}
              className="rounded-lg border-2 border-[#1a1a1a] bg-white px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0_#1a1a1a] hover:bg-gray-100 disabled:opacity-60"
            >
              Annuler
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            className="rounded-lg border-2 border-[#1a1a1a] bg-[#ff6b6b] px-3 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_#1a1a1a] hover:bg-[#e05555]"
          >
            🗑️ Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
