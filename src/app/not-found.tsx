import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable — OyezArtisans",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fff8f0] px-4 py-16 text-center">
      {/* Onomatopée BD */}
      <div
        className="bd-titre mb-2 text-[8rem] leading-none text-[#ff6b6b] select-none"
        style={{
          WebkitTextStroke: "3px #1a1a1a",
          textShadow: "5px 5px 0 #1a1a1a",
        }}
      >
        OUPS !
      </div>

      {/* Bulle BD */}
      <div className="relative mb-8 max-w-md">
        <div
          className="bd-card relative rounded-2xl bg-white px-8 py-6"
          style={{ border: "3px solid #1a1a1a" }}
        >
          {/* Pointe de bulle */}
          <div
            className="absolute -bottom-4 left-1/2 h-0 w-0 -translate-x-1/2"
            style={{
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderTop: "20px solid #1a1a1a",
            }}
          />
          <div
            className="absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2"
            style={{
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: "18px solid white",
            }}
          />
          <p className="text-lg font-black text-[#1a1a2e]">
            Cette page n&apos;existe pas… ou l&apos;artisan a déguerpi !
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Erreur 404 — La page que vous cherchez est introuvable.
          </p>
        </div>
      </div>

      {/* Personnage / outil */}
      <div className="mb-8 text-7xl" style={{ animation: "bd-swing 2s ease-in-out infinite" }}>
        🔨
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/artisans" className="bd-btn bd-btn-primary">
          🔍 Trouver un artisan
        </Link>
        <Link href="/" className="bd-btn bd-btn-outline">
          🏠 Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
