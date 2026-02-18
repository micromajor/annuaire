"use client";

import { useState } from "react";
import type { AvisData } from "@/lib/validators/schemas";

interface AvisFormProps {
  artisanId: string;
  artisanNom: string;
}

const STAR_LABELS = ["", "Mauvais", "Moyen", "Bien", "Très bien", "Excellent"];

export default function AvisForm({ artisanId, artisanNom }: AvisFormProps) {
  const [note, setNote] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AvisData, string>>>({});

  function validate(): boolean {
    const errs: Partial<Record<keyof AvisData, string>> = {};
    if (prenom.length < 2) errs.auteurPrenom = "Prénom requis (2 caractères min)";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.auteurEmail = "Email invalide";
    if (note === 0) errs.note = "Choisissez une note";
    if (commentaire.length < 20) errs.commentaire = "Commentaire trop court (20 caractères min)";
    if (commentaire.length > 800) errs.commentaire = "Commentaire trop long (800 max)";
    if (!consent) errs.consent = "Vous devez accepter les conditions";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/artisans/${artisanId}/avis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auteurPrenom: prenom,
          auteurEmail: email,
          note,
          commentaire,
          consent,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErrorMsg(json.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Impossible de contacter le serveur.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bd-bubble p-8 text-center">
        <div className="mb-3 text-5xl" style={{ animation: "bd-swing 0.6s ease" }}>
          ⭐
        </div>
        <p className="bd-titre text-xl text-[#1a1a2e]">Merci pour votre avis !</p>
        <p className="mt-2 text-sm text-gray-500">
          Il sera publié après vérification par notre équipe (sous 48h).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Étoiles */}
      <div>
        <label className="mb-2 block text-sm font-bold text-[#1a1a2e]">
          Votre note <span className="text-[#ff6b6b]">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setNote(i)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              className="text-4xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
            >
              <span className={i <= (hovered || note) ? "text-[#ffd93d]" : "text-gray-300"}>★</span>
            </button>
          ))}
          {(hovered || note) > 0 && (
            <span className="ml-2 text-sm font-bold text-[#1a1a2e]">
              {STAR_LABELS[hovered || note]}
            </span>
          )}
        </div>
        {fieldErrors.note && <p className="mt-1 text-sm text-[#ff6b6b]">{fieldErrors.note}</p>}
      </div>

      {/* Identité */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
            Votre prénom <span className="text-[#ff6b6b]">*</span>
          </label>
          <input
            className="bd-input"
            placeholder="Jean"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          {fieldErrors.auteurPrenom && (
            <p className="mt-1 text-sm text-[#ff6b6b]">{fieldErrors.auteurPrenom}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
            Votre email <span className="text-[#ff6b6b]">*</span>
          </label>
          <input
            className="bd-input"
            placeholder="jean@exemple.fr"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-400">
            Non publié — sert uniquement à éviter les doublons.
          </p>
          {fieldErrors.auteurEmail && (
            <p className="mt-1 text-sm text-[#ff6b6b]">{fieldErrors.auteurEmail}</p>
          )}
        </div>
      </div>

      {/* Commentaire */}
      <div>
        <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
          Votre avis <span className="text-[#ff6b6b]">*</span>
        </label>
        <textarea
          className="bd-input min-h-[100px] resize-y"
          placeholder={`Décrivez votre expérience avec ${artisanNom}…`}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          maxLength={800}
        />
        <p className="mt-1 flex justify-between text-xs text-gray-400">
          <span className={commentaire.length < 20 ? "font-semibold text-[#ff6b6b]" : ""}>
            {commentaire.length < 20
              ? `${20 - commentaire.length} caractères manquants`
              : "✓ Longueur suffisante"}
          </span>
          <span>{commentaire.length}/800</span>
        </p>
        {fieldErrors.commentaire && (
          <p className="mt-1 text-sm text-[#ff6b6b]">{fieldErrors.commentaire}</p>
        )}
      </div>

      {/* Consentement */}
      <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          J&apos;accepte que mon prénom et avis soient publiés publiquement. Mon email ne sera
          jamais affiché.
        </span>
      </label>
      {fieldErrors.consent && <p className="text-sm text-[#ff6b6b]">{fieldErrors.consent}</p>}

      {errorMsg && (
        <div className="rounded-lg border-2 border-[#ff6b6b] bg-[#fff0f0] p-3 text-sm text-[#ff6b6b]">
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="bd-btn bd-btn-primary w-full disabled:opacity-60"
      >
        {status === "loading" ? "Envoi…" : "⭐ Publier mon avis"}
      </button>
    </form>
  );
}
