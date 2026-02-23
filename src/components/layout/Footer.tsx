import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t-4 border-[#1a1a1a] bg-[#1a1a2e] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Bloc marque */}
          <div>
            <p className="bd-titre text-2xl text-[#ffd93d]">Oyez Artisans !</p>
            <p className="mt-2 text-sm text-gray-300">
              L&apos;annuaire des artisans du bâtiment près de chez vous. Actuellement sur Nantes et
              l&apos;Est de la Loire-Atlantique.
            </p>
          </div>

          {/* Liens */}
          <div>
            <p className="mb-3 font-bold tracking-wide text-[#ffd93d] uppercase">Accès rapide</p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/artisans" className="text-gray-300 hover:text-[#ffd93d]">
                  Trouver votre artisan
                </Link>
              </li>
              <li>
                <Link href="/inscription" className="text-gray-300 hover:text-[#ffd93d]">
                  Inscrire mon entreprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <p className="mb-3 font-bold tracking-wide text-[#ffd93d] uppercase">Infos</p>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/mentions-legales" className="text-gray-300 hover:text-[#ffd93d]">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-gray-300 hover:text-[#ffd93d]"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="bd-separator my-8 opacity-30" />
        <div className="mb-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#ffd93d]/60 bg-[#ffd93d]/10 px-4 py-1.5 text-xs font-bold text-[#ffd93d]">
            <span>🚀</span>
            Oyez Artisans ! est en cours de lancement — vos retours nous aident à nous améliorer !
          </span>
        </div>
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Oyez Artisans ! — Nantes & Est Loire-Atlantique
        </p>
      </div>
    </footer>
  );
}
