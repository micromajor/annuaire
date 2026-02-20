"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = (await res.json()) as { error?: string };
      setError(d.error ?? "Une erreur est survenue.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/connexion"), 3000);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#ffd93d] px-4">
      <div
        className="bd-onomatopee mb-6 -rotate-2 text-4xl text-[#1a1a2e]"
        style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}
      >
        Nouveau mot de passe
      </div>

      <div
        className="w-full max-w-sm rounded-2xl border-4 border-[#1a1a1a] bg-white p-8"
        style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
      >
        <div className="mb-6 text-center">
          <Link href="/" className="bd-titre text-2xl text-[#1a1a2e]">
            Oyez Artisans !
          </Link>
          <p className="mt-1 text-sm text-gray-500">Choisissez un nouveau mot de passe</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-4xl">✅</p>
            <p className="font-bold text-[#1a1a2e]">Mot de passe mis à jour !</p>
            <p className="text-xs text-gray-400">Redirection vers la connexion…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              minLength={8}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a1a2e]"
              placeholder="Nouveau mot de passe (8 car. min)"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a1a2e]"
              placeholder="Confirmer le mot de passe"
            />
            {error && <p className="text-xs font-semibold text-[#ff6b6b]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-2 border-[#1a1a2e] bg-[#1a1a2e] py-3 text-sm font-bold text-white hover:bg-[#2a2a4e] disabled:opacity-60"
            >
              {loading ? "…" : "Enregistrer →"}
            </button>
            <Link
              href="/connexion"
              className="text-center text-xs text-gray-400 underline hover:text-gray-600"
            >
              ← Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
