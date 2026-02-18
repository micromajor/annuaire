"use client";

import { useState } from "react";

export default function MonProfilPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    await fetch("/api/mon-profil/demande", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Toujours afficher "envoyé" (pas de fuite d'info)
    setStatus("sent");
  }

  return (
    <main className="min-h-screen bg-[#fff8f0] pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1a1a2e] py-14 text-center">
        <div className="bd-halftone absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-xl px-4">
          <div className="bd-onomatopee mb-4 inline-block -rotate-2 text-4xl text-[#ffd93d]">
            Modifiez votre fiche !
          </div>
          <h1 className="bd-titre mb-3 text-4xl text-white">Mon profil artisan</h1>
          <p className="text-gray-300">
            Recevez un lien sécurisé par email pour mettre à jour votre fiche en quelques secondes.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-md px-4 pt-12">
        {status === "sent" ? (
          <div className="bd-card p-8 text-center">
            <div className="mb-3 text-5xl">📬</div>
            <h2 className="bd-titre mb-2 text-2xl text-[#1a1a2e]">Email envoyé !</h2>
            <p className="text-gray-600">
              Si cet email correspond à une fiche artisan, vous recevrez un lien de modification
              valable <strong>1 heure</strong>.
            </p>
            <p className="mt-3 text-sm text-gray-400">Vérifiez aussi vos spams.</p>
          </div>
        ) : (
          <div className="bd-card p-8">
            <div className="bd-bubble mb-6 text-sm">
              🔒 Zéro mot de passe. On vous envoie un lien unique directement sur votre email
              professionnel.
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
                  Votre email artisan <span className="text-[#ff6b6b]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bd-input"
                  placeholder="jean@mon-entreprise.fr"
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-400">
                  L&apos;email avec lequel vous vous êtes inscrit sur OyezArtisans.
                </p>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="bd-btn bd-btn-primary w-full disabled:opacity-60"
              >
                {status === "loading" ? "⏳ Envoi..." : "📨 Recevoir mon lien de modification"}
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
