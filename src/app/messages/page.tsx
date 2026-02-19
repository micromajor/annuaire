"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Conversation {
  id: string;
  sujet: string;
  updatedAt: string;
  nonLus: number;
  artisan: {
    id: string;
    prenom: string;
    nom: string;
    raisonSociale: string | null;
    logoUrl: string | null;
  };
  particulier: { id: string; prenom: string; nom: string };
  dernierMessage: { contenu: string; expediteur: string } | null;
}

export default function MessagesPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const accent = role === "artisan" ? "#6bcb77" : "#60c5f1";

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => {
        if (r.status === 401) {
          router.push("/connexion");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setConvs(data);
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fff8f0]">
      <header className="border-b-4 border-[#1a1a1a] bg-[#1a1a2e] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="bd-titre text-xl" style={{ color: accent }}>
            Oyez Artisans !
          </Link>
          <Link
            href="/mon-espace"
            className="rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors hover:text-[#1a1a2e]"
            style={{ borderColor: accent, color: accent }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accent)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            ← Mon espace
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="bd-titre mb-6 text-4xl text-[#1a1a2e]">💬 Mes messages</h1>

        {loading ? (
          <div className="py-16 text-center font-bold text-gray-400">Chargement…</div>
        ) : convs.length === 0 ? (
          <div
            className="rounded-2xl border-4 border-[#1a1a1a] bg-white p-10 text-center"
            style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
          >
            <p className="mb-2 text-4xl">📭</p>
            <p className="font-bold text-[#1a1a2e]/60">Aucune conversation pour l&apos;instant.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-bold text-[#1a1a2e] underline">
              Trouver un artisan →
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {convs.map((c) => {
              const nomArtisan = c.artisan.raisonSociale ?? `${c.artisan.prenom} ${c.artisan.nom}`;
              const date = new Date(c.updatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              });
              return (
                <li key={c.id}>
                  <Link
                    href={`/messages/${c.id}`}
                    className="flex items-center gap-4 rounded-2xl border-4 border-[#1a1a1a] bg-white p-4 transition-transform hover:-translate-y-0.5"
                    style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
                  >
                    {/* Avatar artisan */}
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#fff8f0] text-xl"
                      style={{ border: "3px solid #1a1a1a" }}
                    >
                      {c.artisan.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.artisan.logoUrl}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        "🔨"
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-black text-[#1a1a2e]">{nomArtisan}</p>
                        <span className="shrink-0 text-xs text-gray-400">{date}</span>
                      </div>
                      <p className="truncate text-sm text-gray-500">{c.sujet}</p>
                      {c.dernierMessage && (
                        <p className="mt-0.5 truncate text-xs text-gray-400">
                          {c.dernierMessage.expediteur === "artisan" ? "🔨 " : "👤 "}
                          {c.dernierMessage.contenu}
                        </p>
                      )}
                    </div>

                    {/* Badge non lus */}
                    {c.nonLus > 0 && (
                      <span
                        className="shrink-0 rounded-full bg-[#ff6b6b] px-2 py-0.5 text-xs font-black text-white"
                        style={{ border: "2px solid #1a1a1a" }}
                      >
                        {c.nonLus}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
