export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { COMMUNES_NANTES_EST } from "@/constants";
import { slugify } from "@/lib/utils/slugify";
import ArtisanCard from "@/components/features/ArtisanCard";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ metier: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { metier } = await params;
  const metierInfo = await prisma.metier.findFirst({ where: { slug: metier } });
  if (!metierInfo) return { title: "Page introuvable" };

  const label = metierInfo.label;
  const labelLow = label.toLowerCase();
  const url = `https://oyezartisans.fr/artisans/${metier}`;

  const title = `${label} en Loire-Atlantique — Annuaire artisans`;
  const description = `Trouvez un ${labelLow} près de Nantes et en Loire-Atlantique. Artisans du bâtiment vérifiés, fiches complètes, contact direct. Devis gratuit.`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "fr_FR",
      siteName: "Oyez Artisans !",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function LandingMetier({ params }: PageProps) {
  const [{ metier }, session] = await Promise.all([params, auth()]);
  const viewerRole = (session?.user as { role?: string })?.role;
  const metierInfo = await prisma.metier.findFirst({ where: { slug: metier } });
  if (!metierInfo) notFound();

  const label = metierInfo.label;
  const labelLow = label.toLowerCase();

  const artisans = await prisma.artisan.findMany({
    where: {
      status: "VALIDE",
      deletedAt: null,
      description: { not: null },
      metiers: { some: { metier: { slug: metier } } },
    },
    include: {
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
      avis: { where: { status: "VALIDE" }, select: { note: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Communes où ce métier est représenté
  const communesWithArtisans = new Set<string>();
  for (const a of artisans) {
    for (const c of a.communes) {
      communesWithArtisans.add(c.commune.nom);
    }
  }

  // JSON-LD
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://oyezartisans.fr" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Artisans",
        item: "https://oyezartisans.fr/artisans",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: label,
        item: `https://oyezartisans.fr/artisans/${metier}`,
      },
    ],
  };

  const jsonLdItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${label}s en Loire-Atlantique`,
    description: `Liste des ${labelLow}s disponibles à Nantes et en Loire-Atlantique`,
    numberOfItems: artisans.length,
    itemListElement: artisans.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "LocalBusiness",
        "@id": `https://oyezartisans.fr/artisan/${a.id}`,
        name: a.raisonSociale ?? `${a.prenom} ${a.nom}`,
        url: `https://oyezartisans.fr/artisan/${a.id}`,
        ...(a.telephone ? { telephone: a.telephone } : {}),
        ...(a.avis.length > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: (a.avis.reduce((s, v) => s + v.note, 0) / a.avis.length).toFixed(1),
                reviewCount: a.avis.length,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdItemList) }}
      />

      <div
        className={`flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden ${viewerRole === "artisan" ? "bg-[#6bcb77]" : viewerRole === "particulier" ? "bg-[#60c5f1]" : "bg-[#ffd93d]"}`}
      >
        {/* Header */}
        <header className="relative z-50 flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="bd-titre text-2xl text-[#1a1a2e] no-underline"
            style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}
          >
            Oyez Artisans !
          </Link>
          <Link
            href="/artisans"
            className="text-sm font-bold text-[#1a1a2e] underline-offset-2 hover:underline"
          >
            Annuaire complet
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 pt-4 pb-16">
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex flex-wrap items-center gap-1 text-xs font-semibold text-[#1a1a2e]/60"
            aria-label="Fil d'ariane"
          >
            <Link href="/" className="hover:text-[#1a1a2e]">
              Accueil
            </Link>
            <span>&rsaquo;</span>
            <Link href="/artisans" className="hover:text-[#1a1a2e]">
              Artisans
            </Link>
            <span>&rsaquo;</span>
            <span className="text-[#1a1a2e]">{label}</span>
          </nav>

          {/* H1 + intro */}
          <div className="mb-8">
            <h1 className="bd-titre text-4xl text-[#1a1a2e] sm:text-5xl">
              {label} en Loire-Atlantique
            </h1>
            <p className="mt-3 max-w-2xl text-lg font-semibold text-[#1a1a2e]/80">
              {artisans.length > 0 ? (
                <>
                  {artisans.length} {labelLow}
                  {artisans.length > 1 ? "s référencés" : " référencé"} à Nantes et en
                  Loire-Atlantique. Contactez-les directement, sans intermédiaire.
                </>
              ) : (
                <>
                  Aucun {labelLow} référencé pour le moment.{" "}
                  <Link href="/artisans" className="underline">
                    Consultez l&apos;annuaire complet.
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Grille artisans */}
          {artisans.length > 0 ? (
            <div className="mb-10 grid gap-5 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
              {artisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          ) : (
            <div
              className="mb-10 rounded-2xl border-4 border-[#1a1a1a] bg-white px-8 py-12 text-center"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
            >
              <p className="mb-4 text-4xl">&#128270;</p>
              <p className="font-black text-[#1a1a2e]">
                Pas encore de {labelLow} dans notre annuaire
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Revenez bientôt, nous enrichissons notre annuaire chaque semaine !
              </p>
              <Link
                href="/artisans"
                className="mt-4 inline-block rounded-xl border-2 border-[#1a1a2e] bg-[#ffd93d] px-5 py-2.5 text-sm font-black text-[#1a1a2e] hover:bg-[#ffcf00]"
              >
                Voir l&apos;annuaire complet
              </Link>
            </div>
          )}

          {/* Section informative SEO */}
          <div
            className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-8"
            style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
          >
            <h2 className="bd-titre mb-4 text-2xl text-[#1a1a2e]">
              Trouver un {labelLow} près de Nantes
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              Oyez Artisans ! est l&apos;annuaire hyperlocal des artisans du bâtiment autour de
              Nantes et de la Loire-Atlantique. Chaque fiche est validée manuellement avant mise en
              ligne. Vous trouverez ici des {labelLow}s intervenant sur l&apos;ensemble de la
              Loire-Atlantique (44)&nbsp;: Nantes, Saint-Herblain, Rezé, Carquefou, Vertou,
              Saint-Sébastien-sur-Loire, et bien d&apos;autres communes.
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              Contactez un {labelLow} directement depuis sa fiche&nbsp;: envoyez votre demande,
              joignez des photos du chantier, et recevez une réponse sous 48h. Inscription gratuite
              pour les artisans.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/artisans"
                className="rounded-xl border-2 border-[#1a1a2e] bg-white px-4 py-2 text-sm font-black text-[#1a1a2e] hover:bg-gray-50"
              >
                Annuaire complet
              </Link>
              <Link
                href="/connexion?callbackUrl=/mon-espace"
                className="rounded-xl border-2 border-[#6bcb77] bg-[#6bcb77] px-4 py-2 text-sm font-black text-white hover:bg-[#5ab868]"
              >
                Vous êtes {labelLow} ? Rejoignez-nous
              </Link>
            </div>
          </div>

          {/* Parcourir par commune */}
          <div className="mt-8">
            <h2 className="mb-4 font-black text-[#1a1a2e]">{label} par commune</h2>
            <div className="flex flex-wrap gap-2">
              {COMMUNES_NANTES_EST.map((c) => (
                <Link
                  key={c.nom}
                  href={`/artisans/${metier}/${slugify(c.nom)}`}
                  className={`rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                    communesWithArtisans.has(c.nom)
                      ? "border-[#1a1a2e] bg-[#ffd93d] text-[#1a1a2e] hover:bg-[#ffcf00]"
                      : "border-[#1a1a2e]/30 bg-white text-[#1a1a2e] hover:border-[#1a1a2e] hover:bg-[#fff8f0]"
                  }`}
                >
                  {label} {c.nom}
                  {communesWithArtisans.has(c.nom) ? " ●" : ""}
                </Link>
              ))}
            </div>
          </div>
        </main>

        <footer className="mt-auto border-t-2 border-[#1a1a1a]/10 px-6 py-3">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between text-xs font-semibold text-[#1a1a2e]/50">
            <span>&copy; 2026 Oyez Artisans !</span>
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
