"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "resend_confirmation_cooldown_until";

export default function ResendConfirmationButton({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);

  // Lire le cooldown stocké en localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const until = parseInt(stored, 10);
      const diff = Math.ceil((until - Date.now()) / 1000);
      if (diff > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCooldownUntil(until);

        setRemaining(diff);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Compte à rebours du cooldown
  useEffect(() => {
    if (!cooldownUntil) return;
    const tick = () => {
      const diff = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (diff <= 0) {
        setCooldownUntil(null);

        setStatus("idle");
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setRemaining(diff);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  async function handleResend() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/mon-espace/resend-confirmation", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string; nextAllowedAt?: number };

      if (!res.ok) {
        if (res.status === 429 && data.nextAllowedAt) {
          const diff = Math.ceil((data.nextAllowedAt - Date.now()) / 1000);
          setCooldownUntil(data.nextAllowedAt);
          setRemaining(diff > 0 ? diff : 0);
          localStorage.setItem(STORAGE_KEY, String(data.nextAllowedAt));
          setStatus("sent"); // on traite ça comme "déjà envoyé"
        } else {
          setErrorMsg(data.error ?? "Une erreur est survenue.");
          setStatus("error");
        }
        return;
      }

      if (data.nextAllowedAt) {
        const diff = Math.ceil((data.nextAllowedAt - Date.now()) / 1000);
        setCooldownUntil(data.nextAllowedAt);
        setRemaining(diff > 0 ? diff : 0);
        localStorage.setItem(STORAGE_KEY, String(data.nextAllowedAt));
      }
      setStatus("sent");
    } catch {
      setErrorMsg("Impossible de contacter le serveur.");
      setStatus("error");
    }
  }

  const isCooling = cooldownUntil !== null && remaining > 0;

  return (
    <div
      className="col-span-full rounded-2xl border-4 border-[#ffd93d] bg-[#fffbea] p-5"
      style={{ boxShadow: "5px 5px 0 #ffd93d" }}
    >
      <p className="bd-titre mb-1 text-lg text-[#1a1a2e]">
        � Confirmez votre email pour publier votre fiche
      </p>
      <p className="mb-1 text-sm text-gray-700">
        Un email de confirmation a été envoyé à <strong className="text-[#1a1a2e]">{email}</strong>.
        Cliquez sur le lien dans cet email pour que votre fiche soit visible publiquement.
      </p>
      <p className="mb-4 text-sm text-gray-500">
        Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams, ou renvoyez-le ci-dessous.
      </p>

      {status === "sent" && !isCooling && (
        <p className="mb-2 text-sm font-bold text-[#6bcb77]">✅ Lien de vérification renvoyé !</p>
      )}
      {status === "sent" && isCooling && (
        <p className="mb-2 text-sm font-bold text-[#6bcb77]">
          ✅ Email envoyé — patientez {Math.floor(remaining / 60)}m{remaining % 60}s avant de
          renvoyer.
        </p>
      )}
      {status === "error" && <p className="mb-2 text-sm font-bold text-[#ff6b6b]">{errorMsg}</p>}

      <button
        onClick={handleResend}
        disabled={status === "loading" || isCooling}
        className="rounded-xl border-2 border-[#1a1a2e] bg-white px-4 py-2 text-sm font-black text-[#1a1a2e] shadow-[3px_3px_0_#1a1a2e] transition-all hover:bg-[#ffd93d] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "loading"
          ? "Envoi…"
          : isCooling
            ? `Renvoyer dans ${Math.floor(remaining / 60)}m${remaining % 60}s`
            : "Renvoyer le lien de vérification →"}
      </button>
    </div>
  );
}
