export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db/client";
import { METIERS, COMMUNES_NANTES_EST, PAGINATION } from "@/constants";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArtisanCard from "@/components/features/ArtisanCard";
import FiltresArtisans from "@/components/features/FiltresArtisans";
import type { Metadata } from "next";

interface SearchParams {
  metier?: string;
  commune?: string;
  page?: string;
}

export const metadata: Metadata = {
  title: "Trouver un artisan",
  description:
    "Annuaire des artisans du bâtiment sur Nantes et l'Est de la Loire-Atlantique. Filtrez par métier et commune.",
};

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGINATION.ARTISANS_PAR_PAGE;

  const where = {
    status: "VALIDE" as const,
    deletedAt: null,
    ...(params.metier ? { metiers: { some: { metier: { slug: params.metier } } } } : {}),
    ...(params.commune ? { communes: { some: { commune: { nom: params.commune } } } } : {}),
  };

  const [artisans, total] = await Promise.all([
    prisma.artisan.findMany({
      where,
      include: {
        metiers: { include: { metier: true } },
        communes: { include: { commune: true } },
        avis: { where: { status: "VALIDE" }, select: { note: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAGINATION.ARTISANS_PAR_PAGE,
      skip,
    }),
    prisma.artisan.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGINATION.ARTISANS_PAR_PAGE);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="bd-titre text-4xl text-[#1a1a2e] sm:text-5xl">🔍 Trouver un artisan</h1>
          <p className="mt-2 text-gray-600">
            {total} artisan{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""} dans notre annuaire
          </p>
        </div>

        {/* Filtres */}
        <FiltresArtisans
          metiers={METIERS}
          communes={COMMUNES_NANTES_EST}
          currentMetier={params.metier}
          currentCommune={params.commune}
        />

        <hr className="bd-separator my-8" />

        {/* Résultats */}
        {artisans.length === 0 ? (
          <div className="bd-bubble py-16 text-center">
            <p className="bd-onomatopee mb-4 text-5xl" style={{ transform: "rotate(-3deg)" }}>
              Oops!
            </p>
            <p className="text-lg font-semibold text-gray-600">
              Aucun artisan trouvé pour ces critères.
            </p>
            <p className="mt-1 text-gray-400">Essayez de modifier vos filtres.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artisans.map((artisan) => (
              <ArtisanCard key={artisan.id} artisan={artisan} avis={artisan.avis} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/artisans?${new URLSearchParams({
                  ...(params.metier ? { metier: params.metier } : {}),
                  ...(params.commune ? { commune: params.commune } : {}),
                  page: String(p),
                })}`}
                className={`bd-btn ${
                  p === page ? "bd-btn-secondary" : "bd-btn-outline"
                } px-3 py-1 text-sm`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
