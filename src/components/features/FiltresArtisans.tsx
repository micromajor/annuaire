"use client";

import { useRouter } from "next/navigation";
import type { METIERS, COMMUNES_NANTES_EST } from "@/constants";
import Combobox from "@/components/ui/Combobox";

interface FiltresArtisansProps {
  metiers: typeof METIERS;
  communes: typeof COMMUNES_NANTES_EST;
  currentMetier?: string;
  currentCommune?: string;
}

export default function FiltresArtisans({
  metiers,
  communes,
  currentMetier,
  currentCommune,
}: FiltresArtisansProps) {
  const router = useRouter();

  function navigate(metier: string, commune: string) {
    const params = new URLSearchParams();
    if (metier) params.set("metier", metier);
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
      <Combobox
        options={metierOptions}
        value={currentMetier ?? ""}
        onChange={(v) => navigate(v, currentCommune ?? "")}
        placeholder="Tous les metiers"
        allLabel="Tous les metiers"
        label="Corps de metier"
      />
      <Combobox
        options={communeOptions}
        value={currentCommune ?? ""}
        onChange={(v) => navigate(currentMetier ?? "", v)}
        placeholder="Toutes les communes"
        allLabel="Toutes les communes"
        label="Commune"
      />
    </div>
  );
}
