import Link from "next/link";
import type { Artisan, ArtisanMetier, Metier, ArtisanCommune, Commune } from "@prisma/client";

type ArtisanWithRelations = Artisan & {
  metiers: (ArtisanMetier & { metier: Metier })[];
  communes: (ArtisanCommune & { commune: Commune })[];
};

const METIER_EMOJIS: Record<string, string> = {
  macon: "🧱",
  plombier: "🔧",
  electricien: "⚡",
  menuisier: "🪵",
  peintre: "🎨",
  couvreur: "🏠",
  carreleur: "🔲",
  chauffagiste: "🔥",
  plaquiste: "🪚",
  charpentier: "🔩",
};

interface ArtisanCardProps {
  artisan: ArtisanWithRelations;
  avis?: { note: number }[];
}

export default function ArtisanCard({ artisan, avis = [] }: ArtisanCardProps) {
  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const communesPrincipales = artisan.communes.slice(0, 2);
  const plusDeCommunes = artisan.communes.length - 2;
  const firstMetierSlug = artisan.metiers[0]?.metier.slug;

  const nbAvis = avis.length;
  const moyenne =
    nbAvis > 0 ? avis.reduce((acc: number, a: { note: number }) => acc + a.note, 0) / nbAvis : null;

  return (
    <article className="bd-card bd-card-artisan flex flex-col p-5">
      {/* Header carte */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Logo ou emoji métier — conteneur fixe avec object-contain, jamais rogné */}
          {artisan.logoUrl ? (
            <div className="h-10 w-20 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artisan.logoUrl}
                alt={`Logo ${nomAffiche}`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : firstMetierSlug ? (
            <span className="bd-tool-emoji text-2xl">{METIER_EMOJIS[firstMetierSlug] ?? "🔧"}</span>
          ) : null}
          <div>
            <h2 className="text-lg leading-tight font-black text-[#1a1a2e]">{nomAffiche}</h2>
            {artisan.raisonSociale && (
              <p className="text-sm text-gray-500">
                {artisan.prenom} {artisan.nom}
              </p>
            )}
          </div>
        </div>
        {artisan.siret && <span className="bd-badge bd-badge-vert shrink-0">✓ Pro vérifié</span>}
      </div>

      {/* Note moyenne */}
      {moyenne !== null ? (
        <div className="mb-3 flex items-center gap-1.5 text-sm">
          <span className="text-[#ffd93d]">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={i < Math.round(moyenne!) ? "text-[#ffd93d]" : "text-gray-300"}
              >
                ★
              </span>
            ))}
          </span>
          <span className="font-bold text-[#1a1a2e]">{moyenne.toFixed(1)}</span>
          <span className="text-gray-400">({nbAvis} avis)</span>
        </div>
      ) : (
        <div className="mb-3 text-xs text-gray-400 italic">Pas encore d&apos;avis</div>
      )}
      <div className="mb-3 flex flex-wrap gap-1">
        {artisan.metiers.map(({ metier }) => (
          <span key={metier.id} className="bd-badge bd-badge-jaune">
            {metier.label}
          </span>
        ))}
      </div>

      {/* Accroche */}
      {artisan.accroche && (
        <p className="mb-3 text-sm font-semibold text-gray-600 italic">{artisan.accroche}</p>
      )}

      {/* Communes */}
      <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <span>📍</span>
        {communesPrincipales.map(({ commune }) => (
          <span key={commune.id}>{commune.nom}</span>
        ))}
        {plusDeCommunes > 0 && (
          <span className="text-xs text-gray-400">
            +{plusDeCommunes} commune{plusDeCommunes > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="mt-auto flex gap-2">
        <Link
          href={`/artisan/${artisan.id}`}
          className="bd-btn bd-btn-outline flex-1 text-center text-sm"
        >
          Voir la fiche
        </Link>
        <Link href={`/artisan/${artisan.id}#contact`} className="bd-btn bd-btn-primary text-sm">
          Contacter
        </Link>
      </div>
    </article>
  );
}
