"use client";

import { useState } from "react";

interface SignalementModalProps {
  artisanId: string;
  nomArtisan: string;
}

export default function SignalementModal({ artisanId, nomArtisan }: SignalementModalProps) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (motif.trim().length < 10) {
      setError("Décrivez le problème en quelques mots (10 caractères min.)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signalement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId, motif: motif.trim(), email: email.trim() || undefined }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Une erreur est survenue.");
      }
    } catch {
      setError("Erreur réseau — réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setMotif("");
    setEmail("");
    setError(null);
    setDone(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-[#ff6b6b]"
      >
        Signaler cette fiche
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-2xl border-4 border-[#1a1a1a] bg-white p-6"
            style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div className="text-center">
                <p className="mb-2 text-3xl">✅</p>
                <p className="mb-1 text-lg font-black text-[#1a1a2e]">Signalement envoyé</p>
                <p className="mb-4 text-sm text-gray-500">
                  Notre équipe va examiner la fiche de <strong>{nomArtisan}</strong>.
                </p>
                <button onClick={handleClose} className="bd-btn bd-btn-primary">
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4 flex items-start justify-between">
                  <h2 className="bd-titre text-xl text-[#1a1a2e]">Signaler une fiche</h2>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-700"
                    aria-label="Fermer"
                  >
                    ✕
                  </button>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                  Vous signalez la fiche de <strong>{nomArtisan}</strong>. Notre équipe examinera
                  votre signalement.
                </p>

                <label className="mb-1 block text-sm font-black text-[#1a1a2e]">
                  Motif du signalement <span className="text-[#ff6b6b]">*</span>
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex : informations incorrectes, fausse entreprise, contenu trompeur..."
                  rows={4}
                  maxLength={500}
                  required
                  className="mb-1 w-full resize-none rounded-xl border-2 border-[#1a1a1a] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                />
                <p className="mb-4 text-right text-xs text-gray-400">{motif.length}/500</p>

                <label className="mb-1 block text-sm font-black text-[#1a1a2e]">
                  Votre email <span className="text-xs font-normal text-gray-400">(optionnel)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pour qu'on puisse vous recontacter si besoin"
                  className="mb-4 w-full rounded-xl border-2 border-[#1a1a1a] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ff6b6b]"
                />

                {error && (
                  <p className="mb-3 rounded-xl border-2 border-[#ff6b6b] bg-[#fff0f0] px-3 py-2 text-sm font-semibold text-[#ff6b6b]">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="bd-btn bd-btn-outline flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bd-btn bd-btn-primary flex-1 disabled:opacity-60"
                  >
                    {loading ? "Envoi…" : "Envoyer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
