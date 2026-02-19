import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d'Oyez Artisans ! — comment nous protégeons vos données personnelles.",
  robots: { index: false },
};

export default function PolitiqueConfidentialitePage() {
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
          <h1 className="bd-titre mb-6 text-3xl text-[#1a1a2e]">Politique de confidentialité</h1>

          <p className="mb-6 text-sm text-gray-500">Dernière mise à jour&nbsp;: février 2026</p>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">1. Responsable du traitement</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Oyez Artisans ! — contact&nbsp;:
              <a
                href="mailto:contact@oyezartisans.fr"
                className="ml-1 font-semibold text-[#1a1a2e] underline"
              >
                contact@oyezartisans.fr
              </a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">2. Données collectées</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
              <li>
                <strong>Artisans</strong>&nbsp;: nom, prénom, email, téléphone, SIRET, description,
                photos. Utilisés pour créer et afficher leur fiche publique.
              </li>
              <li>
                <strong>Particuliers (demandes de contact)</strong>&nbsp;: nom, prénom, email,
                téléphone, message et photos de chantier. Transmis à l&apos;artisan concerné
                uniquement.
              </li>
              <li>
                <strong>Visiteurs</strong>&nbsp;: aucune donnée personnelle collectée sans action
                explicite de votre part.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">3. Finalités</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
              <li>Mettre en relation particuliers et artisans vérifiés</li>
              <li>Afficher les fiches artisans publiquement (annuaire)</li>
              <li>Permettre la messagerie interne artisan ↔ particulier</li>
              <li>Envoyer des emails de confirmation de demande</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">4. Durée de conservation</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Les données artisan sont conservées tant que le compte est actif + 3 ans après
              suppression. Les demandes de contact sont conservées 2 ans. Les comptes inactifs
              peuvent être supprimés après 3 ans.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">5. Vos droits (RGPD)</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
              portabilité et d&apos;opposition. Pour exercer ces droits&nbsp;:{" "}
              <a
                href="mailto:contact@oyezartisans.fr"
                className="font-semibold text-[#1a1a2e] underline"
              >
                contact@oyezartisans.fr
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">6. Cookies</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Ce site utilise uniquement un cookie de session sécurisé (httpOnly) pour
              l&apos;authentification. Aucun cookie publicitaire ni tracker tiers n&apos;est
              utilisé.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
