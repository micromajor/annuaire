"use client";

import { useState, useRef, useEffect, useId } from "react";

export type MetierOption = {
  slug: string;
  label: string;
  categorie?: string | null;
};

interface Props {
  metiers: MetierOption[];
  selected: string[]; // slugs sélectionnés
  onChange: (slugs: string[]) => void;
  error?: string;
}

export default function MetierCombobox({ metiers, selected, onChange, error }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(slug: string) {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug];
    onChange(next);
  }

  function remove(slug: string) {
    onChange(selected.filter((s) => s !== slug));
  }

  // Filtrer + regrouper par catégorie
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const q = normalise(query.trim());
  const filtered = q
    ? metiers.filter((m) => normalise(m.label).includes(q) || normalise(m.slug).includes(q))
    : metiers;

  // Grouper par catégorie, ordre fixe
  const CATEGORY_ORDER = [
    "Gros œuvre & structure",
    "Second œuvre",
    "Menuiserie & fermetures",
    "Espaces extérieurs",
    "Énergie & technique",
    "Aménagement intérieur",
    "Divers",
  ];

  const grouped = CATEGORY_ORDER.reduce<Record<string, MetierOption[]>>((acc, cat) => {
    const items = filtered.filter((m) => (m.categorie ?? "Divers") === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});
  // Catégories inconnues (fallback)
  const knownCats = new Set(CATEGORY_ORDER);
  const unknown = filtered.filter((m) => m.categorie && !knownCats.has(m.categorie));
  if (unknown.length > 0) grouped["Autre"] = unknown;

  const hasResults = filtered.length > 0;
  const selectedMetiers = metiers.filter((m) => selected.includes(m.slug));

  return (
    <div ref={containerRef} className="relative">
      {/* Chips sélectionnées */}
      {selectedMetiers.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selectedMetiers.map((m) => (
            <span
              key={m.slug}
              className="flex items-center gap-1 rounded-full border-2 border-[#1a1a1a] bg-[#1a1a2e] py-0.5 pr-1 pl-3 text-sm font-bold text-[#ffd93d]"
              style={{ boxShadow: "1px 1px 0 #1a1a1a" }}
            >
              {m.label}
              <button
                type="button"
                onClick={() => remove(m.slug)}
                className="ml-0.5 rounded-full px-1 py-0.5 text-[#ffd93d]/60 hover:bg-[#ff6b6b] hover:text-white"
                aria-label={`Retirer ${m.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de recherche */}
      <div
        className="flex items-center rounded-xl border-2 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#6bcb77]"
        style={{ borderColor: error ? "#ff6b6b" : "#1a1a1a" }}
      >
        <span className="mr-2 text-gray-400">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={
            selected.length === 0 ? "Tapez pour rechercher un métier…" : "Ajouter un autre métier…"
          }
          className="flex-1 bg-transparent text-sm font-semibold text-[#1a1a2e] outline-none placeholder:font-normal placeholder:text-gray-400"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Effacer la recherche"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-[999] mt-1 max-h-72 w-full overflow-y-auto rounded-xl border-2 border-[#1a1a1a] bg-white shadow-lg"
          style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
        >
          {hasResults ? (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <p className="sticky top-0 bg-[#fff8f0] px-3 py-1 text-[10px] font-black tracking-widest text-gray-500 uppercase">
                  {cat}
                </p>
                {items.map((m) => {
                  const isSelected = selected.includes(m.slug);
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        toggle(m.slug);
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-[#fff8f0] ${
                        isSelected ? "bg-[#ffd93d]/20 text-[#1a1a2e]" : "text-[#1a1a2e]"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-[#1a1a1a] text-xs ${
                          isSelected ? "bg-[#1a1a2e] text-[#ffd93d]" : "bg-white"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </span>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-4 py-4 text-center text-sm text-gray-500">
              <p className="font-bold text-[#1a1a2e]">Aucun résultat pour « {query} »</p>
              <p className="mt-1 text-xs text-gray-400">
                Votre métier n&apos;est pas dans la liste ?{" "}
                <span className="font-semibold text-[#6bcb77]">
                  Utilisez le bouton &laquo;&nbsp;Votre avis&nbsp;&raquo; en bas à droite de
                  l&apos;écran.
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-[#ff6b6b]">{error}</p>}
    </div>
  );
}
