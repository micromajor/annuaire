import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialitÃ©",
  description:
    "Politique de confidentialitÃ© d'Oyez Artisans ! â€” comment nous protÃ©geons vos donnÃ©es personnelles.",
  robots: { index: false },
};

export default function PolitiqueConfidentialitePage() {
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
          <h1 className="bd-titre mb-2 text-3xl text-[#1a1a2e]">Politique de confidentialitÃ©</h1>
          <p className="mb-8 text-xs text-gray-400">DerniÃ¨re mise Ã  jour&nbsp;: fÃ©vrier 2026</p>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">1. Responsable du traitement</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Oyez Artisans&nbsp;!{" "}
              <span className="rounded bg-orange-100 px-1 text-xs font-semibold text-orange-600">
                [Forme juridique + NOM PrÃ©nom â€” Ã  complÃ©ter]
              </span>
              {" â€” "}Contact&nbsp;:{" "}
              <a
                href="mailto:contact@oyezartisans.fr"
                className="font-semibold text-[#1a1a2e] underline"
              >
                contact@oyezartisans.fr
              </a>
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">
              2. DonnÃ©es collectÃ©es et finalitÃ©s
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#ffd93d]/30">
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Qui
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      DonnÃ©es
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      FinalitÃ©
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Base lÃ©gale RGPD
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-200 p-2 font-semibold">Artisan</td>
                    <td className="border border-gray-200 p-2">
                      Nom, prÃ©nom, email, tÃ©l., SIRET, description, photos, logo
                    </td>
                    <td className="border border-gray-200 p-2">
                      Affichage fiche publique, mise en relation
                    </td>
                    <td className="border border-gray-200 p-2">
                      Art.&nbsp;6.1.b â€” ExÃ©cution du contrat (CGU)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 p-2 font-semibold">
                      Particulier (contact)
                    </td>
                    <td className="border border-gray-200 p-2">
                      Nom, prÃ©nom, email, tÃ©l., message, photos chantier
                    </td>
                    <td className="border border-gray-200 p-2">
                      Transmission Ã  l&apos;artisan concernÃ© uniquement
                    </td>
                    <td className="border border-gray-200 p-2">
                      Art.&nbsp;6.1.a â€” Consentement explicite
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-semibold">Visiteur</td>
                    <td className="border border-gray-200 p-2">
                      Aucune donnÃ©e sans action explicite
                    </td>
                    <td className="border border-gray-200 p-2">â€”</td>
                    <td className="border border-gray-200 p-2">â€”</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">3. DurÃ©e de conservation</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
              <li>
                DonnÃ©es artisan&nbsp;: conservÃ©es tant que le compte est actif, puis 3&nbsp;ans
                aprÃ¨s suppression (obligations lÃ©gales).
              </li>
              <li>Demandes de contact&nbsp;: 2&nbsp;ans Ã  compter de la demande.</li>
              <li>
                Comptes inactifs&nbsp;: susceptibles d&apos;Ãªtre supprimÃ©s aprÃ¨s 3&nbsp;ans sans
                connexion, aprÃ¨s notification prÃ©alable.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">
              4. Sous-traitants et destinataires
            </h2>
            <p className="mb-3 text-sm text-gray-700">
              Vos donnÃ©es ne sont jamais vendues ni cÃ©dÃ©es Ã  des tiers Ã  des fins commerciales.
              Elles peuvent Ãªtre transmises aux prestataires suivants dans le strict cadre de leur
              mission&nbsp;:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#ffd93d]/30">
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Prestataire
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      RÃ´le
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Pays
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Garantie
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-200 p-2 font-semibold">
                      Hetzner Online GmbH
                    </td>
                    <td className="border border-gray-200 p-2">
                      HÃ©bergement serveur et base de donnÃ©es
                    </td>
                    <td className="border border-gray-200 p-2">Allemagne ðŸ‡©ðŸ‡ª (UE)</td>
                    <td className="border border-gray-200 p-2">RGPD natif</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 p-2 font-semibold">Resend Inc.</td>
                    <td className="border border-gray-200 p-2">
                      Envoi d&apos;emails transactionnels (confirmations de demande)
                    </td>
                    <td className="border border-gray-200 p-2">Ã‰tats-Unis ðŸ‡ºðŸ‡¸</td>
                    <td className="border border-gray-200 p-2">
                      Clauses contractuelles types UE (SCC)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">5. Vos droits (RGPD)</h2>
            <p className="mb-2 text-sm text-gray-700">
              ConformÃ©ment au RGPD, vous disposez des droits suivants&nbsp;:
            </p>
            <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
              <li>
                <strong>AccÃ¨s</strong>&nbsp;â€” obtenir une copie de vos donnÃ©es.
              </li>
              <li>
                <strong>Rectification</strong>&nbsp;â€” corriger des donnÃ©es inexactes depuis{" "}
                <Link href="/mon-espace" className="font-semibold text-[#1a1a2e] underline">
                  Mon espace
                </Link>
                .
              </li>
              <li>
                <strong>Effacement (droit Ã  l&apos;oubli)</strong>&nbsp;â€” supprimer votre compte
                directement depuis{" "}
                <Link href="/mon-espace" className="font-semibold text-[#1a1a2e] underline">
                  Mon espace
                </Link>{" "}
                (section &laquo;&nbsp;Zone dangereuse&nbsp;&raquo;) ou par email.
              </li>
              <li>
                <strong>PortabilitÃ©</strong>&nbsp;â€” recevoir vos donnÃ©es dans un format lisible.
              </li>
              <li>
                <strong>Opposition &amp; limitation</strong>&nbsp;â€” vous opposer Ã  certains
                traitements.
              </li>
            </ul>
            <p className="text-sm text-gray-700">
              Pour exercer ces droits ou pour toute question&nbsp;:{" "}
              <a
                href="mailto:contact@oyezartisans.fr"
                className="font-semibold text-[#1a1a2e] underline"
              >
                contact@oyezartisans.fr
              </a>
              . RÃ©ponse sous 30&nbsp;jours.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">
              6. Droit de rÃ©clamation (CNIL)
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Si vous estimez que vos droits ne sont pas respectÃ©s, vous pouvez introduire une
              rÃ©clamation auprÃ¨s de la{" "}
              <a
                href="https://www.cnil.fr/fr/plaintes"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1a1a2e] underline"
              >
                CNIL â€” Commission Nationale de l&apos;Informatique et des LibertÃ©s
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">7. Cookies</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Ce site utilise <strong>uniquement un cookie de session sÃ©curisÃ©</strong> (httpOnly,
              Secure, SameSite=Lax) pour l&apos;authentification. Aucun cookie publicitaire, aucun
              tracker tiers, aucun outil d&apos;analyse externe n&apos;est utilisÃ©. Aucun bandeau
              de consentement cookie n&apos;est requis.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
