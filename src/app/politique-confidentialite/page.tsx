import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité d'Oyez Artisans ! — comment nous protégeons vos données personnelles.",
  robots: { index: false },
};

export default async function PolitiqueConfidentialitePage() {
  const session = await auth();
  const viewerRole = (session?.user as { role?: string })?.role;
  return (
    <div
      className={`min-h-screen ${viewerRole === "artisan" ? "bg-[#6bcb77]" : viewerRole === "particulier" ? "bg-[#60c5f1]" : "bg-[#ffd93d]"}`}
    >
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
          <h1 className="bd-titre mb-2 text-3xl text-[#1a1a2e]">
            Politique de confidentialit&eacute;
          </h1>
          <p className="mb-8 text-xs text-gray-400">
            Derni&egrave;re mise &agrave; jour&nbsp;: f&eacute;vrier 2026
          </p>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">1. Responsable du traitement</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Oyez Artisans&nbsp;! &mdash; Contact&nbsp;:{" "}
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
              2. Donn&eacute;es collect&eacute;es et finalit&eacute;s
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#ffd93d]/30">
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Qui
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Donn&eacute;es
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Finalit&eacute;
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Base l&eacute;gale RGPD
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="border border-gray-200 p-2 font-semibold">Artisan</td>
                    <td className="border border-gray-200 p-2">
                      Nom, pr&eacute;nom, email, t&eacute;l., SIRET, description, photos, logo
                    </td>
                    <td className="border border-gray-200 p-2">
                      Affichage fiche publique, mise en relation
                    </td>
                    <td className="border border-gray-200 p-2">
                      Art.&nbsp;6.1.b &mdash; Ex&eacute;cution du contrat (CGU)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 p-2 font-semibold">
                      Particulier (contact)
                    </td>
                    <td className="border border-gray-200 p-2">
                      Nom, pr&eacute;nom, email, t&eacute;l., message, photos chantier
                    </td>
                    <td className="border border-gray-200 p-2">
                      Transmission &agrave; l&apos;artisan concern&eacute; uniquement
                    </td>
                    <td className="border border-gray-200 p-2">
                      Art.&nbsp;6.1.a &mdash; Consentement explicite
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-semibold">Visiteur</td>
                    <td className="border border-gray-200 p-2">
                      Aucune donn&eacute;e sans action explicite
                    </td>
                    <td className="border border-gray-200 p-2">&mdash;</td>
                    <td className="border border-gray-200 p-2">&mdash;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">
              3. Dur&eacute;e de conservation
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-700">
              <li>
                Donn&eacute;es artisan&nbsp;: conserv&eacute;es tant que le compte est actif, puis
                3&nbsp;ans apr&egrave;s suppression (obligations l&eacute;gales).
              </li>
              <li>Demandes de contact&nbsp;: 2&nbsp;ans &agrave; compter de la demande.</li>
              <li>
                Comptes inactifs&nbsp;: susceptibles d&apos;&ecirc;tre supprim&eacute;s apr&egrave;s
                3&nbsp;ans sans connexion, apr&egrave;s notification pr&eacute;alable.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">
              4. Sous-traitants et destinataires
            </h2>
            <p className="mb-3 text-sm text-gray-700">
              Vos donn&eacute;es ne sont jamais vendues ni c&eacute;d&eacute;es &agrave; des tiers
              &agrave; des fins commerciales. Elles peuvent &ecirc;tre transmises aux prestataires
              suivants dans le strict cadre de leur mission&nbsp;:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#ffd93d]/30">
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      Prestataire
                    </th>
                    <th className="border border-gray-200 p-2 text-left font-black text-[#1a1a2e]">
                      R&ocirc;le
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
                      H&eacute;bergement serveur et base de donn&eacute;es
                    </td>
                    <td className="border border-gray-200 p-2">
                      Allemagne &#127465;&#127466; (UE)
                    </td>
                    <td className="border border-gray-200 p-2">RGPD natif</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 p-2 font-semibold">Resend Inc.</td>
                    <td className="border border-gray-200 p-2">
                      Envoi d&apos;emails transactionnels (confirmations de demande)
                    </td>
                    <td className="border border-gray-200 p-2">
                      &Eacute;tats-Unis &#127482;&#127480;
                    </td>
                    <td className="border border-gray-200 p-2">
                      Clauses contractuelles types UE (SCC)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 p-2 font-semibold">Google LLC</td>
                    <td className="border border-gray-200 p-2">
                      Mesure d&apos;audience (Google Analytics 4) &mdash; uniquement apr&egrave;s
                      consentement
                    </td>
                    <td className="border border-gray-200 p-2">
                      &Eacute;tats-Unis &#127482;&#127480;
                    </td>
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
              Conform&eacute;ment au RGPD, vous disposez des droits suivants&nbsp;:
            </p>
            <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
              <li>
                <strong>Acc&egrave;s</strong>&nbsp;&mdash; obtenir une copie de vos donn&eacute;es.
              </li>
              <li>
                <strong>Rectification</strong>&nbsp;&mdash; corriger des donn&eacute;es inexactes
                depuis{" "}
                <Link href="/mon-espace" className="font-semibold text-[#1a1a2e] underline">
                  Mon espace
                </Link>
                .
              </li>
              <li>
                <strong>Effacement (droit &agrave; l&apos;oubli)</strong>&nbsp;&mdash; supprimer
                votre compte directement depuis{" "}
                <Link href="/mon-espace" className="font-semibold text-[#1a1a2e] underline">
                  Mon espace
                </Link>{" "}
                (section &laquo;&nbsp;Zone dangereuse&nbsp;&raquo;) ou par email.
              </li>
              <li>
                <strong>Portabilit&eacute;</strong>&nbsp;&mdash; recevoir vos donn&eacute;es dans un
                format lisible.
              </li>
              <li>
                <strong>Opposition &amp; limitation</strong>&nbsp;&mdash; vous opposer &agrave;
                certains traitements.
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
              . R&eacute;ponse sous 30&nbsp;jours.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">
              6. Droit de r&eacute;clamation (CNIL)
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              Si vous estimez que vos droits ne sont pas respect&eacute;s, vous pouvez introduire
              une r&eacute;clamation aupr&egrave;s de la{" "}
              <a
                href="https://www.cnil.fr/fr/plaintes"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1a1a2e] underline"
              >
                CNIL &mdash; Commission Nationale de l&apos;Informatique et des Libert&eacute;s
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-black text-[#1a1a2e]">7. Cookies</h2>
            <p className="mb-2 text-sm leading-relaxed text-gray-700">
              Ce site utilise un <strong>cookie de session s&eacute;curis&eacute;</strong>{" "}
              (httpOnly, Secure, SameSite=Lax) strictement n&eacute;cessaire &agrave;
              l&apos;authentification &mdash; aucun consentement requis pour celui-ci.
            </p>
            <p className="text-sm leading-relaxed text-gray-700">
              En option, avec votre accord explicite via le bandeau affich&eacute; lors de votre
              premi&egrave;re visite, nous utilisons <strong>Google Analytics 4</strong> pour
              mesurer l&apos;audience du site (pages vues, provenance des visites). Vous pouvez
              refuser ou retirer votre consentement &agrave; tout moment en vidant le localStorage
              de votre navigateur. Aucun cookie publicitaire ni aucun tracker de remarketing
              n&apos;est utilis&eacute;.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
