"use client";

import { useState, useMemo } from "react";

type Metier = {
  id: string;
  slug: string;
  label: string;
  categorie?: string | null;
  _count: { artisans: number };
};

const CATEGORIES_ORDER = [
  "Gros œuvre & structure",
  "Second œuvre",
  "Menuiserie & fermetures",
  "Espaces extérieurs",
  "Énergie & technique",
  "Aménagement intérieur",
  "Divers",
];

export default function AdminMetiersPanel({ initialMetiers }: { initialMetiers: Metier[] }) {
  const [metiers, setMetiers] = useState<Metier[]>(initialMetiers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newCategorie, setNewCategorie] = useState(CATEGORIES_ORDER[0]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  async function refresh() {
    const res = await fetch("/api/admin/metiers");
    const data = (await res.json()) as Metier[];
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
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
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
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
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
      body: JSON.stringify({ label: newLabel.trim(), categorie: newCategorie }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur");
      return;
    }
    setNewLabel("");
    await refresh();
  }

  function toggleCat(cat: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  // Groupement par catégorie
  const grouped = useMemo(() => {
    const filtered = search.trim()
      ? metiers.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()))
      : metiers;

    const map = new Map<string, Metier[]>();
    for (const m of filtered) {
      const cat = m.categorie ?? "Sans catégorie";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(m);
    }
    // Trier les catégories selon l'ordre défini
    const sorted: [string, Metier[]][] = [];
    for (const cat of CATEGORIES_ORDER) {
      if (map.has(cat)) sorted.push([cat, map.get(cat)!]);
    }
    // Catégories inconnues à la fin
    for (const [cat, list] of map) {
      if (!CATEGORIES_ORDER.includes(cat)) sorted.push([cat, list]);
    }
    return sorted;
  }, [metiers, search]);

  // Stats globales
  const totalAvecArtisans = metiers.filter((m) => m._count.artisans > 0).length;
  const totalArtisans = metiers.reduce((s, m) => s + m._count.artisans, 0);

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border-2 border-[#ff6b6b] bg-[#ff6b6b]/10 px-4 py-2 text-sm font-bold text-[#ff6b6b]">
          {error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Métiers", value: metiers.length, color: "bg-[#ffd93d]" },
          {
            label: "Couverts",
            value: `${totalAvecArtisans}/${metiers.length}`,
            color: "bg-[#6bcb77]",
          },
          { label: "Artisans liés", value: totalArtisans, color: "bg-[#60c5f1]" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`${color} rounded-xl border-2 border-[#1a1a1a] p-3 text-center`}
            style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
          >
            <div className="bd-titre text-2xl text-[#1a1a2e]">{value}</div>
            <div className="text-xs font-bold text-[#1a1a2e]/70">{label}</div>
          </div>
        ))}
      </div>

      {/* Ajout */}
      <div
        className="rounded-2xl border-2 border-[#1a1a1a] bg-[#fff8f0] p-4"
        style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
      >
        <p className="mb-2 text-xs font-bold tracking-wide text-gray-500 uppercase">
          Ajouter un métier
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Nom du métier (ex : Pisciniste)"
            className="min-w-[180px] flex-1 rounded-xl border-2 border-[#1a1a1a] bg-white px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-[#6bcb77] focus:outline-none"
          />
          <select
            value={newCategorie}
            onChange={(e) => setNewCategorie(e.target.value)}
            className="rounded-xl border-2 border-[#1a1a1a] bg-white px-3 py-2 text-sm font-bold focus:outline-none"
          >
            {CATEGORIES_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Sans catégorie">Sans catégorie</option>
          </select>
          <button
            onClick={handleCreate}
            disabled={loading || !newLabel.trim()}
            className="rounded-xl border-2 border-[#1a1a1a] bg-[#6bcb77] px-4 py-2 text-sm font-bold transition-all hover:bg-[#5ab865] disabled:opacity-50"
            style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Recherche */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Filtrer les métiers..."
        className="w-full rounded-xl border-2 border-[#1a1a1a] bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-[#ffd93d] focus:outline-none"
      />

      {/* Groupes par catégorie */}
      <div className="space-y-3">
        {grouped.map(([cat, list]) => {
          const collapsed = collapsedCats.has(cat);
          const catWithArtisans = list.filter((m) => m._count.artisans > 0).length;
          return (
            <div
              key={cat}
              className="overflow-hidden rounded-2xl border-2 border-[#1a1a1a] bg-white"
              style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
            >
              {/* En-tête catégorie */}
              <button
                onClick={() => toggleCat(cat)}
                className="flex w-full items-center justify-between bg-[#1a1a2e] px-4 py-2.5 text-left"
              >
                <span className="text-sm font-bold text-white">{cat}</span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#6bcb77] px-2 py-0.5 text-xs font-bold text-[#1a1a2e]">
                    {catWithArtisans}/{list.length} couverts
                  </span>
                  <span className="text-xs text-white/50">{collapsed ? "▸" : "▾"}</span>
                </div>
              </button>

              {/* Lignes métiers */}
              {!collapsed && (
                <div className="divide-y divide-gray-100">
                  {list.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fff8f0]"
                    >
                      {/* Label / edit inline */}
                      <div className="flex-1">
                        {editingId === m.id ? (
                          <input
                            autoFocus
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit(m.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full rounded-lg border-2 border-[#6bcb77] bg-[#fff8f0] px-3 py-1 text-sm font-bold focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-bold text-[#1a1a2e]">{m.label}</span>
                        )}
                        <span className="ml-2 font-mono text-xs text-gray-300">{m.slug}</span>
                      </div>

                      {/* Badge artisans */}
                      <span
                        className="shrink-0 rounded-full border border-[#1a1a1a] px-2 py-0.5 text-xs font-bold"
                        style={{ background: m._count.artisans > 0 ? "#6bcb77" : "#e5e7eb" }}
                        title={`${m._count.artisans} artisan(s)`}
                      >
                        {m._count.artisans > 0 ? `✓ ${m._count.artisans}` : "0"}
                      </span>

                      {/* Actions */}
                      {editingId === m.id ? (
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => saveEdit(m.id)}
                            disabled={loading}
                            className="rounded-lg border-2 border-[#1a1a1a] bg-[#6bcb77] px-2.5 py-1 text-xs font-bold hover:bg-[#5ab865] disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border-2 border-[#1a1a1a] bg-gray-100 px-2.5 py-1 text-xs font-bold hover:bg-gray-200"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            onClick={() => startEdit(m)}
                            className="rounded-lg border-2 border-[#1a1a1a] bg-[#ffd93d] px-2.5 py-1 text-xs font-bold hover:bg-[#ffc800]"
                            title="Renommer"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.label)}
                            disabled={loading || m._count.artisans > 0}
                            title={
                              m._count.artisans > 0
                                ? `${m._count.artisans} artisan(s) — suppression bloquée`
                                : "Supprimer"
                            }
                            className="rounded-lg border-2 border-[#1a1a1a] bg-[#ff6b6b] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#e05555] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            🗑
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {grouped.length === 0 && search && (
        <p className="py-6 text-center text-sm text-gray-400">
          Aucun métier ne correspond à &ldquo;{search}&rdquo;
        </p>
      )}

      <p className="text-xs text-gray-400">
        * Le slug est généré à la création et ne peut pas être modifié (clé de référence). Renommer
        le label n&apos;affecte pas les artisans déjà associés.
      </p>
    </div>
  );
}
