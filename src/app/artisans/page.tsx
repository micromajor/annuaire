export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { COMMUNES_NANTES_EST, PAGINATION } from "@/constants";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import ArtisanCard from "@/components/features/ArtisanCard";
import FiltresArtisans from "@/components/features/FiltresArtisans";
import FloatingTools from "@/components/ui/FloatingTools";
import NavMessagerieIcon from "@/components/features/NavMessagerieIcon";
import type { Metadata } from "next";

interface SearchParams {
  metier?: string | string[];
  commune?: string;
  page?: string;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const metierSlug = Array.isArray(params.metier) ? params.metier[0] : params.metier;
  const commune = params.commune;

  const metierInfo = metierSlug
    ? await prisma.metier.findFirst({ where: { slug: metierSlug } })
    : null;

  if (metierInfo && commune) {
    const title = `${metierInfo.label} à ${commune} — Annuaire artisans`;
    return {
      title,
      description: `Trouvez un ${metierInfo.label.toLowerCase()} à ${commune} en Loire-Atlantique. Artisans du bâtiment vérifiés, contact direct.`,
      alternates: {
        canonical: `https://oyezartisans.fr/artisans/${metierInfo.slug}/${commune
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/\s+/g, "-")}`,
      },
    };
  }

  if (metierInfo) {
    const title = `${metierInfo.label} en Loire-Atlantique — Annuaire artisans`;
    return {
      title,
      description: `Trouvez un ${metierInfo.label.toLowerCase()} à Nantes et en Loire-Atlantique. Fiches vérifiées, contact direct sans intermédiaire.`,
      alternates: { canonical: `https://oyezartisans.fr/artisans?metier=${metierInfo.slug}` },
    };
  }

  return {
    title: "Annuaire des artisans du bâtiment — Nantes & Loire-Atlantique",
    description:
      "Trouvez maçon, plombier, électricien, menuisier, couvreur et autres artisans du bâtiment à Nantes et en Loire-Atlantique. Fiches vérifiées, contact direct.",
    alternates: { canonical: "https://oyezartisans.fr/artisans" },
    openGraph: {
      title: "Annuaire artisans — Nantes & Loire-Atlantique",
      description:
        "Maçon, plombier, électricien… Artisans du bâtiment vérifiés à Nantes et Est Loire-Atlantique.",
      url: "https://oyezartisans.fr/artisans",
      type: "website",
    },
  };
}

export default async function ArtisansPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const isConnected = !!session?.user;
  const viewerRole = (session?.user as { role?: string })?.role;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGINATION.ARTISANS_PAR_PAGE;

  // Normalise metier en tableau (peut être string ou string[] selon Next.js)
  const metierSlugs = params.metier
    ? Array.isArray(params.metier)
      ? params.metier
      : [params.metier]
    : [];

  const where = {
    status: "VALIDE" as const,
    deletedAt: null,
    description: { not: null }, // fiche vide masquée du listing
    ...(metierSlugs.length > 0
      ? { metiers: { some: { metier: { slug: { in: metierSlugs } } } } }
      : {}),
    ...(params.commune ? { communes: { some: { commune: { nom: params.commune } } } } : {}),
  };

  const [artisans, total, allMetiers] = await Promise.all([
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
    prisma.metier.findMany({
      select: { slug: true, label: true, categorie: true },
      orderBy: { label: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGINATION.ARTISANS_PAR_PAGE);

  return (
    <div
      className={`flex min-h-screen flex-col ${viewerRole === "artisan" ? "bg-[#6bcb77]" : viewerRole === "particulier" ? "bg-[#60c5f1]" : "bg-[#ffd93d]"}`}
    >
      {/* Header minimaliste */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="bd-titre text-2xl text-[#1a1a2e] no-underline"
          style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}
        >
          Oyez Artisans !
        </Link>
        <nav className="flex items-center gap-3">
          {isConnected ? (
            <>
              <NavMessagerieIcon />
              <Link
                href="/mon-espace"
                aria-label="Mon espace"
                title="Mon espace"
                className="flex items-center justify-center rounded-xl border-2 border-[#1a1a2e]/40 p-2 text-[#1a1a2e] transition-colors hover:bg-[#1a1a2e]/10"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  aria-label="Se déconnecter"
                  title="Se déconnecter"
                  className="flex items-center justify-center rounded-xl border-2 border-[#1a1a2e]/40 p-2 text-[#1a1a2e] transition-colors hover:bg-[#1a1a2e]/10"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/connexion"
              className="text-sm font-bold text-[#1a1a2e] underline-offset-2 hover:underline"
            >
              Se connecter
            </Link>
          )}
        </nav>
      </header>

      <main className="relative flex-1 px-4 pt-8 pb-24">
        <FloatingTools />

        <div className="relative z-10 mx-auto w-full max-w-[1500px]">
          {/* Badge + H1 */}
          <div className="mb-10 text-center">
            <span className="bd-badge bd-badge-bleu bd-anim-pop mb-8 inline-flex">
              📍 Nantes &amp; Est Loire-Atlantique
            </span>
            <h1 className="bd-titre bd-anim-build mb-4 text-5xl leading-tight text-[#1a1a2e] sm:text-7xl">
              Trouvez votre artisan
            </h1>
            <p className="text-sm font-semibold text-[#1a1a2e]/60">
              {total} artisan{total > 1 ? "s" : ""} dans notre annuaire
            </p>
          </div>

          {/* Filtres */}
          <FiltresArtisans
            metiers={allMetiers}
            communes={COMMUNES_NANTES_EST}
            currentMetiers={metierSlugs}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const paginationParams = new URLSearchParams();
                for (const m of metierSlugs) paginationParams.append("metier", m);
                if (params.commune) paginationParams.set("commune", params.commune);
                paginationParams.set("page", String(p));
                return (
                  <a
                    key={p}
                    href={`/artisans?${paginationParams}`}
                    className={`bd-btn ${
                      p === page ? "bd-btn-secondary" : "bd-btn-outline"
                    } px-3 py-1 text-sm`}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="relative z-10 border-t-2 border-[#1a1a1a]/10 px-6 py-3">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between text-xs font-semibold text-[#1a1a2e]/50">
          <span>© 2026 Oyez Artisans !</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-[#1a1a2e]">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-[#1a1a2e]">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
