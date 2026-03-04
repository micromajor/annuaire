"use client";

import { useRouter } from "next/navigation";
import type { COMMUNES_NANTES_EST } from "@/constants";
import MultiCombobox from "@/components/ui/MultiCombobox";
import Combobox from "@/components/ui/Combobox";

const CATEGORY_ORDER = [
  "Gros œuvre & structure",
  "Second œuvre",
  "Menuiserie & fermetures",
  "Espaces extérieurs",
  "Énergie & technique",
  "Aménagement intérieur",
  "Divers",
];

interface FiltresArtisansProps {
  metiers: { slug: string; label: string; categorie?: string | null }[];
  communes: typeof COMMUNES_NANTES_EST;
  currentMetiers: string[];
  currentCommune?: string;
  currentSearch?: string;
}

export default function FiltresArtisans({
  metiers,
  communes,
  currentMetiers,
  currentCommune,
  currentSearch,
}: FiltresArtisansProps) {
  const router = useRouter();

  function navigate(selectedMetiers: string[], commune: string, search?: string): void {
    const params = new URLSearchParams();
    for (const m of selectedMetiers) params.append("metier", m);
    if (commune) params.set("commune", commune);
    if (search) params.set("q", search);
    router.push(`/artisans${params.size ? `?${params}` : ""}`);
  }

  const metierOptions = [...metiers]
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.categorie ?? "");
      const bi = CATEGORY_ORDER.indexOf(b.categorie ?? "");
      const catDiff = (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return catDiff !== 0 ? catDiff : a.label.localeCompare(b.label, "fr");
    })
    .map((m) => ({ value: m.slug, label: m.label, group: m.categorie ?? undefined }));
  const communeOptions = communes.map((c) => ({
    value: c.nom,
    label: c.nom,
    sub: c.codePostal,
  }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <MultiCombobox
        options={metierOptions}
        values={currentMetiers}
        onChange={(v) => navigate(v, currentCommune ?? "", currentSearch)}
        placeholder="Tous les métiers"
        allLabel="Tous les métiers"
        label="Corps de métier"
        className="sm:flex-[2]"
      />
      <Combobox
        options={communeOptions}
        value={currentCommune ?? ""}
        onChange={(v) => navigate(currentMetiers, v, currentSearch)}
        placeholder="Toutes les communes"
        allLabel="Toutes les communes"
        label="Commune du projet"
        className="sm:flex-[1]"
      />
    </div>
  );
}
