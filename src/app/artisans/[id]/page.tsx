export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/features/ContactForm";
import AvisList from "@/components/features/AvisList";
import AvisForm from "@/components/features/AvisForm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
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
    title: `${nom} — ${metiers}`,
    description: artisan.description ?? `Fiche artisan de ${nom}`,
  };
}

export default async function FicheArtisanPage({ params }: Props) {
  const { id } = await params;

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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/artisans" className="hover:text-[#1a1a2e]">
            ← Retour à l&apos;annuaire
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ============================================
              COLONNE PRINCIPALE
              ============================================ */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="bd-card p-6">
              {/* En-tête */}
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h1 className="bd-titre text-3xl text-[#1a1a2e] sm:text-4xl">{nomAffiche}</h1>
                  {artisan.raisonSociale && (
                    <p className="mt-1 text-gray-500">
                      {artisan.prenom} {artisan.nom}
                    </p>
                  )}
                </div>
                {artisan.siret && <span className="bd-badge bd-badge-vert shrink-0">✓ Pro</span>}
              </div>

              {/* Métiers */}
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
                  <h2 className="mb-2 font-black text-[#1a1a2e]">À propos</h2>
                  <p className="leading-relaxed text-gray-700">{artisan.description}</p>
                </div>
              )}

              {/* Zone d'intervention */}
              <div>
                <h2 className="mb-3 font-black text-[#1a1a2e]">Zone d&apos;intervention</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.communes.map(({ commune }) => (
                    <span key={commune.id} className="bd-badge bd-badge-bleu">
                      📍 {commune.nom} ({commune.codePostal})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
              SIDEBAR CONTACT
              ============================================ */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <div className="bd-card p-5">
              <h2 className="bd-titre mb-4 text-2xl text-[#1a1a2e]">Coordonnées</h2>

              {artisan.telephone && (
                <a
                  href={`tel:${artisan.telephone.replace(/\s/g, "")}`}
                  className="bd-btn bd-btn-primary mb-3 w-full"
                >
                  📞 {artisan.telephone}
                </a>
              )}

              {artisan.siteWeb && (
                <a
                  href={artisan.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bd-btn bd-btn-outline mb-3 w-full text-sm"
                >
                  🌐 Visiter le site
                </a>
              )}

              {artisan.siret && (
                <p className="mt-3 text-xs text-gray-400">SIRET : {artisan.siret}</p>
              )}
            </div>
          </div>
        </div>

        {/* ============================================
            FORMULAIRE DE CONTACT
            ============================================ */}
        <div id="contact" className="mt-8">
          <div className="bd-card p-6">
            <h2 className="bd-titre mb-1 text-xl text-[#1a1a2e] sm:text-3xl">
              Envoyer une demande à {nomAffiche}
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Votre message sera transmis directement par email. Réponse sous 48h.
            </p>
            <ContactForm artisanId={artisan.id} artisanNom={nomAffiche} />
          </div>
        </div>

        {/* ============================================
            AVIS CLIENTS
            ============================================ */}
        <div id="avis" className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Liste des avis */}
          <div className="bd-card p-6">
            <h2 className="bd-titre mb-5 text-2xl text-[#1a1a2e]">
              ⭐ Avis clients ({avisValides.length})
            </h2>
            <AvisList avis={avisValides} />
          </div>

          {/* Formulaire d’ajout d’avis */}
          <div className="bd-card p-6">
            <h2 className="bd-titre mb-2 text-2xl text-[#1a1a2e]">Laisser un avis</h2>
            <p className="mb-5 text-sm text-gray-500">
              Vous avez travaillé avec {nomAffiche} ? Partagez votre expérience.
            </p>
            <AvisForm artisanId={artisan.id} artisanNom={nomAffiche} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
