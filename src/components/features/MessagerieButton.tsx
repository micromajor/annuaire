"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Props {
  artisanId: string;
  artisanNom: string;
}

export default function MessagerieButton({ artisanId, artisanNom }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string })?.role;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pas chargé encore
  if (status === "loading") return null;

  // Pas connecté ou connecté en tant qu'artisan → lien simple vers connexion
  if (!session || role !== "particulier") {
    return (
      <a
        href={`/connexion?callbackUrl=/artisans/${artisanId}`}
        className="bd-btn bd-btn-outline mt-3 w-full text-sm"
      >
        💬 Écrire un message
      </a>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artisanId,
          sujet: `Contact avec ${artisanNom}`,
          premierMessage: message.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Une erreur est survenue");
        return;
      }
      const { conversationId } = await res.json();
      router.push(`/messages/${conversationId}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="bd-btn bd-btn-primary mt-3 w-full">
        💬 Écrire un message
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border-4 border-[#1a1a1a] bg-white p-6"
            style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="bd-titre text-xl text-[#1a1a2e]">✉️ Message à {artisanNom}</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-xl font-black text-gray-400 hover:text-[#1a1a2e]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
                  Votre message <span className="text-[#ff6b6b]">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre projet, la localisation, vos disponibilités…"
                  rows={4}
                  maxLength={2000}
                  required
                  className="bd-input resize-none"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-[#ff6b6b]/10 px-3 py-2 text-sm font-bold text-[#ff6b6b]">
                  ⚠️ {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="bd-btn bd-btn-primary disabled:opacity-60"
              >
                {sending ? "⏳ Envoi…" : "Envoyer le message →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
