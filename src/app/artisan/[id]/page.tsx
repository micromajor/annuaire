export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import ContactForm from "@/components/features/ContactForm";
import AvisList from "@/components/features/AvisList";
import AvisSection from "@/components/features/AvisSection";
import MessagerieButton from "@/components/features/MessagerieButton";
import NavMessagerieIcon from "@/components/features/NavMessagerieIcon";
import CarteZoneLectureWrapper from "@/components/features/CarteZoneLectureWrapper";
import CommunesList from "@/components/features/CommunesList";
import PortfolioPhotos from "@/components/features/PortfolioPhotos";
import ShareButton from "@/components/features/ShareButton";
import SignalementModal from "@/components/features/SignalementModal";
import TrustBadge, { hasFullProfile } from "@/components/features/TrustBadge";
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

function extractSocialHandle(network: string, raw: string): string {
  try {
    const url = raw.trim();
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const path = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    const last = path.split("/").pop() ?? path;
    switch (network) {
      case "instagram":
      case "facebook":
      case "twitterX":
        return `@${last}`;
      case "youtube":
        return last.startsWith("@") ? last : `@${last}`;
      case "linkedin":
        return path.replace(/^(in|company)\//, "").split("/")[0];
      case "whatsapp": {
        const digits = url.replace(/\D/g, "");
        if (digits.startsWith("33") && digits.length >= 11) return `0${digits.slice(2, 12)}`;
        return digits.slice(-10);
      }
      default:
        return url;
    }
  } catch {
    return raw;
  }
}

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
  const rawDescription =
    artisan.description ??
    `Fiche de ${nom}, ${metiers} à ${communes || "Loire-Atlantique"}. Contactez-le directement sur Oyez Artisans !`;
  const description =
    rawDescription.length > 155 ? rawDescription.slice(0, 152) + "…" : rawDescription;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr";
  const url = `${appUrl}/artisan/${id}`;
  // Utilise l'opengraph-image.tsx (nouveau design BD avec icônes officielles)
  const carteUrl = `${appUrl}/artisan/${id}/opengraph-image`;

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
      images: [
        {
          url: carteUrl,
          width: 1200,
          height: 630,
          alt: `Carte de visite de ${nom} — ${metiers}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [carteUrl],
    },
  };
}

export default async function FicheArtisanPage({ params, searchParams }: Props) {
  const [{ id }, sp, session] = await Promise.all([params, searchParams, auth()]);
  const avisToken = sp.avisToken;

  const isConnected = !!session?.user;
  const viewerRole = (session?.user as { role?: string })?.role;
  const viewerId = (session?.user as { id?: string })?.id;
  const isOwnFiche = viewerRole === "artisan" && viewerId === id;

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
        className={`flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-hidden ${viewerRole === "artisan" ? "bg-[#6bcb77]" : viewerRole === "particulier" ? "bg-[#60c5f1]" : "bg-[#ffd93d]"}`}
      >
        {/* Header minimaliste */}
        <header className="relative z-50 flex flex-wrap items-center justify-between gap-2 px-3 py-4 sm:px-6">
          <Link
            href="/"
            className="bd-titre text-xl text-[#1a1a2e] no-underline sm:text-2xl"
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

        <main className="mx-auto w-full max-w-[1500px] px-3 pt-6 pb-16 sm:px-4">
          {isOwnFiche && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-[#1a1a2e] bg-[#1a1a2e] px-4 py-3 text-sm font-bold text-white">
              <span>&#128064;</span>
              <span>Mode pr&eacute;visualisation &mdash; voici ce que voient vos visiteurs.</span>
              <Link
                href="/mon-espace"
                className="ml-auto shrink-0 rounded-lg border-2 border-white/40 px-3 py-1 text-xs hover:bg-white/10"
              >
                &larr; Mon espace
              </Link>
            </div>
          )}
          <nav className="mb-6 text-sm font-semibold text-[#1a1a2e]/60">
            <Link href={isOwnFiche ? "/mon-espace" : "/artisans"} className="hover:text-[#1a1a2e]">
              {isOwnFiche ? "\u2190 Mon espace" : "\u2190 Retour \u00e0 l\u2019annuaire"}
            </Link>
          </nav>

          <div className="grid gap-6 overflow-hidden lg:grid-cols-3">
            {/* COLONNE PRINCIPALE */}
            <div className="order-1 min-w-0 space-y-6 lg:col-span-2">
              {/* Identite */}
              <div className="bd-card p-6">
                <div className="mb-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  {/* Logo / avatar — responsive sur mobile */}
                  <div
                    className="h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-white text-4xl shadow-md sm:h-28 sm:w-44"
                    aria-hidden="true"
                  >
                    {artisan.logoUrl ? (
                      <img
                        src={artisan.logoUrl}
                        alt={nomAffiche}
                        className="h-full w-full rounded-2xl object-contain"
                      />
                    ) : (
                      <span dangerouslySetInnerHTML={{ __html: artisanEmoji }} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-start justify-center gap-2 sm:justify-between">
                      <h1 className="bd-titre text-2xl break-words text-[#1a1a2e] sm:text-3xl">
                        {nomAffiche}
                      </h1>
                      <TrustBadge
                        isVerified={artisan.status === "VALIDE"}
                        hasFullProfile={hasFullProfile(artisan)}
                        avisCount={avisValides.length}
                        averageRating={moyenne ?? 0}
                        size="md"
                      />
                    </div>
                    {artisan.raisonSociale && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {artisan.prenom} {artisan.nom}
                      </p>
                    )}
                    {artisan.accroche && (
                      <p className="mt-1 text-sm font-semibold text-gray-600 italic">
                        {artisan.accroche}
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

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {artisan.metiers.map(({ metier }) => (
                    <span key={metier.id} className="bd-badge bd-badge-jaune text-sm">
                      {metier.label}
                    </span>
                  ))}
                  <ShareButton
                    url={`https://oyezartisans.fr/artisan/${artisan.id}`}
                    title={`${nomAffiche} — ${artisan.metiers.map((m) => m.metier.label).join(", ")} à ${communeNoms[0] ?? "Loire-Atlantique"}`}
                    text={`Découvrez la fiche de ${nomAffiche} sur Oyez Artisans !`}
                  />
                </div>

                <hr className="bd-separator mb-5" />

                {artisan.description && (
                  <div className="mb-5">
                    <h2 className="mb-2 font-black text-[#1a1a2e]">&Agrave; propos</h2>
                    <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                      {artisan.description}
                    </p>
                  </div>
                )}

                <div>
                  <h2 className="mb-3 font-black text-[#1a1a2e]">Zone d&apos;intervention</h2>
                  {communeNoms.length > 0 && (
                    <div className="mb-3 overflow-hidden rounded-xl border-2 border-[#1a1a2e]">
                      <CarteZoneLectureWrapper communeNoms={communeNoms} />
                    </div>
                  )}
                  <CommunesList
                    communes={artisan.communes.map(({ commune }) => ({
                      id: commune.id,
                      nom: commune.nom,
                      codePostal: commune.codePostal,
                    }))}
                  />
                </div>

                {/* SIRET — info légale discrète */}
                {artisan.siret && (
                  <p className="mt-4 border-t border-dashed border-gray-200 pt-3 text-xs text-gray-400">
                    SIRET&nbsp;: {artisan.siret}
                  </p>
                )}
              </div>

              {/* Réalisations — mis en valeur avant le formulaire */}
              {portfolioPhotos.length > 0 && (
                <div className="bd-card p-6">
                  <h2 className="bd-titre mb-4 text-xl text-[#1a1a2e] sm:text-2xl">
                    &#128247; R&eacute;alisations
                  </h2>
                  <PortfolioPhotos photos={portfolioPhotos} artisanNom={nomAffiche} />
                </div>
              )}

              {/* Formulaire de contact — réservé aux particuliers connectés */}
              <div id="contact" className="bd-card p-6">
                {isConnected && viewerRole === "particulier" ? (
                  <>
                    <h2 className="bd-titre mb-1 text-xl text-[#1a1a2e] sm:text-3xl">
                      Envoyer une demande &agrave; {nomAffiche}
                    </h2>
                    <p className="mb-4 text-sm text-gray-500">
                      D&eacute;crivez votre projet, joignez des photos et suivez la r&eacute;ponse
                      directement ici.
                    </p>
                    <ContactForm artisanId={artisan.id} artisanNom={nomAffiche} />
                  </>
                ) : (
                  <>
                    <h2 className="bd-titre mb-3 text-xl text-[#1a1a2e] sm:text-2xl">
                      Contacter {nomAffiche}
                    </h2>
                    <p className="mb-5 text-sm text-gray-600">
                      Cr&eacute;ez votre compte gratuit pour envoyer votre demande, joindre des
                      photos et suivre vos &eacute;changes directement sur la plateforme — sans
                      passer par email.
                    </p>
                    <a
                      href={`/connexion?callbackUrl=/artisan/${artisan.id}&context=contact`}
                      className="bd-btn bd-btn-primary mb-3 w-full text-center !whitespace-normal"
                    >
                      &#128172; Cr&eacute;er mon compte et contacter {nomAffiche}
                    </a>
                    <p className="text-center text-xs text-gray-400">
                      D&eacute;j&agrave; un compte&nbsp;?{" "}
                      <a
                        href={`/connexion?callbackUrl=/artisan/${artisan.id}&context=contact`}
                        className="font-bold text-[#1a1a2e] hover:underline"
                      >
                        Se connecter
                      </a>
                    </p>
                  </>
                )}
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
                  <AvisSection artisanId={artisan.id} artisanNom={nomAffiche} token={avisToken} />
                </div>
              </div>
            </div>

            {/* SIDEBAR CONTACT */}
            <div className="order-2 min-w-0 lg:col-span-1">
              <div className="bd-card p-5 lg:sticky lg:top-6">
                <h2 className="bd-titre mb-4 text-2xl text-[#1a1a2e]">Coordonn&eacute;es</h2>

                {/* 1. Chat plateforme — CTA principal */}
                <MessagerieButton artisanId={artisan.id} artisanNom={nomAffiche} />

                {/* 2. Formulaire de demande — CTA secondaire */}
                <a href="#contact" className="bd-btn bd-btn-outline mt-2 w-full text-sm">
                  &#128203; Envoyer une demande
                </a>

                {/* 3. Contacts directs */}
                {(artisan.telephone || artisan.siteWeb) && (
                  <div className="mt-4 flex flex-col gap-2 border-t-2 border-dashed border-gray-200 pt-4">
                    {artisan.telephone && (
                      <a
                        href={`tel:${artisan.telephone.replace(/\s/g, "")}`}
                        className="bd-btn bd-btn-primary w-full"
                      >
                        &#128222; {artisan.telephone}
                      </a>
                    )}
                    {artisan.siteWeb && (
                      <a
                        href={artisan.siteWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bd-btn bd-btn-outline w-full text-sm"
                      >
                        &#127760; Visiter le site
                      </a>
                    )}
                  </div>
                )}

                {/* Réseaux sociaux */}
                {(artisan.instagram ||
                  artisan.facebook ||
                  artisan.youtube ||
                  artisan.linkedin ||
                  artisan.twitterX ||
                  artisan.whatsapp) && (
                  <div className="mt-4 border-t-2 border-dashed border-gray-200 pt-4">
                    <h3 className="mb-3 text-xs font-black tracking-wider text-gray-400 uppercase">
                      R&eacute;seaux sociaux
                    </h3>
                    <div className="flex flex-col gap-1">
                      {artisan.instagram && (
                        <a
                          href={artisan.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/social/instagram.svg"
                            alt="Instagram"
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="truncate">
                            {extractSocialHandle("instagram", artisan.instagram)}
                          </span>
                        </a>
                      )}
                      {artisan.facebook && (
                        <a
                          href={artisan.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/social/facebook.svg"
                            alt="Facebook"
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="truncate">
                            {extractSocialHandle("facebook", artisan.facebook)}
                          </span>
                        </a>
                      )}
                      {artisan.youtube && (
                        <a
                          href={artisan.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/social/youtube.svg"
                            alt="YouTube"
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="truncate">
                            {extractSocialHandle("youtube", artisan.youtube)}
                          </span>
                        </a>
                      )}
                      {artisan.linkedin && (
                        <a
                          href={artisan.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/social/linkedin.svg"
                            alt="LinkedIn"
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="truncate">
                            {extractSocialHandle("linkedin", artisan.linkedin)}
                          </span>
                        </a>
                      )}
                      {artisan.twitterX && (
                        <a
                          href={artisan.twitterX}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/social/x.svg" alt="X" className="h-6 w-6 shrink-0" />
                          <span className="truncate">
                            {extractSocialHandle("twitterX", artisan.twitterX)}
                          </span>
                        </a>
                      )}
                      {artisan.whatsapp && (
                        <a
                          href={`https://wa.me/${artisan.whatsapp.replace(/\D/g, "").replace(/^0/, "33")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/social/whatsapp.svg"
                            alt="WhatsApp"
                            className="h-6 w-6 shrink-0"
                          />
                          <span className="truncate">
                            {extractSocialHandle("whatsapp", artisan.whatsapp)}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer minimaliste */}
        <footer className="relative z-10 border-t-2 border-[#1a1a1a]/10 px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-2 text-xs font-semibold text-[#1a1a2e]/50 sm:flex-row sm:justify-between">
            <span>&copy; 2026 Oyez Artisans !</span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <SignalementModal artisanId={artisan.id} nomArtisan={nomAffiche} />
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
