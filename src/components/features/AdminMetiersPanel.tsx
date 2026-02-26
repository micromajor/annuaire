"use client";

import { useState } from "react";

type Metier = {
  id: string;
  slug: string;
  label: string;
  _count: { artisans: number };
};

export default function AdminMetiersPanel({ initialMetiers }: { initialMetiers: Metier[] }) {
  const [metiers, setMetiers] = useState<Metier[]>(initialMetiers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/admin/metiers");
    const data = await res.json();
    setMetiers(data);
  }

  function startEdit(m: Metier) {
    setEditingId(m.id);
    setEditLabel(m.label);
    setError(null);
  }

  async function saveEdit(id: string) {
    if (!editLabel.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/metiers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editLabel.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setEditingId(null);
    await refresh();
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Supprimer le métier "${label}" ?`)) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/metiers/${id}`, { method: "DELETE" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    await refresh();
  }

  async function handleCreate() {
    if (!newLabel.trim()) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/metiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim() }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setNewLabel("");
    await refresh();
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border-2 border-[#ff6b6b] bg-[#ff6b6b]/10 px-4 py-2 text-sm font-bold text-[#ff6b6b]">
          {error}
        </p>
      )}

      {/* Ajout d'un métier */}
      <div
        className="flex gap-2 rounded-2xl border-2 border-[#1a1a1a] bg-[#fff8f0] p-4"
        style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
      >
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="Nouveau métier (ex : Paysagiste)"
          className="flex-1 rounded-xl border-2 border-[#1a1a1a] bg-white px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-[#6bcb77] focus:outline-none"
        />
        <button
          onClick={handleCreate}
          disabled={loading || !newLabel.trim()}
          className="rounded-xl border-2 border-[#1a1a1a] bg-[#6bcb77] px-4 py-2 text-sm font-bold transition-all hover:bg-[#5ab865] disabled:opacity-50"
          style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
        >
          + Ajouter
        </button>
      </div>

      {/* Liste */}
      <div
        className="overflow-hidden rounded-2xl border-2 border-[#1a1a1a]"
        style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
      >
        <table className="w-full text-sm">
          <thead className="border-b-2 border-[#1a1a1a] bg-[#1a1a2e] text-white">
            <tr>
              <th className="px-4 py-3 text-left font-bold">Label</th>
              <th className="px-4 py-3 text-left font-bold">Slug</th>
              <th className="px-4 py-3 text-center font-bold">Artisans</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#1a1a1a] bg-white">
            {metiers.map((m) => (
              <tr key={m.id} className="hover:bg-[#fff8f0]">
                <td className="px-4 py-3">
                  {editingId === m.id ? (
                    <input
                      autoFocus
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(m.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full rounded-lg border-2 border-[#6bcb77] bg-[#fff8f0] px-3 py-1 font-bold focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-[#1a1a2e]">{m.label}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{m.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-block rounded-full border-2 border-[#1a1a1a] px-2.5 py-0.5 text-xs font-bold"
                    style={{ background: m._count.artisans > 0 ? "#6bcb77" : "#e5e7eb" }}
                  >
                    {m._count.artisans}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === m.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => saveEdit(m.id)}
                        disabled={loading}
                        className="rounded-lg border-2 border-[#1a1a1a] bg-[#6bcb77] px-3 py-1 text-xs font-bold hover:bg-[#5ab865] disabled:opacity-50"
                      >
                        ✓ Sauver
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border-2 border-[#1a1a1a] bg-gray-100 px-3 py-1 text-xs font-bold hover:bg-gray-200"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => startEdit(m)}
                        className="rounded-lg border-2 border-[#1a1a1a] bg-[#ffd93d] px-3 py-1 text-xs font-bold hover:bg-[#ffc800]"
                        style={{ boxShadow: "1px 1px 0 #1a1a1a" }}
                      >
                        ✏️ Renommer
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.label)}
                        disabled={loading || m._count.artisans > 0}
                        title={
                          m._count.artisans > 0
                            ? `${m._count.artisans} artisan(s) utilisent ce métier`
                            : "Supprimer"
                        }
                        className="rounded-lg border-2 border-[#1a1a1a] bg-[#ff6b6b] px-3 py-1 text-xs font-bold text-white hover:bg-[#e05555] disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ boxShadow: "1px 1px 0 #1a1a1a" }}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        * Le slug est généré automatiquement à la création et ne peut pas être modifié (il sert de
        clé). Renommer le label n&apos;affecte pas les artisans déjà associés.
      </p>
    </div>
  );
}
