"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type FeedbackType = "BUG" | "SUGGESTION" | "AUTRE";

const TYPES: { value: FeedbackType; label: string; emoji: string }[] = [
  { value: "BUG", label: "Signaler un bug", emoji: "🐛" },
  { value: "SUGGESTION", label: "Suggérer une idée", emoji: "💡" },
  { value: "AUTRE", label: "Autre retour", emoji: "💬" },
];

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("BUG");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);

  // Verrouiller le scroll du body à l'ouverture
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fermer sur Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const reset = () => {
    setType("BUG");
    setMessage("");
    setEmail("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    setOpen(false);
    if (status === "success") reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message,
          email: email || undefined,
          pageUrl: pathname,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur inconnue");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur serveur");
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Envoyer un retour"
        className="fixed right-5 bottom-5 z-40 flex items-center gap-2 rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] px-4 py-2.5 text-sm font-bold text-[#1a1a1a] shadow-[3px_3px_0_#1a1a1a] transition-transform hover:scale-105 active:scale-95"
        style={{ fontFamily: "var(--font-nunito)" }}
      >
        <span className="text-base">💬</span>
        <span className="hidden sm:inline">Votre avis</span>
      </button>

      {/* Overlay + Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end p-5 sm:items-center sm:justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-2xl border-4 border-[#1a1a1a] bg-white p-6 shadow-[6px_6px_0_#1a1a1a]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
          >
            {status === "success" ? (
              <div className="py-4 text-center">
                <div className="mb-3 text-5xl">🎉</div>
                <p className="bd-titre text-2xl text-[#1a1a2e]">Merci !</p>
                <p className="mt-2 text-sm text-gray-600">
                  Votre retour a bien été enregistré. Il nous aide à améliorer Oyez Artisans !
                </p>
                <button
                  onClick={handleClose}
                  className="mt-5 rounded-full border-2 border-[#1a1a1a] bg-[#6bcb77] px-6 py-2 font-bold text-[#1a1a2e] shadow-[2px_2px_0_#1a1a1a] hover:brightness-105"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 id="feedback-title" className="bd-titre text-xl text-[#1a1a2e]">
                    Votre retour
                  </h2>
                  <button
                    onClick={handleClose}
                    className="rounded-full border-2 border-[#1a1a1a] bg-[#f5f5f5] px-2.5 py-0.5 text-lg leading-none font-bold hover:bg-[#e0e0e0]"
                    aria-label="Fermer"
                  >
                    ×
                  </button>
                </div>

                <p className="mb-4 text-xs text-gray-500">
                  Oyez Artisans ! est en cours de lancement — vos retours nous aident à nous
                  améliorer.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type */}
                  <div className="flex gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        className={`flex flex-1 flex-col items-center rounded-xl border-2 p-2.5 text-xs font-bold transition-all ${
                          type === t.value
                            ? "border-[#1a1a1a] bg-[#ffd93d] shadow-[2px_2px_0_#1a1a1a]"
                            : "border-gray-300 bg-[#f5f5f5] hover:border-[#1a1a1a]"
                        }`}
                      >
                        <span className="text-xl">{t.emoji}</span>
                        <span className="mt-1 text-center leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="feedback-message"
                      className="mb-1 block text-sm font-bold text-[#1a1a2e]"
                    >
                      Votre message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="feedback-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={4}
                      placeholder={
                        type === "BUG"
                          ? "Décrivez le bug : que s'est-il passé ? Sur quelle page ?"
                          : type === "SUGGESTION"
                            ? "Quelle fonctionnalité vous manque ? Quel problème cela résoudrait ?"
                            : "Partagez votre retour..."
                      }
                      className="w-full rounded-xl border-2 border-[#1a1a1a] p-3 text-sm focus:ring-2 focus:ring-[#ffd93d] focus:outline-none"
                    />
                    <p className="mt-0.5 text-right text-xs text-gray-400">{message.length}/1000</p>
                  </div>

                  {/* Email optionnel */}
                  <div>
                    <label
                      htmlFor="feedback-email"
                      className="mb-1 block text-sm font-bold text-[#1a1a2e]"
                    >
                      Votre email{" "}
                      <span className="font-normal text-gray-400">
                        (optionnel — pour qu&apos;on puisse vous répondre)
                      </span>
                    </label>
                    <input
                      id="feedback-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.fr"
                      className="w-full rounded-xl border-2 border-[#1a1a1a] p-3 text-sm focus:ring-2 focus:ring-[#ffd93d] focus:outline-none"
                    />
                  </div>

                  {/* Erreur */}
                  {status === "error" && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
                      {errorMsg}
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-full border-2 border-[#1a1a1a] bg-[#ffd93d] py-2.5 font-bold text-[#1a1a2e] shadow-[3px_3px_0_#1a1a1a] transition-transform hover:scale-[1.02] disabled:opacity-60"
                  >
                    {status === "loading" ? "Envoi en cours…" : "Envoyer mon retour"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
