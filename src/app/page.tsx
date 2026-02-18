import Link from "next/link";
import FloatingTools from "@/components/ui/FloatingTools";
import HeroSearch from "@/components/features/HeroSearch";
import { METIERS } from "@/constants";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import AutoSignOut from "@/components/ui/AutoSignOut";

export default async function HomePage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const isArtisan = role === "artisan";
  const isParticulier = role === "particulier";
  const userId = (session?.user as { id?: string })?.id;

  // Données selon le rôle connecté
  let artisanPrenom: string | null = null;
  let particulierPrenom: string | null = null;

  if (isArtisan && userId) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: userId },
      select: { prenom: true, deletedAt: true },
    });

    // Compte supprimé ou introuvable — invalider la session
    if (!artisan || artisan.deletedAt) {
      return <AutoSignOut />;
    }

    artisanPrenom = artisan.prenom;
  }

  if (isParticulier && userId) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: userId },
      select: { prenom: true },
    });
    particulierPrenom = artisan?.prenom ?? null;
  }

  return (
    <div
      className={`flex min-h-screen flex-col ${isArtisan ? "bg-[#6bcb77]" : isParticulier ? "bg-[#60c5f1]" : "bg-[#ffd93d]"}`}
    >
      {/* Header minimaliste */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="bd-titre text-2xl text-[#1a1a2e] no-underline"
          style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}
        >
          🔨 OyezArtisans
        </Link>
        <nav className="flex items-center gap-3">
          {isArtisan ? (
            <Link
              href="/mon-espace"
              className="bd-btn text-sm"
              style={{
                background: "#6bcb77",
                border: "3px solid #1a1a1a",
                boxShadow: "3px 3px 0 #1a1a1a",
                color: "#1a1a2e",
                fontWeight: 900,
              }}
            >
              Mon espace →
            </Link>
          ) : isParticulier ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm font-bold text-[#1a1a2e] underline-offset-2 hover:underline"
              >
                Se déconnecter
              </button>
            </form>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-sm font-bold text-[#1a1a2e] underline-offset-2 hover:underline"
              >
                Se connecter
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 pt-8 pb-24">
        <FloatingTools />

        {isArtisan ? (
          /* --- Vue artisan connecté --- */
          <div className="relative z-10 w-full max-w-xl text-center">
            <span className="bd-badge bd-badge-bleu bd-anim-pop mb-6 inline-flex">
              👋 Bonjour {artisanPrenom ?? "artisan"} !
            </span>
            <h1 className="bd-titre bd-anim-build mb-6 text-5xl leading-tight text-[#1a1a2e] sm:text-6xl">
              Bienvenue sur OyezArtisans
            </h1>
            <p className="mb-8 text-base font-semibold text-[#1a1a2e]/70">
              Gérez votre profil et suivez vos demandes depuis votre espace.
            </p>
            <Link href="/mon-espace" className="bd-btn bd-btn-primary px-8 py-3 text-lg">
              Mon espace →
            </Link>
          </div>
        ) : isParticulier ? (
          /* --- Vue particulier connecté --- */
          <div className="relative z-10 w-full max-w-5xl text-center">
            <span
              className="bd-badge bd-anim-pop mb-8 inline-flex"
              style={{ background: "#1a1a2e", color: "#60c5f1" }}
            >
              👋 Bonjour {particulierPrenom ?? ""} ! Qu&apos;est-ce qu&apos;on vous cherche ?
            </span>
            <h1 className="bd-titre bd-anim-build mb-10 text-5xl leading-tight text-[#1a1a2e] sm:text-7xl">
              Trouvez le bon artisan
            </h1>
            <div className="bd-anim-build" style={{ animationDelay: "0.15s" }}>
              <HeroSearch metiers={METIERS} />
            </div>
          </div>
        ) : (
          /* --- Vue visiteur --- */
          <div className="relative z-10 w-full max-w-5xl text-center">
            <span className="bd-badge bd-badge-bleu bd-anim-pop mb-8 inline-flex">
              📍 Nantes &amp; Est Loire-Atlantique
            </span>
            <h1 className="bd-titre bd-anim-build mb-10 text-5xl leading-tight text-[#1a1a2e] sm:text-7xl">
              Trouvez le bon artisan
            </h1>
            <div className="bd-anim-build" style={{ animationDelay: "0.15s" }}>
              <HeroSearch metiers={METIERS} />
            </div>
          </div>
        )}
      </main>

      {/* Footer minimaliste — style Google */}
      <footer className="relative z-10 border-t-2 border-[#1a1a1a]/10 px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs font-semibold text-[#1a1a2e]/50">
          <span>© 2026 OyezArtisans</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-[#1a1a2e]">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-[#1a1a2e]">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
