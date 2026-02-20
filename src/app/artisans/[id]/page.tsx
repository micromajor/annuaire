export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { auth, signOut } from "@/lib/auth";
import ContactForm from "@/components/features/ContactForm";
import AvisList from "@/components/features/AvisList";
import AvisForm from "@/components/features/AvisForm";
import MessagerieButton from "@/components/features/MessagerieButton";
import NavMessagerieIcon from "@/components/features/NavMessagerieIcon";
import CarteZoneLectureWrapper from "@/components/features/CarteZoneLectureWrapper";
import PortfolioPhotos from "@/components/features/PortfolioPhotos";
import type { Metadata } from "next";

const METIER_EMOJIS: Record<string, string> = {
  macon: "&#129521;",
  plombier: "&#128295;",
  electricien: "&#9889;",
  menuisier: "&#129717;",
  peintre: "&#127912;",
  couvreur: "&#127968;",
  carreleur: "&#9638;",
  chauffagiste: "&#128293;",
  plaquiste: "&#129498;",
  charpentier: "&#128297;",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ avisToken?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const artisan = await prisma.artisan.findFirst({
    where: { id, status: "VALIDE", deletedAt: null },
    include: {
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
    },
  });

  if (!artisan) return { title: "Artisan introuvable" };

  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metiers = artisan.metiers.map((m) => m.metier.label).join(", ");
  const communes = artisan.communes.map((c) => c.commune.nom).join(", ");
  const title = `${nom} — ${metiers}`;
  const description =
    artisan.description ??
    `Fiche de ${nom}, ${metiers} à ${communes || "Loire-Atlantique"}. Contactez-le directement sur Oyez Artisans !`;
  const url = `https://oyezartisans.fr/artisan/${id}`;

  return {
    title,
    description,
    keywords: [
      ...artisan.metiers.map((m) => m.metier.label),
      ...artisan.communes.map((c) => c.commune.nom),
      nom,
      "artisan",
      "Loire-Atlantique",
    ],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      locale: "fr_FR",
      siteName: "Oyez Artisans !",
      title,
      description,
      ...(artisan.logoUrl ? { images: [{ url: artisan.logoUrl, alt: nom }] } : {}),
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function FicheArtisanPage({ params, searchParams }: Props) {
  const [{ id }, sp, session] = await Promise.all([params, searchParams, auth()]);
  const avisToken = sp.avisToken;
  const isConnected = !!session?.user;
  const viewerRole = (session?.user as { role?: string })?.role;

  const artisan = await prisma.artisan.findFirst({
    where: { id, status: "VALIDE", deletedAt: null },
    include: {
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
    },
  });

  if (!artisan) notFound();

  const avisValides = await prisma.avis.findMany({
    where: { artisanId: id, status: "VALIDE" },
    orderBy: { createdAt: "desc" },
  });

  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const portfolioPhotos = Array.isArray(artisan.portfolioPhotos)
    ? (artisan.portfolioPhotos as string[])
    : [];
  const communeNoms = artisan.communes.map(({ commune }) => commune.nom);
  const firstSlug = artisan.metiers[0]?.metier.slug ?? "";
  const artisanEmoji = METIER_EMOJIS[firstSlug] ?? "&#128295;";
  const moyenne =
    avisValides.length > 0
      ? avisValides.reduce((acc, a) => acc + a.note, 0) / avisValides.length
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://oyezartisans.fr/artisan/${artisan.id}`,
    name: nomAffiche,
    description:
      artisan.description ??
      `${nomAffiche} — ${artisan.metiers.map((m) => m.metier.label).join(", ")} à ${artisan.communes.map((c) => c.commune.nom).join(", ")}`,
    url: `https://oyezartisans.fr/artisan/${artisan.id}`,
    ...(artisan.telephone ? { telephone: artisan.telephone } : {}),
    ...(artisan.logoUrl ? { image: artisan.logoUrl } : {}),
    ...(artisan.siteWeb ? { sameAs: [artisan.siteWeb] } : {}),
    address:
      artisan.communes.length > 0
        ? {
            "@type": "PostalAddress",
            addressLocality: artisan.communes[0].commune.nom,
            postalCode: artisan.communes[0].commune.codePostal,
            addressRegion: "Loire-Atlantique",
            addressCountry: "FR",
          }
        : undefined,
    areaServed: artisan.communes.map((c) => ({
      "@type": "City",
      name: c.commune.nom,
    })),
    ...(artisan.siret ? { identifier: artisan.siret } : {}),
    ...(moyenne !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: moyenne.toFixed(1),
            reviewCount: avisValides.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    aria-label="Se deconnecter"
                    title="Se deconnecter"
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

        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16">
          <nav className="mb-6 text-sm font-semibold text-[#1a1a2e]/60">
            <Link href="/artisans" className="hover:text-[#1a1a2e]">
              &larr; Retour &agrave; l&apos;annuaire
            </Link>
          </nav>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* COLONNE PRINCIPALE */}
            <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
              {/* Identite */}
              <div className="bd-card p-6">
                <div className="mb-5 flex items-start gap-4">
                  {/* Logo / avatar */}
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[#1a1a2e] bg-white text-4xl shadow-md"
                    aria-hidden="true"
                  >
                    {artisan.logoUrl ? (
                      <img
                        src={artisan.logoUrl}
                        alt={nomAffiche}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: artisanEmoji }} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h1 className="bd-titre text-2xl text-[#1a1a2e] sm:text-3xl">{nomAffiche}</h1>
                      {artisan.siret && (
                        <span className="bd-badge bd-badge-vert shrink-0">&#10003; Pro</span>
                      )}
                    </div>
                    {artisan.raisonSociale && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {artisan.prenom} {artisan.nom}
                      </p>
                    )}
                    {moyenne !== null && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm">
                        <span>
                          {Array.from({ length: 5 }, (_, i) => (
                            <span
                              key={i}
                              className={
                                i < Math.round(moyenne!) ? "text-[#ffd93d]" : "text-gray-300"
                              }
                            >
                              &#9733;
                            </span>
                          ))}
                        </span>
                        <span className="font-bold text-[#1a1a2e]">{moyenne.toFixed(1)}</span>
                        <span className="text-gray-400">({avisValides.length} avis)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-5 flex flex-wrap gap-2">
                  {artisan.metiers.map(({ metier }) => (
                    <span key={metier.id} className="bd-badge bd-badge-jaune text-sm">
                      {metier.label}
                    </span>
                  ))}
                </div>

                <hr className="bd-separator mb-5" />

                {artisan.description && (
                  <div className="mb-5">
                    <h2 className="mb-2 font-black text-[#1a1a2e]">&Agrave; propos</h2>
                    <p className="leading-relaxed text-gray-700">{artisan.description}</p>
                  </div>
                )}

                <div>
                  <h2 className="mb-3 font-black text-[#1a1a2e]">Zone d&apos;intervention</h2>
                  {communeNoms.length > 0 && (
                    <div className="mb-3 overflow-hidden rounded-xl border-2 border-[#1a1a2e]">
                      <CarteZoneLectureWrapper communeNoms={communeNoms} />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {artisan.communes.map(({ commune }) => (
                      <span key={commune.id} className="bd-badge bd-badge-bleu">
                        &#128205; {commune.nom} ({commune.codePostal})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Portfolio photos */}
              {portfolioPhotos.length > 0 && (
                <div className="bd-card p-6">
                  <h2 className="bd-titre mb-4 text-xl text-[#1a1a2e] sm:text-2xl">
                    &#128247; R&eacute;alisations
                  </h2>
                  <PortfolioPhotos photos={portfolioPhotos} artisanNom={nomAffiche} />
                </div>
              )}

              {/* Formulaire de contact */}
              <div id="contact" className="bd-card p-6">
                <h2 className="bd-titre mb-1 text-xl text-[#1a1a2e] sm:text-3xl">
                  Envoyer une demande &agrave; {nomAffiche}
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Votre message sera transmis directement. R&eacute;ponse sous 48h.
                </p>
                <ContactForm artisanId={artisan.id} artisanNom={nomAffiche} />
              </div>

              {/* Avis */}
              <div id="avis" className="grid gap-6 lg:grid-cols-2">
                <div className="bd-card p-6">
                  <h2 className="bd-titre mb-5 text-2xl text-[#1a1a2e]">
                    &#11088; Avis clients ({avisValides.length})
                  </h2>
                  <AvisList avis={avisValides} />
                </div>
                <div className="bd-card p-6">
                  <h2 className="bd-titre mb-2 text-2xl text-[#1a1a2e]">Laisser un avis</h2>
                  <p className="mb-5 text-sm text-gray-500">
                    Vous avez travaill&eacute; avec {nomAffiche} ? Partagez votre exp&eacute;rience.
                  </p>
                  <AvisForm artisanId={artisan.id} artisanNom={nomAffiche} token={avisToken} />
                </div>
              </div>
            </div>

            {/* SIDEBAR CONTACT */}
            <div className="order-1 lg:order-2 lg:col-span-1">
              <div className="bd-card p-5 lg:sticky lg:top-6">
                <h2 className="bd-titre mb-4 text-2xl text-[#1a1a2e]">Coordonn&eacute;es</h2>

                {artisan.telephone && (
                  <a
                    href={`tel:${artisan.telephone.replace(/\s/g, "")}`}
                    className="bd-btn bd-btn-primary mb-3 w-full"
                  >
                    &#128222; {artisan.telephone}
                  </a>
                )}

                {artisan.siteWeb && (
                  <a
                    href={artisan.siteWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bd-btn bd-btn-outline mb-3 w-full text-sm"
                  >
                    &#127760; Visiter le site
                  </a>
                )}

                {artisan.siret && (
                  <p className="mt-3 text-xs text-gray-400">SIRET : {artisan.siret}</p>
                )}

                <div className="mt-4 border-t-2 border-dashed border-gray-200 pt-4">
                  <MessagerieButton artisanId={artisan.id} artisanNom={nomAffiche} />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer minimaliste */}
        <footer className="relative z-10 border-t-2 border-[#1a1a1a]/10 px-6 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between text-xs font-semibold text-[#1a1a2e]/50">
            <span>&copy; 2026 Oyez Artisans !</span>
            <div className="flex gap-4">
              <Link href="/mentions-legales" className="hover:text-[#1a1a2e]">
                Mentions l&eacute;gales
              </Link>
              <Link href="/politique-confidentialite" className="hover:text-[#1a1a2e]">
                Confidentialit&eacute;
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
