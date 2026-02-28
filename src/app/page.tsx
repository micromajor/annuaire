export const dynamic = "force-dynamic";

import Link from "next/link";
import FloatingTools from "@/components/ui/FloatingTools";
import HeroSearch from "@/components/features/HeroSearch";
import { type BesoinItem } from "@/components/features/MatchingBesoins";
import ArtisanHomeView from "@/components/features/ArtisanHomeView";
import ParticulierHome from "@/components/features/ParticulierHome";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import NavMessagerieIcon from "@/components/features/NavMessagerieIcon";
import { prisma } from "@/lib/db/client";
import AutoSignOut from "@/components/ui/AutoSignOut";

export default async function HomePage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const isArtisan = role === "artisan";
  const isParticulier = role === "particulier";
  const isAdmin = role === "admin";
  const userId = (session?.user as { id?: string })?.id;

  // Données selon le rôle connecté
  let artisanPrenom: string | null = null;
  let particulierPrenom: string | null = null;
  let matchingBesoins: BesoinItem[] = [];
  let artisanCommunes: string[] = [];

  // Métiers depuis la DB (nécessaire pour ParticulierHome et HeroSearch)
  const allMetiers = await prisma.metier.findMany({
    select: { slug: true, label: true, categorie: true },
    orderBy: { label: "asc" },
  });

  if (isArtisan && userId) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: userId },
      select: {
        prenom: true,
        deletedAt: true,
        metiers: { include: { metier: true } },
        communes: { include: { commune: true } },
      },
    });

    // Compte supprimé ou introuvable — invalider la session
    if (!artisan || artisan.deletedAt) {
      return <AutoSignOut />;
    }

    artisanPrenom = artisan.prenom;

    const slugs = artisan.metiers.map((m) => m.metier.slug);
    const communes = artisan.communes.map((c) => c.commune.nom);
    artisanCommunes = communes;

    if (slugs.length > 0 || communes.length > 0) {
      const metierMap = Object.fromEntries(allMetiers.map((m) => [m.slug, m.label]));
      const rawBesoins = await prisma.besoin.findMany({
        where: {
          status: "NOUVEAU",
          OR: [
            ...(slugs.length > 0 ? [{ metierSlug: { in: slugs } }] : []),
            ...(communes.length > 0 ? [{ commune: { in: communes } }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      matchingBesoins = rawBesoins.map((b) => ({
        id: b.id,
        metierSlug: b.metierSlug,
        metierLabel: metierMap[b.metierSlug] ?? b.metierSlug,
        commune: b.commune,
        description: b.description,
        prenom: b.prenom,
        photos: Array.isArray(b.photos) ? (b.photos as string[]) : [],
        createdAt: b.createdAt.toISOString(),
        particulierId: b.artisanId ?? null,
        contact: (b.contact as string) ?? null,
      }));
    }
  }

  if (isParticulier && userId) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: userId },
      select: { prenom: true },
    });
    particulierPrenom = artisan?.prenom ?? null;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://oyezartisans.fr/#organization",
              name: "Oyez Artisans !",
              url: "https://oyezartisans.fr",
              logo: "https://oyezartisans.fr/icon",
              description:
                "Annuaire hyperlocal d'artisans du bâtiment à Nantes et Est Loire-Atlantique",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                areaServed: "FR",
                availableLanguage: "French",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://oyezartisans.fr/#website",
              url: "https://oyezartisans.fr",
              name: "Oyez Artisans !",
              description: "Annuaire d'artisans du bâtiment en Loire-Atlantique",
              publisher: { "@id": "https://oyezartisans.fr/#organization" },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://oyezartisans.fr/artisans?metier={metier}&commune={commune}",
                },
                "query-input": "required name=metier name=commune",
              },
              inLanguage: "fr-FR",
            },
          ]),
        }}
      />
      <div
        className={`flex min-h-screen flex-col ${isArtisan ? "bg-[#6bcb77]" : isParticulier ? "bg-[#60c5f1]" : "bg-[#ffd93d]"}`}
      >
        {/* Header minimaliste */}
        <header className="relative z-50 flex items-center justify-end px-6 py-4">
          <nav className="flex items-center gap-3">
            {isArtisan ? (
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
            ) : isParticulier ? (
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
            ) : isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-bold text-[#1a1a2e] underline-offset-2 hover:underline"
                >
                  Administration
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
              <>
                <Link
                  href="/connexion"
                  className="text-sm font-bold text-[#1a1a2e] underline-offset-2 hover:underline"
                >
                  Se connecter
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Hero */}
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 pt-8 pb-24">
          <FloatingTools />

          {isArtisan ? (
            /* --- Vue artisan connecté --- */
            <div className="relative z-10 w-full max-w-5xl">
              {/* Header artisan */}
              <div className="mb-8 text-center">
                <span className="bd-badge bd-badge-bleu bd-anim-pop mb-3 inline-flex">
                  👋 Bonjour {artisanPrenom ?? "artisan"} !
                </span>
                <h1 className="bd-titre bd-anim-build text-4xl leading-tight text-[#1a1a2e] sm:text-5xl">
                  Vous pourriez les intéresser
                </h1>
                <p className="mt-2 text-sm font-semibold text-[#1a1a2e]/60">
                  Ces particuliers cherchent votre expertise dans votre zone.
                </p>
              </div>

              {/* Liste / Carte des demandes matchantes */}
              <ArtisanHomeView besoins={matchingBesoins} artisanCommunes={artisanCommunes} />
            </div>
          ) : isParticulier ? (
            /* --- Vue particulier connecté --- */
            <ParticulierHome prenom={particulierPrenom} metiers={allMetiers} />
          ) : (
            /* --- Vue visiteur --- */
            <div className="relative z-10 w-full max-w-5xl text-center">
              <h1 className="bd-titre bd-anim-build mb-10 flex flex-wrap items-baseline justify-center gap-3 text-6xl leading-tight text-[#1a1a2e] sm:text-8xl">
                Oyez Artisans&nbsp;!
                <span className="rounded-xl border-2 border-[#1a1a2e] bg-[#1a1a2e] px-3 py-1 text-2xl font-black text-[#ffd93d] sm:text-3xl">
                  44
                </span>
              </h1>
              <div className="bd-anim-build" style={{ animationDelay: "0.15s" }}>
                <HeroSearch metiers={allMetiers} />
              </div>
            </div>
          )}
        </main>

        {/* Footer minimaliste — style Google */}
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
    </>
  );
}
