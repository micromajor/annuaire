export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";
import AdminAvisRow from "@/components/features/AdminAvisRow";
import AdminLogoutButton from "@/components/features/AdminLogoutButton";
import AdminMetiersPanel from "@/components/features/AdminMetiersPanel";
import AdminUserRow from "@/components/features/AdminUserRow";
import MarkSignalementLu from "@/components/features/MarkSignalementLu";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — OyezArtisans" };

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") redirect("/admin/login");

  const [
    valides,
    rejetes,
    avisEnAttente,
    besoinsNouveau,
    tousLesUtilisateurs,
    feedbacksNouveau,
    signalements,
    tousLesMetiers,
  ] = await Promise.all([
    prisma.artisan.count({ where: { status: "VALIDE", deletedAt: null } }),
    prisma.artisan.count({ where: { status: "REJETE", deletedAt: null } }),
    prisma.avis.findMany({
      where: { status: "EN_ATTENTE" },
      include: { artisan: { select: { raisonSociale: true, prenom: true, nom: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.besoin.findMany({
      where: { status: "NOUVEAU" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.artisan.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        raisonSociale: true,
        status: true,
        draftData: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        logoUrl: true,
        telephone: true,
        siret: true,
        siteWeb: true,
        description: true,
        passwordHash: true,
        hasPendingDraft: true,
      },
    }),
    prisma.feedback.findMany({
      where: { status: "NOUVEAU" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.signalement.findMany({
      where: { lu: false },
      include: { artisan: { select: { id: true, raisonSociale: true, prenom: true, nom: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.metier.findMany({
      orderBy: { label: "asc" },
      include: { _count: { select: { artisans: true } } },
    }),
  ]);

  const totalPending =
    signalements.length + avisEnAttente.length + besoinsNouveau.length + feedbacksNouveau.length;

  const navItems = [
    {
      id: "signalements",
      emoji: "🚩",
      label: "Signalements",
      count: signalements.length,
      color: "#ff6b6b",
    },
    { id: "avis", emoji: "⭐", label: "Avis", count: avisEnAttente.length, color: "#38bdf8" },
    {
      id: "besoins",
      emoji: "📋",
      label: "Besoins",
      count: besoinsNouveau.length,
      color: "#fb923c",
    },
    {
      id: "feedbacks",
      emoji: "📨",
      label: "Retours beta",
      count: feedbacksNouveau.length,
      color: "#f9a8d4",
    },
    {
      id: "metiers",
      emoji: "🔨",
      label: "Métiers",
      count: tousLesMetiers.length,
      color: "#ffd93d",
    },
    {
      id: "utilisateurs",
      emoji: "👥",
      label: "Utilisateurs",
      count: tousLesUtilisateurs.length,
      color: "#6bcb77",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      {/* Top header */}
      <header className="sticky top-0 z-50 border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-6 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bd-titre text-2xl text-[#ffd93d]">⚙️ Oyez Artisans</span>
            <span className="rounded-full border-2 border-[#ffd93d] bg-[#ffd93d]/20 px-3 py-0.5 text-xs font-bold text-[#ffd93d]">
              ADMIN
            </span>
            {totalPending > 0 && (
              <span className="rounded-full border-2 border-[#ff6b6b] bg-[#ff6b6b] px-2.5 py-0.5 text-xs font-bold text-white">
                {totalPending} action{totalPending > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        {/* ── Sidebar ── */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r-4 border-[#1a1a1a] bg-[#1a1a2e] p-4 lg:flex">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-[#ffd93d]/40 bg-[#ffd93d]/10 p-3 text-center">
              <div className="bd-titre text-2xl text-[#ffd93d]">{valides}</div>
              <div className="text-xs font-bold text-[#ffd93d]/80">✅ Validés</div>
            </div>
            <div className="rounded-xl border-2 border-[#ff6b6b]/40 bg-[#ff6b6b]/10 p-3 text-center">
              <div className="bd-titre text-2xl text-[#ff6b6b]">{rejetes}</div>
              <div className="text-xs font-bold text-[#ff6b6b]/80">❌ Rejetés</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <p className="mb-1 px-2 text-xs font-bold tracking-widest text-white/40 uppercase">
              Sections
            </p>
            {navItems.map(({ id, emoji, label, count, color }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-white/80 transition-all hover:bg-white/10 hover:text-white"
              >
                <span>
                  {emoji} {label}
                </span>
                {count > 0 && (
                  <span
                    className="rounded-full border-2 border-[#1a1a1a] px-2 py-0.5 text-xs font-bold text-[#1a1a1a]"
                    style={{ backgroundColor: color }}
                  >
                    {count}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="mt-auto border-t-2 border-white/10 pt-4 text-center text-xs text-white/30">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* KPI cards — mobile (lg:hidden) + overview row */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {[
              {
                label: "Signalements",
                count: signalements.length,
                color: "bg-[#ff6b6b]",
                emoji: "🚩",
              },
              { label: "Avis", count: avisEnAttente.length, color: "bg-[#38bdf8]", emoji: "⭐" },
              {
                label: "Besoins",
                count: besoinsNouveau.length,
                color: "bg-[#fb923c]",
                emoji: "📋",
              },
              {
                label: "Retours",
                count: feedbacksNouveau.length,
                color: "bg-[#f9a8d4]",
                emoji: "📨",
              },
              { label: "Validés", count: valides, color: "bg-[#6bcb77]", emoji: "✅" },
              { label: "Rejetés", count: rejetes, color: "bg-[#ff6b6b]", emoji: "❌" },
            ].map(({ label, count, color, emoji }) => (
              <div
                key={label}
                className={`${color} rounded-2xl border-2 border-[#1a1a1a] p-4 text-center`}
                style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
              >
                <div className="text-2xl">{emoji}</div>
                <div className="bd-titre mt-1 text-3xl text-[#1a1a2e]">{count}</div>
                <div className="text-xs font-bold text-[#1a1a2e]">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Section : Signalements ── */}
          <section id="signalements" className="mb-10 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-[#ff6b6b]" />
              <h2 className="bd-titre text-2xl text-[#1a1a2e]">⚠️ Signalements</h2>
              <span className="rounded-full border-2 border-[#1a1a1a] bg-[#ff6b6b] px-3 py-0.5 text-sm font-bold text-white">
                {signalements.length}
              </span>
            </div>
            {signalements.length === 0 ? (
              <EmptyState emoji="✔️" message="Aucun signalement non lu." />
            ) : (
              <div className="space-y-2">
                {signalements.map((s) => {
                  const nom = s.artisan.raisonSociale ?? `${s.artisan.prenom} ${s.artisan.nom}`;
                  return (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border-2 border-[#1a1a1a] bg-white p-4"
                      style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <a
                            href={`/artisan/${s.artisan.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-[#1a1a2e] underline hover:text-[#ff6b6b]"
                          >
                            {nom}
                          </a>
                          <span className="text-xs text-gray-400">
                            {new Date(s.createdAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{s.motif}</p>
                        {s.email && <p className="mt-1 text-xs text-gray-500">✉️ {s.email}</p>}
                      </div>
                      <MarkSignalementLu id={s.id} />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Section : Avis ── */}
          <section id="avis" className="mb-10 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-[#38bdf8]" />
              <h2 className="bd-titre text-2xl text-[#1a1a2e]">Avis à modérer</h2>
              <span className="rounded-full border-2 border-[#1a1a1a] bg-[#38bdf8] px-3 py-0.5 text-sm font-bold">
                {avisEnAttente.length}
              </span>
            </div>
            {avisEnAttente.length === 0 ? (
              <EmptyState emoji="⭐" message="Aucun avis en attente de modération." />
            ) : (
              <div className="space-y-3">
                {avisEnAttente.map((avis) => (
                  <AdminAvisRow key={avis.id} avis={avis} />
                ))}
              </div>
            )}
          </section>

          {/* ── Section : Besoins ── */}
          <section id="besoins" className="mb-10 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-[#fb923c]" />
              <h2 className="bd-titre text-2xl text-[#1a1a2e]">Besoins à traiter</h2>
              <span className="rounded-full border-2 border-[#1a1a1a] bg-[#fb923c] px-3 py-0.5 text-sm font-bold">
                {besoinsNouveau.length}
              </span>
            </div>
            {besoinsNouveau.length === 0 ? (
              <EmptyState emoji="📋" message="Aucun besoin en attente." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {besoinsNouveau.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border-2 border-[#1a1a1a] bg-white p-4"
                    style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border-2 border-[#1a1a1a] bg-[#fb923c] px-3 py-0.5 text-xs font-bold">
                        {b.metierSlug}
                      </span>
                      <span className="text-sm font-bold text-[#1a1a2e]">📍 {b.commune}</span>
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(b.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-700">{b.description}</p>
                    <p className="border-t border-gray-100 pt-2 text-sm font-bold text-[#1a1a2e]">
                      {b.prenom} <span className="font-normal text-gray-500">— {b.contact}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Section : Retours beta ── */}
          <section id="feedbacks" className="mb-10 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-[#f9a8d4]" />
              <h2 className="bd-titre text-2xl text-[#1a1a2e]">Retours beta</h2>
              <span className="rounded-full border-2 border-[#1a1a1a] bg-[#f9a8d4] px-3 py-0.5 text-sm font-bold">
                {feedbacksNouveau.length}
              </span>
            </div>
            {feedbacksNouveau.length === 0 ? (
              <EmptyState emoji="📨" message="Aucun retour utilisateur pour l'instant." />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {feedbacksNouveau.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-2xl border-2 border-[#1a1a1a] bg-white p-4"
                    style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border-2 border-[#1a1a1a] px-3 py-0.5 text-xs font-bold ${
                          f.type === "BUG"
                            ? "bg-[#ff6b6b]"
                            : f.type === "SUGGESTION"
                              ? "bg-[#ffd93d]"
                              : "bg-[#f9a8d4]"
                        }`}
                      >
                        {f.type === "BUG"
                          ? "🐛 Bug"
                          : f.type === "SUGGESTION"
                            ? "💡 Suggestion"
                            : "💬 Autre"}
                      </span>
                      {f.pageUrl && (
                        <span
                          className="max-w-[160px] truncate text-xs text-gray-500"
                          title={f.pageUrl}
                        >
                          📍 {f.pageUrl}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-700">{f.message}</p>
                    {f.email && (
                      <p className="border-t border-gray-100 pt-2 text-xs font-bold text-[#1a1a2e]">
                        ✉️ <span className="font-normal text-gray-500">{f.email}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Section : Métiers ── */}
          <section id="metiers" className="mb-10 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-[#ffd93d]" />
              <h2 className="bd-titre text-2xl text-[#1a1a2e]">Métiers</h2>
              <span className="rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] px-3 py-0.5 text-sm font-bold">
                {tousLesMetiers.length}
              </span>
            </div>
            <AdminMetiersPanel initialMetiers={tousLesMetiers} />
          </section>

          {/* ── Section : Utilisateurs ── */}
          <section id="utilisateurs" className="mb-10 scroll-mt-20">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-[#6bcb77]" />
              <h2 className="bd-titre text-2xl text-[#1a1a2e]">Tous les utilisateurs</h2>
              <span className="rounded-full border-2 border-[#1a1a1a] bg-[#6bcb77] px-3 py-0.5 text-sm font-bold">
                {tousLesUtilisateurs.length}
              </span>
            </div>
            <div
              className="overflow-hidden rounded-2xl border-2 border-[#1a1a1a]"
              style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
            >
              <div className="space-y-0 divide-y-2 divide-[#1a1a1a]">
                {tousLesUtilisateurs.map((u) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <AdminUserRow key={u.id} artisan={u as any} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#1a1a1a]/20 bg-white p-10 text-center text-gray-400">
      <div className="mb-2 text-4xl">{emoji}</div>
      <p className="font-bold">{message}</p>
    </div>
  );
}
