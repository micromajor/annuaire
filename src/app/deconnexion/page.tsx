import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/actions";

export const metadata: Metadata = { title: "Déconnexion" };

export default function DeconnexionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#ffd93d] px-4">
      <div
        className="w-full max-w-sm rounded-2xl border-4 border-[#1a1a1a] bg-white p-8 text-center"
        style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
      >
        <p className="mb-2 text-4xl">👋</p>
        <h1 className="bd-titre mb-2 text-2xl text-[#1a1a2e]">Déconnexion</h1>
        <p className="mb-6 text-sm text-gray-500">Êtes-vous sûr de vouloir vous déconnecter ?</p>

        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-xl border-2 border-[#1a1a2e] bg-[#ff6b6b] py-3 text-sm font-bold text-white transition-colors hover:bg-[#e05555]"
          >
            Oui, me déconnecter
          </button>
        </form>

        <Link
          href="/"
          className="mt-4 inline-block text-xs text-gray-400 underline hover:text-gray-600"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
