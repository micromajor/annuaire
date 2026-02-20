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
            Oyez Artisans&nbsp;!
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
          <h1 className="bd-titre mb-2 text-3xl text-[#1a1a2e]">Mentions légales</h1>
          <p className="mb-8 text-xs text-gray-400">Dernière mise à jour&nbsp;: février 2026</p>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">1. Éditeur du site</h2>
            <p className="mb-2 text-sm leading-relaxed text-gray-700">
              Le site <strong>oyezartisans.fr</strong> est édité par&nbsp;:
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                <strong>Dénomination&nbsp;:</strong> Oyez Artisans&nbsp;!
              </li>
              <li>
                <strong>Forme juridique&nbsp;:</strong>{" "}
                <span className="rounded bg-orange-100 px-1 text-xs font-semibold text-orange-600">
                  À compléter — EI / SASU / SARL…
                </span>
              </li>
              <li>
                <strong>Directeur de publication&nbsp;:</strong>{" "}
                <span className="rounded bg-orange-100 px-1 text-xs font-semibold text-orange-600">
                  À compléter — NOM Prénom
                </span>
              </li>
              <li>
                <strong>SIRET&nbsp;:</strong>{" "}
                <span className="rounded bg-orange-100 px-1 text-xs font-semibold text-orange-600">
                  À compléter
                </span>
              </li>
              <li>
                <strong>Contact&nbsp;:</strong>{" "}
                <a
                  href="mailto:contact@oyezartisans.fr"
                  className="font-semibold text-[#1a1a2e] underline"
                >
                  contact@oyezartisans.fr
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">2. Hébergement</h2>
            <p className="mb-2 text-sm leading-relaxed text-gray-700">
              Ce site est hébergé par&nbsp;:
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                <strong>Société&nbsp;:</strong> Hetzner Online GmbH
              </li>
              <li>
                <strong>Adresse&nbsp;:</strong> Industriestraße 25, 91710 Gunzenhausen, Allemagne
              </li>
              <li>
                <strong>Site&nbsp;:</strong>{" "}
                <a
                  href="https://www.hetzner.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a1a2e] underline"
                >
                  hetzner.com
                </a>
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-500">
              L&apos;hébergeur est situé dans l&apos;Union Européenne. Les données sont traitées
              dans le respect du RGPD.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">3. Propriété intellectuelle</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Le contenu du site (textes, graphismes, logos) est la propriété d&apos;Oyez
              Artisans&nbsp;! et est protégé par les lois françaises et internationales relatives à
              la propriété intellectuelle. Toute reproduction est interdite sans autorisation. Les
              contenus des fiches artisans leur appartiennent et sont publiés avec leur consentement
              explicite.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">4. Données personnelles</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Les données collectées sur ce site sont traitées conformément au Règlement Général sur
              la Protection des Données (RGPD — Règlement UE 2016/679). Consultez notre{" "}
              <Link
                href="/politique-confidentialite"
                className="font-semibold text-[#1a1a2e] underline"
              >
                politique de confidentialité
              </Link>{" "}
              pour en savoir plus.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">5. Responsabilité</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Oyez Artisans&nbsp;! s&apos;efforce de fournir des informations exactes et à jour,
              mais ne peut garantir l&apos;exactitude ou l&apos;exhaustivité des informations
              diffusées. Les fiches artisans sont soumises à validation manuelle avant mise en
              ligne. Oyez Artisans&nbsp;! n&apos;est pas responsable des prestations réalisées par
              les artisans référencés.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">6. Médiation</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              En cas de litige, contactez-nous en premier lieu à{" "}
              <a
                href="mailto:contact@oyezartisans.fr"
                className="font-semibold text-[#1a1a2e] underline"
              >
                contact@oyezartisans.fr
              </a>
              . À défaut de résolution amiable, les tribunaux français compétents seront saisis.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
