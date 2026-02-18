"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#1a1a1a] bg-[#1a1a2e]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          onClick={() => setMenuOpen(false)}
        >
          <span
            className="bd-titre text-2xl text-[#ffd93d] sm:text-3xl"
            style={{ textShadow: "2px 2px 0px #1a1a1a" }}
          >
            🔨 OyezArtisans
          </span>
          <span className="bd-badge bd-badge-rouge hidden sm:inline-flex">Nantes Est</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-3 sm:flex">
          <Link href="/mon-profil" className="bd-btn bd-btn-outline text-sm">
            Mon profil
          </Link>
          <Link href="/inscription" className="bd-btn bd-btn-primary text-sm">
            + Inscrire mon entreprise
          </Link>
        </nav>

        {/* Hamburger mobile */}
        <button
          className="flex flex-col gap-1.5 p-2 sm:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <span
            className={`block h-0.5 w-6 bg-[#ffd93d] transition-transform duration-200 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#ffd93d] transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-[#ffd93d] transition-transform duration-200 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Menu mobile déroulant */}
      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t-2 border-[#ffd93d]/30 bg-[#1a1a2e] px-4 py-4 sm:hidden">
          <Link
            href="/mon-profil"
            className="bd-btn bd-btn-outline w-full text-center text-sm"
            onClick={() => setMenuOpen(false)}
          >
            👤 Mon profil
          </Link>
          <Link
            href="/inscription"
            className="bd-btn bd-btn-primary w-full text-center text-sm"
            onClick={() => setMenuOpen(false)}
          >
            + Inscrire mon entreprise
          </Link>
        </nav>
      )}
    </header>
  );
}
