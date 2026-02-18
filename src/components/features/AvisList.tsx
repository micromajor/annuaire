import type { Avis } from "@prisma/client";

interface AvisListProps {
  avis: Avis[];
}

function Stars({ note }: { note: number }) {
  return (
    <span className="text-lg leading-none" aria-label={`${note} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < note ? "text-[#ffd93d]" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function AvisList({ avis }: AvisListProps) {
  if (avis.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        Aucun avis pour le moment. Soyez le premier à en laisser un !
      </p>
    );
  }

  const moyenne = avis.reduce((acc, a) => acc + a.note, 0) / avis.length;

  return (
    <div className="space-y-4">
      {/* Moyenne */}
      <div className="flex items-center gap-3">
        <span className="bd-titre text-4xl text-[#1a1a2e]">{moyenne.toFixed(1)}</span>
        <div>
          <Stars note={Math.round(moyenne)} />
          <p className="text-xs text-gray-400">
            {avis.length} avis vérifié{avis.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <hr className="bd-separator" />

      {/* Liste */}
      {avis.map((a) => (
        <article key={a.id} className="rounded-xl border-2 border-[#1a1a1a] bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] text-sm font-black text-[#1a1a2e]">
                {a.auteurPrenom[0]?.toUpperCase()}
              </span>
              <span className="font-bold text-[#1a1a2e]">{a.auteurPrenom}</span>
            </div>
            <Stars note={a.note} />
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{a.commentaire}</p>
          <p className="mt-2 text-xs text-gray-400">
            {new Date(a.createdAt).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </article>
      ))}
    </div>
  );
}
