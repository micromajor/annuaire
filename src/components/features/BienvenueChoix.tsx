"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BienvenueChoix() {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<"artisan" | "particulier" | null>(null);

  async function choisirArtisan() {
    setLoading("artisan");
    // Efface le flag needsSetup dans le JWT
    await update({ clearSetup: true });
    router.push("/mon-espace");
  }

  async function choisirParticulier() {
    setLoading("particulier");
    // Marque le compte comme particulier en DB (persistance entre sessions)
    await fetch("/api/mon-espace/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isParticulier: true }),
    });
    // Met à jour le JWT sans déconnecter
    await update({ becomeParticulier: true });
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Carte particulier — bleu clair */}
        <button
          onClick={choisirParticulier}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-4 rounded-2xl border-4 border-[#1a1a2e] bg-white p-8 text-center shadow-[6px_6px_0_#1a1a2e] transition-all duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0_#1a1a2e] focus:outline-none disabled:opacity-60"
        >
          <span className="text-6xl transition-transform duration-200 group-hover:scale-110">
            🏠
          </span>
          <div>
            <p
              className="font-bangers mb-1 text-2xl tracking-wide text-[#1a1a2e]"
              style={{ fontFamily: "var(--font-bangers)" }}
            >
              Je recherche
            </p>
            <p className="text-sm font-semibold text-[#1a1a2e]/60">
              J&apos;ai un projet de rénovation ou de réparation et je cherche un artisan de
              confiance.
            </p>
          </div>
          <span className="mt-auto inline-block rounded-lg border-2 border-[#1a1a2e] bg-[#60c5f1] px-5 py-2.5 text-sm font-bold text-[#1a1a2e] shadow-[2px_2px_0_#1a1a2e] group-hover:shadow-[3px_3px_0_#1a1a2e]">
            {loading === "particulier" ? "Redirection…" : "Je recherche"}
          </span>
        </button>

        {/* Carte artisan — vert */}
        <button
          onClick={choisirArtisan}
          disabled={loading !== null}
          className="group flex flex-col items-center gap-4 rounded-2xl border-4 border-[#1a1a2e] bg-white p-8 text-center shadow-[6px_6px_0_#1a1a2e] transition-all duration-150 hover:-translate-y-1 hover:shadow-[8px_8px_0_#1a1a2e] focus:outline-none disabled:opacity-60"
        >
          <span className="text-6xl transition-transform duration-200 group-hover:scale-110">
            🔨
          </span>
          <div>
            <p
              className="font-bangers mb-1 text-2xl tracking-wide text-[#1a1a2e]"
              style={{ fontFamily: "var(--font-bangers)" }}
            >
              Je propose
            </p>
            <p className="text-sm font-semibold text-[#1a1a2e]/60">
              Je suis artisan et je veux trouver de nouveaux clients dans le 44.
            </p>
          </div>
          <span className="mt-auto inline-block rounded-lg border-2 border-[#1a1a2e] bg-[#6bcb77] px-5 py-2.5 text-sm font-bold text-[#1a1a2e] shadow-[2px_2px_0_#1a1a2e] group-hover:shadow-[3px_3px_0_#1a1a2e]">
            {loading === "artisan" ? "Redirection…" : "Je propose"}
          </span>
        </button>
      </div>
    </div>
  );
}
