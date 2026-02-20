export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import AdminArtisanRow from "@/components/features/AdminArtisanRow";
import AdminAvisRow from "@/components/features/AdminAvisRow";
import AdminLogoutButton from "@/components/features/AdminLogoutButton";
import AdminUserRow from "@/components/features/AdminUserRow";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — OyezArtisans" };

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");

  const [
    enAttente,
    avecDraft,
    valides,
    rejetes,
    avisEnAttente,
    besoinsNouveau,
    tousLesUtilisateurs,
  ] = await Promise.all([
    prisma.artisan.findMany({
      where: {
        status: "EN_ATTENTE",
        deletedAt: null,
        NOT: { draftData: { path: ["isParticulier"], equals: true } },
      },
      include: {
        metiers: { include: { metier: true } },
        communes: { include: { commune: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artisan.findMany({
      where: { status: "VALIDE", hasPendingDraft: true, deletedAt: null },
      include: {
        metiers: { include: { metier: true } },
        communes: { include: { commune: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.artisan.count({ where: { status: "VALIDE", deletedAt: null } }),
    prisma.artisan.count({ where: { status: "REJETE", deletedAt: null } }),
    prisma.avis.findMany({
      where: { status: "EN_ATTENTE" },
      include: { artisan: { select: { raisonSociale: true, prenom: true, nom: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.besoin.findMany({
      where: { status: "NOUVEAU" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artisan.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        raisonSociale: true,
        status: true,
        draftData: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        logoUrl: true,
        telephone: true,
        siret: true,
        siteWeb: true,
        description: true,
        passwordHash: true,
        hasPendingDraft: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header admin */}
      <header className="border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="bd-titre text-2xl text-[#ffd93d]">Oyez Artisans ! — Admin</span>
          <AdminLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "En attente", count: enAttente.length, color: "bg-[#ffd93d]", emoji: "⏳" },
            {
              label: "Modifs en attente",
              count: avecDraft.length,
              color: "bg-[#a78bfa]",
              emoji: "✏️",
            },
            {
              label: "Avis à modérer",
              count: avisEnAttente.length,
              color: "bg-[#38bdf8]",
              emoji: "⭐",
            },
            {
              label: "Besoins reçus",
              count: besoinsNouveau.length,
              color: "bg-[#fb923c]",
              emoji: "📋",
            },
            { label: "Validés", count: valides, color: "bg-[#6bcb77]", emoji: "✅" },
            { label: "Rejetés", count: rejetes, color: "bg-[#ff6b6b]", emoji: "❌" },
          ].map(({ label, count, color, emoji }) => (
            <div
              key={label}
              className={`${color} bd-card rounded-xl border-2 border-[#1a1a1a] p-5 text-center`}
            >
              <div className="text-3xl">{emoji}</div>
              <div className="bd-titre mt-1 text-3xl text-[#1a1a2e]">{count}</div>
              <div className="text-sm font-bold text-[#1a1a2e]">{label}</div>
            </div>
          ))}
        </div>

        {/* Liste EN_ATTENTE */}
        <h2 className="bd-titre mb-4 text-2xl text-[#1a1a2e]">
          ⏳ Fiches en attente de validation ({enAttente.length})
        </h2>

        {enAttente.length === 0 ? (
          <div className="bd-card p-10 text-center text-gray-400">
            <div className="mb-2 text-4xl">🎉</div>
            <p className="font-bold">Aucune fiche en attente. Tout est à jour !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enAttente.map((artisan) => (
              <AdminArtisanRow key={artisan.id} artisan={artisan} />
            ))}
          </div>
        )}
        {/* Modifications de fiches existantes */}
        {avecDraft.length > 0 && (
          <>
            <h2 className="bd-titre mt-10 mb-4 text-2xl text-[#1a1a2e]">
              ✏️ Modifications en attente ({avecDraft.length})
            </h2>
            <div className="space-y-4">
              {avecDraft.map((artisan) => (
                <AdminArtisanRow key={artisan.id} artisan={artisan} isDraft />
              ))}
            </div>
          </>
        )}

        {/* Avis en attente de modération */}
        {avisEnAttente.length > 0 && (
          <>
            <h2 className="bd-titre mt-10 mb-4 text-2xl text-[#1a1a2e]">
              ⭐ Avis à modérer ({avisEnAttente.length})
            </h2>
            <div className="space-y-4">
              {avisEnAttente.map((avis) => (
                <AdminAvisRow key={avis.id} avis={avis} />
              ))}
            </div>
          </>
        )}

        {/* Besoins déposés par les particuliers */}
        {besoinsNouveau.length > 0 && (
          <>
            <h2 className="bd-titre mt-10 mb-4 text-2xl text-[#1a1a2e]">
              📋 Besoins à traiter ({besoinsNouveau.length})
            </h2>
            <div className="space-y-3">
              {besoinsNouveau.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border-2 border-[#1a1a1a] bg-white p-5"
                  style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border-2 border-[#1a1a1a] bg-[#fb923c] px-3 py-0.5 text-sm font-bold">
                      {b.metierSlug}
                    </span>
                    <span className="font-bold text-[#1a1a2e]">📍 {b.commune}</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(b.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-gray-700">{b.description}</p>
                  <p className="text-sm font-bold text-[#1a1a2e]">
                    {b.prenom} — <span className="font-normal text-gray-600">{b.contact}</span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
        {/* Section utilisateurs */}
        <h2 className="bd-titre mt-10 mb-4 text-2xl text-[#1a1a2e]">
          👥 Tous les utilisateurs ({tousLesUtilisateurs.length})
        </h2>
        <div className="space-y-2">
          {tousLesUtilisateurs.map((u) => (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <AdminUserRow key={u.id} artisan={u as any} />
          ))}
        </div>
      </main>
    </div>
  );
}
