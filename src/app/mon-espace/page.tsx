export const dynamic = "force-dynamic";

import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import AutoSignOut from "@/components/ui/AutoSignOut";
import Link from "next/link";
import MonEspaceEditForm from "@/components/features/MonEspaceEditForm";
import PortfolioUploader from "@/components/features/PortfolioUploader";
import DangerZone from "@/components/features/DangerZone";
import CarteZoneLectureWrapper from "@/components/features/CarteZoneLectureWrapper";

export default async function MonEspacePage() {
  const session = await auth();

  const role = (session?.user as { role?: string })?.role;

  if (!session || !["artisan", "particulier"].includes(role ?? "")) {
    redirect("/connexion");
  }

  // Nouveau compte Google — doit choisir son profil
  if ((session.user as { needsSetup?: boolean }).needsSetup) {
    redirect("/bienvenue");
  }

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
        <header className="border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link href="/" className="bd-titre text-xl text-[#60c5f1]">
              Oyez Artisans !
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border-2 border-[#60c5f1] px-3 py-1.5 text-xs font-bold text-[#60c5f1] hover:bg-[#60c5f1] hover:text-[#1a1a2e]"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="bd-titre mb-1 text-4xl text-[#1a1a2e]">
            Bonjour, {particulier?.prenom ?? "vous"} 👋
          </h1>
          <p className="mb-8 text-sm font-semibold text-[#1a1a2e]/60">
            Retrouvez ici vos annonces publiées.
          </p>

          {/* Bouton messages */}
          <Link
            href="/messages"
            className="mb-6 flex items-center justify-between rounded-2xl border-4 border-[#1a1a1a] bg-white px-5 py-3"
            style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
          >
            <span className="font-black text-[#1a1a2e]">💬 Mes messages</span>
            {messagesNonLus > 0 && (
              <span
                className="rounded-full bg-[#ff6b6b] px-2.5 py-0.5 text-xs font-black text-white"
                style={{ border: "2px solid #1a1a1a" }}
              >
                {messagesNonLus} nouveau{messagesNonLus > 1 ? "x" : ""}
              </span>
            )}
          </Link>

          {besoins.length === 0 ? (
            <div
              className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-8 text-center"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
            >
              <p className="mb-2 text-3xl">📋</p>
              <p className="font-bold text-[#1a1a2e]/60">
                Aucune annonce publiée pour l&apos;instant.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm font-bold text-[#1a1a2e] underline"
              >
                ← Déposer une annonce
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {besoins.map((b) => (
                <div
                  key={b.id}
                  className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-5"
                  style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[#1a1a2e]">
                        {b.metierSlug} · {b.commune}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{b.description}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-xs font-black"
                      style={{
                        background: b.status === "NOUVEAU" ? "#ffd93d" : "#6bcb77",
                        border: "2px solid #1a1a1a",
                        color: "#1a1a2e",
                      }}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Publié le{" "}
                    {b.createdAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Suppression de compte */}
          <div className="mt-10">
            <DangerZone />
          </div>
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

  // Messages non lus (particulier → artisan)
  const messagesNonLusArtisan = await prisma.message.count({
    where: {
      conversation: { artisanId: userId },
      expediteur: "particulier",
      lu: false,
    },
  });

  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const moyenneAvis =
    artisan.avis.length > 0
      ? artisan.avis.reduce((s: number, a: { note: number }) => s + a.note, 0) / artisan.avis.length
      : null;

  const statusLabel: Record<string, string> = {
    EN_ATTENTE: "⏳ En attente de validation",
    VALIDE: "✅ Fiche en ligne",
    REJETE: "❌ Fiche rejetée",
  };
  const statusColor: Record<string, string> = {
    EN_ATTENTE: "bg-[#ffd93d] text-[#1a1a2e]",
    VALIDE: "bg-[#6bcb77] text-white",
    REJETE: "bg-[#ff6b6b] text-white",
  };

  return (
    <div className="min-h-screen bg-[#6bcb77]">
      {/* Header vert */}
      <header className="border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="bd-titre text-xl text-[#6bcb77]">
            Oyez Artisans !
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white">{nomAffiche}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border-2 border-[#6bcb77] px-3 py-1.5 text-xs font-bold text-[#6bcb77] hover:bg-[#6bcb77] hover:text-[#1a1a2e]"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Titre */}
        <div className="mb-8">
          <h1 className="bd-titre text-4xl text-[#1a1a2e]">Bonjour, {artisan.prenom} 👋</h1>
          <span
            className={`mt-2 inline-block rounded-full px-4 py-1.5 text-sm font-black ${statusColor[artisan.status]}`}
            style={{ border: "2px solid #1a1a1a" }}
          >
            {statusLabel[artisan.status]}
          </span>
        </div>

        {/* Bandeau draft en attente */}
        {artisan.hasPendingDraft &&
          artisan.draftData &&
          (() => {
            const draft = artisan.draftData as {
              prenom?: string;
              nom?: string;
              raisonSociale?: string | null;
              telephone?: string | null;
              siret?: string | null;
              siteWeb?: string | null;
              description?: string | null;
              logoUrl?: string | null;
              metierLabels?: string[];
              communeLabels?: string[];
            };
            type DraftEntry = { label: string; value: string | null | undefined };
            const champs: DraftEntry[] = [
              { label: "Raison sociale", value: draft.raisonSociale },
              { label: "Téléphone", value: draft.telephone },
              { label: "SIRET", value: draft.siret },
              { label: "Site web", value: draft.siteWeb },
              { label: "Description", value: draft.description },
              { label: "Logo", value: draft.logoUrl ? "Nouveau logo soumis" : null },
              { label: "Métiers", value: draft.metierLabels?.join(", ") },
              { label: "Zones", value: draft.communeLabels?.join(", ") },
            ].filter((c): c is DraftEntry => c.value != null && c.value !== "");
            return (
              <div
                className="mb-6 rounded-2xl border-4 border-[#a78bfa] bg-[#f5f0ff] p-5"
                style={{ boxShadow: "5px 5px 0 #a78bfa" }}
              >
                <p className="bd-titre mb-1 text-lg text-[#7c3aed]">⏳ Modifications en attente</p>
                <p className="mb-4 text-sm text-gray-600">
                  Vos modifications sont en cours de vérification. Votre fiche reste visible en
                  ligne avec vos informations actuelles.
                </p>
                {champs.length > 0 && (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {champs.map(({ label, value }) => (
                      <div key={label} className="contents">
                        <dt className="font-bold text-[#7c3aed]">{label}</dt>
                        <dd className="break-words text-gray-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            );
          })()}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Formulaire de modification / complétion */}
          <MonEspaceEditForm
            artisan={{
              prenom: artisan.prenom,
              nom: artisan.nom,
              raisonSociale: artisan.raisonSociale,
              telephone: artisan.telephone,
              siret: artisan.siret,
              siteWeb: artisan.siteWeb,
              description: artisan.description,
              logoUrl: artisan.logoUrl,
              metierSlugs: artisan.metiers.map((m: { metier: { slug: string } }) => m.metier.slug),
              communeNoms: artisan.communes.map((c: { commune: { nom: string } }) => c.commune.nom),
              status: artisan.status,
            }}
          />

          {/* Carte — infos (lecture seule, visible quand profil complet) */}
          {artisan.prenom && (
            <div
              className="col-span-full rounded-2xl border-4 border-[#1a1a1a] bg-white p-6"
              style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
            >
              <h2 className="bd-titre mb-4 text-xl text-[#1a1a2e]">Ma fiche</h2>

              {/* Logo + identité */}
              <div className="mb-4 flex items-center gap-4">
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
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#fff8f0] text-2xl"
                    style={{ border: "3px solid #1a1a1a" }}
                  >
                    🔨
                  </div>
                )}
                <div>
                  <p className="font-black text-[#1a1a2e]">
                    {artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`}
                  </p>
                  {artisan.raisonSociale && (
                    <p className="text-sm text-gray-500">
                      {artisan.prenom} {artisan.nom}
                    </p>
                  )}
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="font-bold text-gray-500">Métiers</dt>
                <dd>
                  {artisan.metiers
                    .map((m: { metier: { label: string } }) => m.metier.label)
                    .join(", ") || <span className="text-gray-300">—</span>}
                </dd>
              </dl>

              {/* Carte zones */}
              {artisan.communes.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold text-gray-500">Zones d&apos;intervention</p>
                  <div className="mb-3 overflow-hidden rounded-xl border-2 border-[#1a1a1a]">
                    <CarteZoneLectureWrapper
                      communeNoms={artisan.communes.map(
                        (c: { commune: { nom: string } }) => c.commune.nom
                      )}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {artisan.communes.map((c: { commune: { nom: string; codePostal: string } }) => (
                      <span
                        key={c.commune.nom}
                        className="rounded-full border-2 border-[#1a1a1a] bg-[#fff8f0] px-2 py-0.5 text-xs font-semibold text-[#1a1a2e]"
                      >
                        📍 {c.commune.nom} ({c.commune.codePostal})
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <dl className="mt-2 grid grid-cols-2 gap-x-4 text-sm">
                  <dt className="font-bold text-gray-500">Zones</dt>
                  <dd>
                    <span className="text-gray-300">—</span>
                  </dd>
                </dl>
              )}
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {artisan.telephone && (
                  <>
                    <dt className="font-bold text-gray-500">Téléphone</dt>
                    <dd>{artisan.telephone}</dd>
                  </>
                )}
                {artisan.siret && (
                  <>
                    <dt className="font-bold text-gray-500">SIRET</dt>
                    <dd className="font-mono">{artisan.siret}</dd>
                  </>
                )}
                {artisan.siteWeb && (
                  <>
                    <dt className="font-bold text-gray-500">Site web</dt>
                    <dd>
                      <a
                        href={artisan.siteWeb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1a1a2e] underline"
                      >
                        {artisan.siteWeb.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </>
                )}
              </dl>

              {artisan.description && (
                <p className="mt-4 border-t pt-3 text-sm text-gray-600">{artisan.description}</p>
              )}
              {artisan.status === "VALIDE" && (
                <Link
                  href={`/artisan/${artisan.id}`}
                  className="mt-4 inline-block text-sm font-bold text-[#1a1a2e] underline"
                >
                  Voir ma fiche publique →
                </Link>
              )}
            </div>
          )}

          {/* Carte — avis */}
          <div
            className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-6"
            style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
          >
            <h2 className="bd-titre mb-1 text-xl text-[#1a1a2e]">Avis clients</h2>
            {moyenneAvis !== null ? (
              <p className="mb-3 text-3xl font-black text-[#6bcb77]">
                {moyenneAvis.toFixed(1)} <span className="text-lg text-gray-400">/ 5</span>
              </p>
            ) : (
              <p className="mb-3 text-sm text-gray-400">Aucun avis validé pour l&apos;instant.</p>
            )}
            {artisan.avis.map(
              (a: { id: string; auteurPrenom: string; note: number; commentaire: string }) => (
                <div key={a.id} className="mb-2 border-t pt-2 text-sm">
                  <span className="font-bold">{a.auteurPrenom}</span>{" "}
                  <span className="text-yellow-500">
                    {"★".repeat(a.note)}
                    {"☆".repeat(5 - a.note)}
                  </span>
                  <p className="text-gray-600">{a.commentaire}</p>
                </div>
              )
            )}
          </div>

          {/* Carte — messages */}
          <Link
            href="/messages"
            className="flex items-center justify-between rounded-2xl border-4 border-[#1a1a1a] bg-white p-6 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
          >
            <div>
              <h2 className="bd-titre mb-1 text-xl text-[#1a1a2e]">💬 Messages clients</h2>
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

          {/* Carte — portfolio photos */}
          <PortfolioUploader
            initialPhotos={
              Array.isArray(artisan.portfolioPhotos) ? (artisan.portfolioPhotos as string[]) : []
            }
          />

          {/* Suppression de compte */}
          <DangerZone />

          {/* Carte — demandes de contact */}
          <div
            className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-6 sm:col-span-2"
            style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
          >
            <h2 className="bd-titre mb-3 text-xl text-[#1a1a2e]">Dernières demandes reçues</h2>
            {artisan.contacts.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune demande pour l&apos;instant.</p>
            ) : (
              <ul className="space-y-3">
                {artisan.contacts.map(
                  (c: {
                    id: string;
                    clientPrenom: string;
                    clientNom: string;
                    typeTraux: string;
                    message: string;
                    clientEmail: string;
                    clientTel?: string | null;
                  }) => (
                    <li key={c.id} className="rounded-xl border-2 border-gray-100 p-3 text-sm">
                      <p className="font-bold text-[#1a1a2e]">
                        {c.clientPrenom} {c.clientNom}
                      </p>
                      <p className="text-gray-500">{c.typeTraux}</p>
                      <p className="mt-1 text-gray-700">{c.message}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        {c.clientEmail}
                        {c.clientTel ? ` · ${c.clientTel}` : ""}
                      </p>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
