import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import BienvenueChoix from "@/components/features/BienvenueChoix";

export const metadata = {
  title: "Bienvenue — OyezArtisans",
};

export default async function BienvenuePage() {
  const session = await auth();

  // Non connecté → connexion
  if (!session) redirect("/connexion");

  const artisanId = (session.user as { id?: string })?.id;
  const needsSetup = (session.user as { needsSetup?: boolean }).needsSetup;

  // Artisan avec flag JWT (Google OAuth) : OK
  // Artisan sans flag (email/password) : on accepte s'il n'a pas encore de métier
  if (!needsSetup && artisanId) {
    const artisan = await prisma.artisan.findUnique({
      where: { id: artisanId },
      select: { metiers: { take: 1 } },
    });
    // A déjà configuré son profil — redirection accueil
    if (artisan && artisan.metiers.length > 0) redirect("/");
    // Pas connecté comme artisan — redirection accueil
    if (!artisan) redirect("/");
  }

  const prenom = (session.user as { name?: string })?.name?.split(" ")[0] ?? null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#ffd93d] px-4 py-16">
      {/* Demi-teinte déco */}
      <div className="bd-halftone pointer-events-none fixed inset-0 opacity-5" />

      <div className="relative z-10 w-full max-w-2xl text-center">
        <div
          className="bd-onomatopee mb-4 inline-block -rotate-2 text-4xl text-[#1a1a2e]"
          style={{ animation: "bd-swing 0.6s ease" }}
        >
          {prenom ? `Salut ${prenom} !` : "Bienvenue !"}
        </div>

        <h1 className="bd-titre mb-3 text-4xl text-[#1a1a2e] sm:text-5xl">Vous êtes…&nbsp;?</h1>
        <p className="mb-10 text-base font-semibold text-[#1a1a2e]/60">
          Dites-nous qui vous êtes pour personnaliser votre expérience.
        </p>

        <BienvenueChoix />

        <p className="mt-8 text-xs text-[#1a1a2e]/40">
          Pas de compte requis côté particulier · Inscription artisan gratuite et vérifiée à la main
        </p>
      </div>
    </main>
  );
}
