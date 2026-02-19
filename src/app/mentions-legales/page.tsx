import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Oyez Artisans ! — annuaire d'artisans du bâtiment en Loire-Atlantique.",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#ffd93d]">
      <header className="border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="bd-titre text-xl text-[#ffd93d]">
            Oyez Artisans !
          </Link>
          <Link href="/" className="text-sm font-bold text-[#ffd93d]/80 hover:text-[#ffd93d]">
            &larr; Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <div
          className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-8"
          style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
        >
          <h1 className="bd-titre mb-6 text-3xl text-[#1a1a2e]">Mentions légales</h1>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">Éditeur du site</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Le site <strong>oyezartisans.fr</strong> est édité par une entreprise individuelle /
              structure à définir, domiciliée en Loire-Atlantique (44), France.
              <br />
              Contact&nbsp;:{" "}
              <a
                href="mailto:contact@oyezartisans.fr"
                className="font-semibold text-[#1a1a2e] underline"
              >
                contact@oyezartisans.fr
              </a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">Hébergement</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Ce site est hébergé par un prestataire situé dans l&apos;Union Européenne.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">Propriété intellectuelle</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Le contenu du site (textes, graphismes, logos, images) est la propriété d&apos;Oyez
              Artisans ! et est protégé par les lois françaises et internationales relatives à la
              propriété intellectuelle. Toute reproduction est interdite sans autorisation.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">Données personnelles</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Les données collectées sur ce site sont traitées conformément au Règlement Général sur
              la Protection des Données (RGPD). Consultez notre{" "}
              <Link
                href="/politique-confidentialite"
                className="font-semibold text-[#1a1a2e] underline"
              >
                politique de confidentialité
              </Link>{" "}
              pour en savoir plus.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">Responsabilité</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Oyez Artisans ! s&apos;efforce de fournir des informations exactes et à jour, mais ne
              peut garantir l&apos;exactitude, l&apos;exhaustivité ou l&apos;actualité des
              informations diffusées. Les fiches artisans sont soumises à validation manuelle avant
              mise en ligne.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
