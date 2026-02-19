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
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ avisToken?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const artisan = await prisma.artisan.findFirst({
    where: { id, status: "VALIDE", deletedAt: null },
    include: { metiers: { include: { metier: true } } },
  });

  if (!artisan) return { title: "Artisan introuvable" };

  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metiers = artisan.metiers.map((m) => m.metier.label).join(", ");

  return {
    title: `${nom} â€” ${metiers}`,
    description: artisan.description ?? `Fiche artisan de ${nom}`,
  };
}

export default async function FicheArtisanPage({ params, searchParams }: Props) {
  const [{ id }, sp, session] = await Promise.all([params, searchParams, auth()]);
  const avisToken = sp.avisToken;
  const isConnected = !!session?.user;

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
  const moyenne =
    avisValides.length > 0
      ? avisValides.reduce((acc, a) => acc + a.note, 0) / avisValides.length
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#ffd93d]">
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
                  aria-label="Se dÃ©connecter"
                  title="Se dÃ©connecter"
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

      <main className="mx-auto w-full max-w-4xl px-4 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm font-semibold text-[#1a1a2e]/60">
          <Link href="/artisans" className="hover:text-[#1a1a2e]">
            â† Retour Ã  l&apos;annuaire
          </Link>
        </nav>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* COLONNE PRINCIPALE */}
          <div className="order-2 space-y-6 lg:order-1 lg:col-span-2">
            {/* IdentitÃ© */}
            <div className="bd-card p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h1 className="bd-titre text-3xl text-[#1a1a2e] sm:text-4xl">{nomAffiche}</h1>
                  {artisan.raisonSociale && (
                    <p className="mt-1 text-gray-500">
                      {artisan.prenom} {artisan.nom}
                    </p>
                  )}
                  {/* Note rÃ©sumÃ©e */}
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
                            â˜…
                          </span>
                        ))}
                      </span>
                      <span className="font-bold text-[#1a1a2e]">{moyenne.toFixed(1)}</span>
                      <span className="text-gray-400">({avisValides.length} avis)</span>
                    </div>
                  )}
                </div>
                {artisan.siret && <span className="bd-badge bd-badge-vert shrink-0">âœ“ Pro</span>}
              </div>

              {/* MÃ©tiers */}
              <div className="mb-5 flex flex-wrap gap-2">
                {artisan.metiers.map(({ metier }) => (
                  <span key={metier.id} className="bd-badge bd-badge-jaune text-sm">
                    {metier.label}
                  </span>
                ))}
              </div>

              <hr className="bd-separator mb-5" />

              {/* Description */}
              {artisan.description && (
                <div className="mb-5">
                  <h2 className="mb-2 font-black text-[#1a1a2e]">Ã€ propos</h2>
                  <p className="leading-relaxed text-gray-700">{artisan.description}</p>
                </div>
              )}

              {/* Zone d'intervention */}
              <div>
                <h2 className="mb-3 font-black text-[#1a1a2e]">Zone d&apos;intervention</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.communes.map(({ commune }) => (
                    <span key={commune.id} className="bd-badge bd-badge-bleu">
                      ðŸ“ {commune.nom} ({commune.codePostal})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulaire de contact */}
            <div id="contact" className="bd-card p-6">
              <h2 className="bd-titre mb-1 text-xl text-[#1a1a2e] sm:text-3xl">
                Envoyer une demande Ã  {nomAffiche}
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Votre message sera transmis directement. RÃ©ponse sous 48h.
              </p>
              <ContactForm artisanId={artisan.id} artisanNom={nomAffiche} />
            </div>

            {/* Avis */}
            <div id="avis" className="grid gap-6 lg:grid-cols-2">
              <div className="bd-card p-6">
                <h2 className="bd-titre mb-5 text-2xl text-[#1a1a2e]">
                  â­ Avis clients ({avisValides.length})
                </h2>
                <AvisList avis={avisValides} />
              </div>
              <div className="bd-card p-6">
                <h2 className="bd-titre mb-2 text-2xl text-[#1a1a2e]">Laisser un avis</h2>
                <p className="mb-5 text-sm text-gray-500">
                  Vous avez travaillÃ© avec {nomAffiche} ? Partagez votre expÃ©rience.
                </p>
                <AvisForm artisanId={artisan.id} artisanNom={nomAffiche} token={avisToken} />
              </div>
            </div>
          </div>

          {/* SIDEBAR CONTACT */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <div className="bd-card p-5 lg:sticky lg:top-6">
              <h2 className="bd-titre mb-4 text-2xl text-[#1a1a2e]">CoordonnÃ©es</h2>

              {artisan.telephone && (
                <a
                  href={`tel:${artisan.telephone.replace(/\s/g, "")}`}
                  className="bd-btn bd-btn-primary mb-3 w-full"
                >
                  ðŸ“ž {artisan.telephone}
                </a>
              )}

              {artisan.siteWeb && (
                <a
                  href={artisan.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bd-btn bd-btn-outline mb-3 w-full text-sm"
                >
                  ðŸŒ Visiter le site
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
          <span>Â© 2026 Oyez Artisans !</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-[#1a1a2e]">
              Mentions lÃ©gales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-[#1a1a2e]">
              ConfidentialitÃ©
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
