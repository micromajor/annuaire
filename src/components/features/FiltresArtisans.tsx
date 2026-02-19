"use client";

import { useRouter } from "next/navigation";
import type { METIERS, COMMUNES_NANTES_EST } from "@/constants";
import MultiCombobox from "@/components/ui/MultiCombobox";
import Combobox from "@/components/ui/Combobox";

interface FiltresArtisansProps {
  metiers: typeof METIERS;
  communes: typeof COMMUNES_NANTES_EST;
  currentMetiers: string[];
  currentCommune?: string;
}

export default function FiltresArtisans({
  metiers,
  communes,
  currentMetiers,
  currentCommune,
}: FiltresArtisansProps) {
  const router = useRouter();

  function navigate(selectedMetiers: string[], commune: string) {
    const params = new URLSearchParams();
    for (const m of selectedMetiers) params.append("metier", m);
    if (commune) params.set("commune", commune);
    router.push(`/artisans${params.size ? `?${params}` : ""}`);
  }

  const metierOptions = metiers.map((m) => ({ value: m.slug, label: m.label }));
  const communeOptions = communes.map((c) => ({
    value: c.nom,
    label: c.nom,
    sub: c.codePostal,
  }));

  return (
    <div className="space-y-3">
      <MultiCombobox
        options={metierOptions}
        values={currentMetiers}
        onChange={(v) => navigate(v, currentCommune ?? "")}
        placeholder="Tous les métiers"
        allLabel="Tous les métiers"
        label="Corps de métier"
      />
      <Combobox
        options={communeOptions}
        value={currentCommune ?? ""}
        onChange={(v) => navigate(currentMetiers, v)}
        placeholder="Toutes les communes"
        allLabel="Toutes les communes"
        label="Commune du projet"
      />
    </div>
  );
}
