"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/mon-espace";

  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { exists: boolean };
    setLoading(false);
    setIsNew(!data.exists);
    setStep("password");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isNew) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Erreur lors de la création du compte.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("artisan", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Mot de passe incorrect.");
      return;
    }
    // Nouveau compte — choix du profil
    if (isNew) {
      router.push("/bienvenue");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <div
      className="w-full max-w-sm rounded-2xl border-4 border-[#1a1a1a] bg-white p-8"
      style={{ boxShadow: "6px 6px 0 #1a1a1a" }}
    >
      <div className="mb-6 text-center">
        <Link href="/" className="bd-titre text-2xl text-[#1a1a2e]">
          🔨 OyezArtisans
        </Link>
        <p className="mt-1 text-sm text-gray-500">
          {step === "email"
            ? "Connexion à votre espace"
            : isNew
              ? `Créer un compte pour ${email}`
              : `Connexion en tant que ${email}`}
        </p>
      </div>

      {step === "email" && (
        <>
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
              />
            </svg>
            Continuer avec Google
          </button>

          <div className="mb-4 flex items-center gap-3 text-xs text-gray-400">
            <div className="flex-1 border-t border-gray-200" />
            ou avec votre email
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleEmailNext} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a1a2e]"
              placeholder="votre@email.fr"
            />
            {error && <p className="text-xs font-semibold text-[#ff6b6b]">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border-2 border-[#1a1a2e] bg-[#1a1a2e] py-3 text-sm font-bold text-white hover:bg-[#2a2a4e] disabled:opacity-60"
            >
              {loading ? "Vérification…" : "Continuer →"}
            </button>
          </form>
        </>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          {isNew && (
            <p className="rounded-lg bg-[#6bcb77]/20 px-3 py-2 text-xs font-semibold text-[#1a1a2e]">
              ✨ Nouveau compte — choisissez un mot de passe
            </p>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            minLength={8}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a1a2e]"
            placeholder={isNew ? "Choisir un mot de passe (8 car. min)" : "Mot de passe"}
          />
          {error && <p className="text-xs font-semibold text-[#ff6b6b]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border-2 border-[#1a1a2e] bg-[#1a1a2e] py-3 text-sm font-bold text-white hover:bg-[#2a2a4e] disabled:opacity-60"
          >
            {loading ? "…" : isNew ? "Créer mon espace →" : "Se connecter →"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
              setPassword("");
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            ← Changer d&apos;email
          </button>
        </form>
      )}

      <p className="mt-5 text-center text-xs text-gray-400">
        En continuant, vous acceptez nos{" "}
        <Link href="/mentions-legales" className="underline">
          conditions d&apos;utilisation
        </Link>
        .
      </p>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#ffd93d] px-4">
      <div
        className="bd-onomatopee mb-6 -rotate-2 text-4xl text-[#1a1a2e]"
        style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}
      >
        Mon espace
      </div>
      <Suspense>
        <ConnexionForm />
      </Suspense>
      <p className="mt-5 text-xs text-[#1a1a2e]/50">
        <Link href="/" className="hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </main>
  );
}
