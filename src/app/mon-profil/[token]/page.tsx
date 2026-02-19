export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import EditProfilForm from "@/components/features/EditProfilForm";
import { prisma } from "@/lib/db/client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Modifier ma fiche — OyezArtisans" };

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function EditProfilPage({ params }: PageProps) {
  const { token } = await params;

  // Vérification côté serveur
  const editToken = await prisma.editToken.findUnique({
    where: { token },
    include: {
      artisan: {
        include: {
          metiers: { include: { metier: true } },
          communes: { include: { commune: true } },
        },
      },
    },
  });

  if (!editToken || editToken.usedAt || editToken.expiresAt < new Date()) {
    notFound();
  }

  const { artisan } = editToken;

  const communes = await prisma.commune.findMany({
    orderBy: { nom: "asc" },
    select: { id: true, nom: true, codePostal: true },
  });

  const initialData = {
    prenom: artisan.prenom,
    nom: artisan.nom,
    email: artisan.email,
    raisonSociale: artisan.raisonSociale ?? "",
    siret: artisan.siret ?? "",
    telephone: artisan.telephone ?? "",
    siteWeb: artisan.siteWeb ?? "",
    logoUrl: artisan.logoUrl ?? "",
    description: artisan.description ?? "",
    metierSlugs: artisan.metiers.map((m) => m.metier.slug),
    communeIds: artisan.communes.map((c) => c.communeId),
  };

  return (
    <main className="min-h-screen bg-[#fff8f0] pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1a2e] py-12 text-center">
        <div className="bd-halftone absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-xl px-4">
          <div className="bd-onomatopee mb-3 inline-block -rotate-1 text-3xl text-[#ffd93d]">
            C&apos;est parti !
          </div>
          <h1 className="bd-titre mb-2 text-4xl text-white">Modifier ma fiche</h1>
          <p className="text-gray-300">
            Bonjour <strong className="text-[#ffd93d]">{artisan.prenom}</strong> — après validation,
            votre fiche mise à jour sera publiée sous 48h.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-10">
        <EditProfilForm token={token} initialData={initialData} communes={communes} />
      </section>
    </main>
  );
}
