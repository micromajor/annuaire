export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/db/client";
import InscriptionChoix from "@/components/features/InscriptionChoix";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inscription | Oyez Artisans !",
  description:
    "Artisan ou particulier ? Inscrivez votre entreprise artisanale ou déposez votre besoin de travaux à Nantes Est.",
};

export default async function InscriptionPage() {
  const communes = await prisma.commune.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, codePostal: true },
  });

  return (
    <main className="min-h-screen bg-[#fff8f0] pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1a2e] py-14 text-center">
        <div className="bd-halftone absolute inset-0 opacity-10" />
        {/* Retour */}
        <Link
          href="/"
          className="absolute top-5 left-5 z-20 rounded-xl border-2 border-white/30 px-3 py-1.5 text-sm font-black text-white/60 hover:border-white hover:text-white"
        >
          ← Retour
        </Link>
        <div className="relative mx-auto max-w-3xl px-4">
          <div
            className="bd-onomatopee mb-4 inline-block -rotate-2 text-4xl text-[#ffd93d]"
            style={{ animation: "bd-swing 0.8s ease" }}
          >
            Bienvenue !
          </div>
          <h1 className="bd-titre mb-4 text-4xl text-white sm:text-5xl">Vous êtes…&nbsp;?</h1>
          <p className="mx-auto max-w-xl text-lg text-gray-300">
            Artisan à la recherche de clients, ou particulier avec un projet ? On a ce qu&apos;il
            vous faut.
          </p>
        </div>
      </section>

      {/* Choix de profil + formulaire */}
      <section className="mx-auto max-w-3xl px-4 pt-12">
        <InscriptionChoix communes={communes} />
      </section>
    </main>
  );
}
