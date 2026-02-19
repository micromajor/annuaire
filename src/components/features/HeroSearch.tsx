"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { METIERS } from "@/constants";
import Combobox from "@/components/ui/Combobox";
import { COMMUNES_NANTES_EST } from "@/constants";

interface HeroSearchProps {
  metiers: typeof METIERS;
}

export default function HeroSearch({ metiers }: HeroSearchProps) {
  const router = useRouter();
  const [metier, setMetier] = useState("");
  const [commune, setCommune] = useState("");

  const metierOptions = metiers.map((m) => ({ value: m.slug, label: m.label }));
  const communeOptions = COMMUNES_NANTES_EST.map((c) => ({
    value: c.nom,
    label: c.nom,
    sub: c.codePostal,
  }));

  function handleSearch() {
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
    if (commune) params.set("commune", commune);
    router.push(`/artisans${params.toString() ? "?" + params : ""}`);
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-nowrap sm:justify-center sm:gap-x-3">
        <span className="bd-titre text-3xl text-[#1a1a2e] sm:shrink-0 sm:text-4xl">Trouver</span>

        <div className="flex w-full items-center gap-3 sm:contents">
          <Combobox
            options={metierOptions}
            value={metier}
            onChange={setMetier}
            placeholder="m&#233;tier"
            allLabel="tous les m&#233;tiers"
            className="min-w-0 flex-1 sm:w-52 sm:flex-none sm:shrink-0"
            variant="ghost"
          />

          <span className="bd-titre shrink-0 text-3xl text-[#1a1a2e] sm:text-4xl">sur</span>

          <Combobox
            options={communeOptions}
            value={commune}
            onChange={setCommune}
            placeholder="commune"
            allLabel="toute la zone"
            className="min-w-0 flex-1 sm:w-60 sm:flex-none sm:shrink-0"
            variant="ghost"
          />
        </div>

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
