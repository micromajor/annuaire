"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { contactFormSchema, type ContactFormData } from "@/lib/validators/schemas";
import { TYPES_TRAVAUX } from "@/constants";
import ToolsConfetti from "@/components/ui/ToolsConfetti";

interface ContactFormProps {
  artisanId: string;
  artisanNom: string;
}

export default function ContactForm({ artisanId, artisanNom }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, artisanId }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bd-bubble relative overflow-hidden p-8 text-center">
        <ToolsConfetti />
        <span
          className="bd-onomatopee mb-3 block text-4xl"
          style={{
            transform: "rotate(-2deg)",
            animation: "bd-swing 1s ease-in-out infinite alternate",
          }}
        >
          Super !
        </span>
        <p className="text-lg font-bold text-[#1a1a2e]">
          Votre demande a bien été envoyée à {artisanNom} !
        </p>
        <p className="mt-1 text-sm text-gray-500">Un email de confirmation vous a été envoyé.</p>
        <button onClick={() => setStatus("idle")} className="bd-btn bd-btn-outline mt-4 text-sm">
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot antispan */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">Prénom *</label>
          <input {...register("clientPrenom")} className="bd-input" placeholder="Jean" />
          {errors.clientPrenom && (
            <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">
              {errors.clientPrenom.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">Nom *</label>
          <input {...register("clientNom")} className="bd-input" placeholder="Dupont" />
          {errors.clientNom && (
            <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">{errors.clientNom.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">Email *</label>
          <input
            {...register("clientEmail")}
            type="email"
            className="bd-input"
            placeholder="jean@exemple.fr"
          />
          {errors.clientEmail && (
            <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">
              {errors.clientEmail.message}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
            Téléphone <span className="font-normal text-gray-400">(optionnel)</span>
          </label>
          <input
            {...register("clientTel")}
            type="tel"
            className="bd-input"
            placeholder="06 00 00 00 00"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">Type de travaux *</label>
        <select {...register("typeTraux")} className="bd-select">
          <option value="">Sélectionner…</option>
          {TYPES_TRAVAUX.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {errors.typeTraux && (
          <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">{errors.typeTraux.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
          Votre message * <span className="font-normal text-gray-400">(20–1000 caractères)</span>
        </label>
        <textarea
          {...register("message")}
          className="bd-input min-h-[120px] resize-y"
          placeholder="Décrivez vos travaux, la surface, l'urgence…"
        />
        {errors.message && (
          <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">{errors.message.message}</p>
        )}
      </div>

      {/* Consentement RGPD */}
      <div className="flex items-start gap-3">
        <input
          {...register("consent")}
          type="checkbox"
          id="consent"
          className="mt-1 h-4 w-4 cursor-pointer"
        />
        <label htmlFor="consent" className="text-sm text-gray-600">
          J&apos;accepte que mes coordonnées soient transmises à l&apos;artisan dans le cadre de ma
          demande. Voir notre{" "}
          <a href="/politique-confidentialite" className="font-semibold underline">
            politique de confidentialité
          </a>
          . *
        </label>
      </div>
      {errors.consent && (
        <p className="text-xs font-semibold text-[#ff6b6b]">{errors.consent.message}</p>
      )}

      {status === "error" && (
        <div className="rounded border-2 border-[#ff6b6b] bg-red-50 p-3 text-sm font-semibold text-[#ff6b6b]">
          Une erreur est survenue. Veuillez réessayer.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="bd-btn bd-btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Envoi en cours…" : "📩 Envoyer ma demande"}
      </button>
    </form>
  );
}
