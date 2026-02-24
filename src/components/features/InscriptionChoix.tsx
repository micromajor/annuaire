"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InscriptionForm from "@/components/features/InscriptionForm";

interface Commune {
  id: string;
  nom: string;
  codePostal: string;
}

interface Metier {
  slug: string;
  label: string;
}

interface Props {
  communes: Commune[];
  metiers: Metier[];
}

type Profil = "artisan" | "particulier";

export default function InscriptionChoix({ communes, metiers }: Props) {
  const [profil, setProfil] = useState<Profil | null>(null);
  const router = useRouter();

  function choisir(p: Profil) {
    if (p === "particulier") {
      router.push("/");
      return;
    }
    setProfil("artisan");
  }

  if (profil === "artisan") {
    return (
      <div>
        <button
          onClick={() => setProfil(null)}
          className="mb-6 flex items-center gap-2 text-sm font-bold text-[#1a1a2e]/60 transition-colors hover:text-[#1a1a2e]"
        >
          ← Changer de profil
        </button>
        <InscriptionForm communes={communes} metiers={metiers} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-8 text-center text-lg font-bold text-[#1a1a2e]">
        Commençons par le plus important…
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Carte artisan */}
        <button
          onClick={() => choisir("artisan")}
          className="bd-card group flex flex-col items-center gap-4 p-8 text-center transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_#1a1a2e] focus:outline-none"
        >
          <span className="text-6xl transition-transform duration-200 group-hover:scale-110">
            🔨
          </span>
          <div>
            <p className="bd-titre text-xl text-[#1a1a2e]">Je suis artisan</p>
            <p className="mt-1 text-sm text-[#1a1a2e]/60">
              Je veux référencer mon entreprise et trouver de nouveaux clients dans le 44.
            </p>
          </div>
          <span className="mt-auto inline-block rounded-lg border-2 border-[#1a1a2e] bg-[#ffd93d] px-4 py-2 text-sm font-bold text-[#1a1a2e] shadow-[2px_2px_0_#1a1a2e] group-hover:shadow-[3px_3px_0_#1a1a2e]">
            Inscrire mon entreprise →
          </span>
        </button>

        {/* Carte particulier */}
        <button
          onClick={() => choisir("particulier")}
          className="bd-card group flex flex-col items-center gap-4 p-8 text-center transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0_#1a1a2e] focus:outline-none"
        >
          <span className="text-6xl transition-transform duration-200 group-hover:scale-110">
            🏠
          </span>
          <div>
            <p className="bd-titre text-xl text-[#1a1a2e]">J&apos;ai un besoin</p>
            <p className="mt-1 text-sm text-[#1a1a2e]/60">
              Je cherche un artisan pour un projet de rénovation, réparation ou installation.
            </p>
          </div>
          <span className="mt-auto inline-block rounded-lg border-2 border-[#1a1a2e] bg-[#6bcb77] px-4 py-2 text-sm font-bold text-[#1a1a2e] shadow-[2px_2px_0_#1a1a2e] group-hover:shadow-[3px_3px_0_#1a1a2e]">
            Déposer mon besoin →
          </span>
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-[#1a1a2e]/40">
        Pas de compte requis côté particulier · Inscription artisan gratuite et vérifiée à la main
      </p>
    </div>
  );
}
