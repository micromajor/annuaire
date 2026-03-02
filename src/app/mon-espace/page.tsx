export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { signOutAction } from "@/app/actions";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import AutoSignOut from "@/components/ui/AutoSignOut";
import Link from "next/link";
import MonEspaceEditForm from "@/components/features/MonEspaceEditForm";
import ShareButton from "@/components/features/ShareButton";
import SocialPreviewButton from "@/components/features/SocialPreviewButton";
import PortfolioUploader from "@/components/features/PortfolioUploader";
import DangerZone from "@/components/features/DangerZone";
import CarteZoneLectureWrapper from "@/components/features/CarteZoneLectureWrapper";
import NavMessagerieIcon from "@/components/features/NavMessagerieIcon";
import ResendConfirmationButton from "@/components/features/ResendConfirmationButton";
import TutorialGuide from "@/components/features/TutorialGuide";

export default async function MonEspacePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string>>;
}) {
  const session = await auth();
  const params = await searchParams;
  const emailVerfied = params?.verified === "1";

  const role = (session?.user as { role?: string })?.role;

  if (!session || !["artisan", "particulier"].includes(role ?? "")) {
    redirect("/connexion");
  }

  // Note : le flag needsSetup n'est plus bloquant ici.
  // Un artisan sans métiers accède directement à mon-espace pour remplir son profil.
  // /bienvenue est réservé aux comptes sans rôle encore défini.

  const userId = (session.user as { id?: string }).id!;

  /* ------------------------------------------------------------------ */
  /* Vue particulier                                                       */
  /* ------------------------------------------------------------------ */
  if (role === "particulier") {
    const particulier = await prisma.artisan.findUnique({
      where: { id: userId },
      select: { prenom: true },
    });
    const besoins = await prisma.besoin.findMany({
      where: { artisanId: userId },
      orderBy: { createdAt: "desc" },
    });

    // Messages non lus (artisan → particulier)
    const messagesNonLus = await prisma.message.count({
      where: {
        conversation: { particulierId: userId },
        expediteur: "artisan",
        lu: false,
      },
    });

    return (
      <div className="min-h-screen bg-[#60c5f1]">
        <header className="relative z-50 flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="bd-titre text-2xl text-[#1a1a2e] no-underline"
            style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}
          >
            Oyez Artisans !
          </Link>
          <nav className="flex items-center gap-3">
            <NavMessagerieIcon />
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                title="Se déconnecter"
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
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          {/* Titre + CTA */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="bd-titre text-4xl text-[#1a1a2e]">
                Bonjour, {particulier?.prenom ?? "vous"} 👋
              </h1>
              <p className="mt-1 text-sm font-semibold text-[#1a1a2e]/60">
                Retrouvez ici vos annonces et vos échanges avec les artisans.
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 rounded-2xl border-4 border-[#1a1a1a] bg-[#ffd93d] px-5 py-3 text-sm font-black text-[#1a1a2e] transition-transform hover:-translate-y-0.5"
              style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
            >
              + Déposer une annonce
            </Link>
          </div>

          {/* Grid 2 colonnes */}
          <div className="mon-espace-grid-sm">
            {/* Colonne principale : annonces */}
            <div>
              <h2 className="bd-titre mb-3 text-xl text-[#1a1a2e]">Mes annonces</h2>
              <div data-tuto="besoins-list">
                {besoins.length === 0 ? (
                  <div
                    className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-8 text-center"
                    style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
                  >
                    <p className="mb-2 text-3xl">📋</p>
                    <p className="font-bold text-[#1a1a2e]/60">
                      Aucune annonce publiée pour l&apos;instant.
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                      Utilisez le bouton <strong>+ Déposer une annonce</strong> en haut de page.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {besoins.map((b) => {
                      const statutLabel: Record<string, string> = {
                        NOUVEAU: "📬 En attente de réponse",
                        LU: "👀 Vu par un artisan",
                        ACCEPTE: "✅ Artisan trouvé !",
                        FERME: "🔒 Clôturé",
                      };
                      const statutColor: Record<string, string> = {
                        NOUVEAU: "#ffd93d",
                        LU: "#60c5f1",
                        ACCEPTE: "#6bcb77",
                        FERME: "#e5e7eb",
                      };
                      return (
                        <div
                          key={b.id}
                          className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-5"
                          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-black text-[#1a1a2e]">
                                {b.metierSlug} · {b.commune}
                              </p>
                              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {b.description}
                              </p>
                            </div>
                            <span
                              className="shrink-0 rounded-full px-3 py-1 text-xs font-black text-[#1a1a2e]"
                              style={{
                                background: statutColor[b.status] ?? "#e5e7eb",
                                border: "2px solid #1a1a1a",
                              }}
                            >
                              {statutLabel[b.status] ?? b.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-400">
                            Publiée le{" "}
                            {b.createdAt.toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar : messages + liens + danger */}
            <div className="flex flex-col gap-4">
              {/* Messages */}
              <Link
                data-tuto="messages-particulier"
                href="/messages"
                className="flex items-center justify-between rounded-2xl border-4 border-[#1a1a1a] bg-white px-5 py-4 transition-transform hover:-translate-y-0.5"
                style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
              >
                <div>
                  <p className="font-black text-[#1a1a2e]">💬 Mes messages</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {messagesNonLus > 0
                      ? `${messagesNonLus} non lu${messagesNonLus > 1 ? "s" : ""}`
                      : "Aucun message non lu"}
                  </p>
                </div>
                {messagesNonLus > 0 && (
                  <span
                    className="rounded-full bg-[#ff6b6b] px-2.5 py-0.5 text-xs font-black text-white"
                    style={{ border: "2px solid #1a1a1a" }}
                  >
                    {messagesNonLus}
                  </span>
                )}
              </Link>

              {/* Liens rapides */}
              <div
                className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-4"
                style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
              >
                <p className="mb-3 text-xs font-black tracking-wide text-gray-400 uppercase">
                  Besoin d&apos;un artisan ?
                </p>
                <Link
                  href="/artisans"
                  className="flex items-center gap-2 rounded-xl border-2 border-[#1a1a1a] bg-[#fff8f0] px-3 py-2 text-sm font-bold text-[#1a1a2e] transition-colors hover:bg-[#ffd93d]"
                >
                  🔍 Voir l&apos;annuaire
                </Link>
              </div>

              {/* Danger */}
              <DangerZone />
            </div>
          </div>

          <TutorialGuide role="particulier" prenom={particulier?.prenom} />
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Vue artisan (suite)                                                   */
  /* ------------------------------------------------------------------ */
  const artisanId = userId;
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    include: {
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
      avis: { where: { status: "VALIDE" }, orderBy: { createdAt: "desc" }, take: 5 },
      contacts: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!artisan) {
    return <AutoSignOut />;
  }

  const allMetiers = await prisma.metier.findMany({
    orderBy: { label: "asc" },
    select: { id: true, slug: true, label: true, categorie: true },
  });

  // Messages non lus (particulier → artisan)
  const messagesNonLusArtisan = await prisma.message.count({
    where: {
      conversation: { artisanId: userId },
      expediteur: "particulier",
      lu: false,
    },
  });

  const moyenneAvis =
    artisan.avis.length > 0
      ? artisan.avis.reduce((s: number, a: { note: number }) => s + a.note, 0) / artisan.avis.length
      : null;

  // Fiche vide = pas encore de métier (indépendant du statut)
  const ficheVide = artisan.metiers.length === 0;

  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metierLabels = artisan.metiers.map((m: { metier: { label: string } }) => m.metier.label);
  const communeNoms = artisan.communes.map((c: { commune: { nom: string } }) => c.commune.nom);
  const communePairs = artisan.communes.map(
    (c: { commune: { nom: string; codePostal: string } }) => ({
      nom: c.commune.nom,
      codePostal: c.commune.codePostal,
    })
  );

  const statusLabel: Record<string, string> = {
    EN_ATTENTE: ficheVide ? "⚙️ Profil à compléter" : "� Email de vérification envoyé",
    VALIDE: ficheVide ? "⚙️ Profil à compléter" : "✅ Fiche en ligne",
    REJETE: "❌ Fiche rejetée — corrigez et renvoyez",
  };
  const statusColor: Record<string, string> = {
    EN_ATTENTE: ficheVide ? "bg-gray-200 text-gray-600" : "bg-[#ffd93d] text-[#1a1a2e]",
    VALIDE: ficheVide ? "bg-gray-200 text-gray-600" : "bg-[#6bcb77] text-white",
    REJETE: "bg-[#ff6b6b] text-white",
  };

  return (
    <div className="min-h-screen bg-[#6bcb77]">
      {/* Header artisan */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="bd-titre text-2xl text-[#1a1a2e] no-underline"
          style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}
        >
          Oyez Artisans !
        </Link>
        <nav className="flex items-center gap-3">
          <NavMessagerieIcon />
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Se déconnecter"
              title="Se déconnecter"
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
        </nav>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-10">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="bd-titre text-4xl text-[#1a1a2e]">
            {artisan.prenom ? `Bonjour, ${artisan.prenom} 👋` : "Mon espace artisan"}
          </h1>
          <span
            className={`mt-2 inline-block rounded-full px-4 py-1.5 text-sm font-black ${statusColor[artisan.status]}`}
            style={{ border: "2px solid #1a1a1a" }}
          >
            {statusLabel[artisan.status]}
          </span>
        </div>

        {/* Banner succès vérification email */}
        {emailVerfied && (
          <div
            className="mb-6 rounded-2xl border-4 border-[#6bcb77] bg-[#f0fff4] p-4"
            style={{ boxShadow: "4px 4px 0 #6bcb77" }}
          >
            <p className="bd-titre text-lg text-[#166534]">
              🎉 Email confirmé — votre fiche est en ligne !
            </p>
            <p className="mt-1 text-sm text-[#166534]">
              Votre fiche est maintenant visible par tous les visiteurs.
            </p>
          </div>
        )}

        {/* Carte de vérification email : visible uniquement pour artisans email/password EN_ATTENTE avec fiche complète */}
        {artisan.status === "EN_ATTENTE" && !ficheVide && !!artisan.passwordHash && (
          <div className="mb-6">
            <ResendConfirmationButton email={artisan.email} />
          </div>
        )}

        {/* Grid 2 colonnes : formulaire principal | sidebar */}
        <div className="mon-espace-grid">
          {/* ── Colonne principale : formulaire + demandes ── */}
          <div className="flex min-w-0 flex-col gap-6">
            <MonEspaceEditForm
              metiers={allMetiers}
              artisan={{
                prenom: artisan.prenom,
                nom: artisan.nom,
                raisonSociale: artisan.raisonSociale,
                telephone: artisan.telephone,
                siret: artisan.siret,
                siteWeb: artisan.siteWeb,
                description: artisan.description,
                accroche: artisan.accroche,
                instagram: artisan.instagram,
                facebook: artisan.facebook,
                youtube: artisan.youtube,
                linkedin: artisan.linkedin,
                twitterX: artisan.twitterX,
                whatsapp: artisan.whatsapp,
                logoUrl: artisan.logoUrl,
                metierSlugs: artisan.metiers.map(
                  (m: { metier: { slug: string } }) => m.metier.slug
                ),
                communePairs,
                status: artisan.status,
              }}
            />

            {/* Demandes de contact reçues */}
            <div
              className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-6"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
            >
              <h2 className="bd-titre mb-3 text-xl text-[#1a1a2e]">Dernières demandes reçues</h2>
              {artisan.contacts.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune demande pour l&apos;instant.</p>
              ) : (
                <ul className="space-y-3">
                  {artisan.contacts.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 text-sm"
                    >
                      {/* En-tête : nom + date */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="font-black text-[#1a1a2e]">
                          {c.clientPrenom} {c.clientNom}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Type de travaux */}
                      <span className="mb-2 inline-block rounded-full border-2 border-[#1a1a2e] bg-[#ffd93d] px-2 py-0.5 text-xs font-bold text-[#1a1a2e]">
                        {c.typeTraux}
                      </span>

                      {/* Message */}
                      <p className="mb-3 text-gray-700">{c.message}</p>

                      {/* Photos jointes */}
                      {Array.isArray(c.photos) && c.photos.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {(c.photos as string[]).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Photo ${i + 1}`}
                                className="h-16 w-16 rounded-lg border-2 border-gray-200 object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Coordonnées + actions */}
                      <div className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-gray-200 pt-3">
                        <a
                          href={`mailto:${c.clientEmail}?subject=Suite à votre demande — ${c.typeTraux}&body=Bonjour ${c.clientPrenom},%0A%0A`}
                          className="bd-btn bd-btn-primary flex items-center gap-1.5 text-xs"
                        >
                          ✉ Répondre par email
                        </a>
                        {c.clientTel && (
                          <a
                            href={`tel:${c.clientTel.replace(/\s/g, "")}`}
                            className="bd-btn bd-btn-outline flex items-center gap-1.5 text-xs"
                          >
                            📞 {c.clientTel}
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ── Sidebar : aperçu fiche + actions + stats ── */}
          <div className="flex flex-col gap-5">
            {/* Aperçu de la fiche publique */}
            {artisan.prenom && (
              <div
                data-tuto="fiche-card"
                className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-5"
                style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
              >
                <h2 className="bd-titre mb-3 text-xl text-[#1a1a2e]">Ma fiche</h2>

                {/* Logo + identité */}
                <div className="mb-3 flex items-center gap-3">
                  {artisan.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artisan.logoUrl}
                      alt="Logo"
                      className="h-16 w-16 shrink-0 rounded-xl object-contain"
                      style={{ border: "3px solid #1a1a1a" }}
                    />
                  ) : (
                    <div
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#fff8f0] text-xl"
                      style={{ border: "3px solid #1a1a1a" }}
                    >
                      🔨
                    </div>
                  )}
                  <div>
                    <p className="font-black text-[#1a1a2e]">{nomAffiche}</p>
                    {artisan.raisonSociale && (
                      <p className="text-xs text-gray-500">
                        {artisan.prenom} {artisan.nom}
                      </p>
                    )}
                    {artisan.telephone && (
                      <p className="mt-0.5 text-sm text-gray-600">📞 {artisan.telephone}</p>
                    )}
                  </div>
                </div>

                {/* Métiers */}
                {metierLabels.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {metierLabels.map((m: string) => (
                      <span
                        key={m}
                        className="rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] px-2 py-0.5 text-xs font-bold text-[#1a1a2e]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Accroche */}
                {artisan.accroche && (
                  <p className="mb-3 text-sm text-gray-500 italic">
                    &laquo;&nbsp;{artisan.accroche}&nbsp;&raquo;
                  </p>
                )}

                {/* Carte zones */}
                {communeNoms.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-bold tracking-wide text-gray-400 uppercase">
                      Zones d&apos;intervention
                    </p>
                    <div className="mb-2 overflow-hidden rounded-xl border-2 border-[#1a1a1a]">
                      <CarteZoneLectureWrapper communeNoms={communeNoms} />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {communeNoms.slice(0, 4).map((nom: string) => (
                        <span
                          key={nom}
                          className="rounded-full border border-[#1a1a1a] bg-[#fff8f0] px-2 py-0.5 text-xs font-semibold text-[#1a1a2e]"
                        >
                          📍 {nom}
                        </span>
                      ))}
                      {communeNoms.length > 4 && (
                        <span className="rounded-full border border-gray-300 px-2 py-0.5 text-xs font-semibold text-gray-500">
                          +{communeNoms.length - 4} communes
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Partage — zone visible si fiche en ligne */}
                {artisan.status === "VALIDE" && (
                  <div
                    data-tuto="share-zone"
                    className="space-y-2 border-t-2 border-dashed border-gray-200 pt-3"
                  >
                    <Link
                      href={`/artisan/${artisan.id}`}
                      className="inline-block text-sm font-bold text-[#1a1a2e] underline"
                    >
                      Voir ma fiche publique →
                    </Link>
                    <ShareButton
                      url={`${process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr"}/artisan/${artisan.id}`}
                      title={`${nomAffiche} — ${metierLabels.join(", ")} à ${communeNoms[0] ?? "Loire-Atlantique"}`}
                      text={`Découvrez la fiche de ${nomAffiche} sur Oyez Artisans !`}
                    />
                    <SocialPreviewButton artisanId={artisan.id} />
                  </div>
                )}
              </div>
            )}

            {/* Messages clients */}
            <Link
              data-tuto="messages-link"
              href="/messages"
              className="flex items-center justify-between rounded-2xl border-4 border-[#1a1a1a] bg-white p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
            >
              <div>
                <h2 className="bd-titre mb-0.5 text-lg text-[#1a1a2e]">💬 Messages clients</h2>
                <p className="text-sm text-gray-400">
                  {messagesNonLusArtisan > 0
                    ? `${messagesNonLusArtisan} non lu${messagesNonLusArtisan > 1 ? "s" : ""}`
                    : "Aucun nouveau message"}
                </p>
              </div>
              {messagesNonLusArtisan > 0 && (
                <span
                  className="rounded-full bg-[#ff6b6b] px-3 py-1 text-sm font-black text-white"
                  style={{ border: "2px solid #1a1a1a" }}
                >
                  {messagesNonLusArtisan}
                </span>
              )}
            </Link>

            {/* Avis clients */}
            <div
              className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-5"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
            >
              <h2 className="bd-titre mb-1 text-lg text-[#1a1a2e]">Avis clients</h2>
              {moyenneAvis !== null ? (
                <p className="mb-3 text-3xl font-black text-[#6bcb77]">
                  {moyenneAvis.toFixed(1)} <span className="text-lg text-gray-400">/ 5</span>
                </p>
              ) : (
                <p className="mb-2 text-sm text-gray-400">Aucun avis validé pour l&apos;instant.</p>
              )}
              {artisan.avis.map(
                (a: { id: string; auteurPrenom: string; note: number; commentaire: string }) => (
                  <div key={a.id} className="mb-2 border-t pt-2 text-xs">
                    <span className="font-bold">{a.auteurPrenom}</span>{" "}
                    <span className="text-yellow-500">
                      {"★".repeat(a.note)}
                      {"☆".repeat(5 - a.note)}
                    </span>
                    <p className="line-clamp-2 text-gray-600">{a.commentaire}</p>
                  </div>
                )
              )}
            </div>

            {/* Photos de chantier */}
            <div data-tuto="portfolio-card">
              <PortfolioUploader
                initialPhotos={
                  Array.isArray(artisan.portfolioPhotos)
                    ? (artisan.portfolioPhotos as string[])
                    : []
                }
              />
            </div>

            {/* Suppression de compte */}
            <DangerZone />
            <TutorialGuide role="artisan" prenom={artisan.prenom} />
          </div>
        </div>
      </main>
    </div>
  );
}
