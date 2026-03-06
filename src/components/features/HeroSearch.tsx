"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Combobox from "@/components/ui/Combobox";
import { COMMUNES_NANTES_EST } from "@/constants";

const CATEGORY_ORDER = [
  "Gros œuvre & structure",
  "Second œuvre",
  "Menuiserie & fermetures",
  "Espaces extérieurs",
  "Énergie & technique",
  "Aménagement intérieur",
  "Divers",
];

interface HeroSearchProps {
  metiers: { slug: string; label: string; categorie?: string | null }[];
}

export default function HeroSearch({ metiers }: HeroSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedMetiers, setSelectedMetiers] = useState<string[]>([]);
  const [commune, setCommune] = useState("");

  function handleFocus() {
    // Sur mobile, fait remonter la barre au-dessus du clavier natif
    setTimeout(() => {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  const metierOptions = [...metiers]
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.categorie ?? "");
      const bi = CATEGORY_ORDER.indexOf(b.categorie ?? "");
      const catDiff = (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return catDiff !== 0 ? catDiff : a.label.localeCompare(b.label, "fr");
    })
    .map((m) => ({ value: m.slug, label: m.label, group: m.categorie ?? undefined }));
  const communeOptions = COMMUNES_NANTES_EST.map((c) => ({
    value: c.nom,
    label: c.nom,
    sub: c.codePostal,
  }));

  function toggleMetier(slug: string) {
    setSelectedMetiers((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleSearch() {
    const params = new URLSearchParams();
    selectedMetiers.forEach((m) => params.append("metier", m));
    if (commune) params.set("commune", commune);
    router.push(`/artisans${params.toString() ? "?" + params : ""}`);
  }

  return (
    <div ref={containerRef} className="w-full" onFocus={handleFocus}>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-nowrap sm:items-start sm:justify-center sm:gap-x-3">
        <span className="bd-titre pt-2 text-3xl text-[#1a1a2e] sm:shrink-0 sm:text-4xl">
          Trouver
        </span>

        {/* Colonne métier : combobox + chips */}
        <div className="w-full sm:w-52 sm:shrink-0">
          <Combobox
            options={metierOptions}
            value=""
            onChange={() => {}}
            multi
            values={selectedMetiers}
            onToggle={toggleMetier}
            placeholder="métier"
            allLabel="tous les métiers"
            className="w-full"
            variant="ghost"
          />
          {selectedMetiers.length >= 1 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {selectedMetiers.map((slug) => {
                const lbl = metierOptions.find((o) => o.value === slug)?.label ?? slug;
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 rounded-lg border-2 border-[#1a1a2e] bg-[#1a1a2e] px-2 py-0.5 text-xs font-bold text-[#ffd93d]"
                  >
                    {lbl}
                    <button
                      type="button"
                      onClick={() => toggleMetier(slug)}
                      className="ml-0.5 leading-none hover:text-[#ff6b6b]"
                      aria-label={`Retirer ${lbl}`}
                    >
                      ✕
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <span className="bd-titre shrink-0 pt-2 text-3xl text-[#1a1a2e] sm:text-4xl">sur</span>

        <Combobox
          options={communeOptions}
          value={commune}
          onChange={setCommune}
          placeholder="commune"
          allLabel="toute la zone"
          className="w-full sm:w-60 sm:shrink-0"
          variant="ghost"
        />

        <button
          onClick={handleSearch}
          className="bd-titre flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border-3 border-[#1a1a1a] bg-[#ff6b6b] px-6 py-3 text-xl text-white transition-colors hover:bg-[#e05555] sm:w-auto"
          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
        >
          &#128269;
        </button>
      </div>
    </div>
  );
}
