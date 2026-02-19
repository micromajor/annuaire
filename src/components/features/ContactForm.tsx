"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { contactFormSchema, type ContactFormData } from "@/lib/validators/schemas";
import { TYPES_TRAVAUX } from "@/constants";
import ToolsConfetti from "@/components/ui/ToolsConfetti";

const MAX_PHOTOS = 6;

interface ContactFormProps {
  artisanId: string;
  artisanNom: string;
}

export default function ContactForm({ artisanId, artisanNom }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({ ...data, artisanId, photos }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      setStatus("success");
      reset();
      setPhotos([]);
    } catch {
      setStatus("error");
    }
  };

  async function handlePhotoUpload(files: FileList) {
    setPhotoError(null);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setPhotoError(`Maximum ${MAX_PHOTOS} photos.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    const fd = new FormData();
    toUpload.forEach((f) => fd.append("files", f));
    setUploading(true);
    try {
      const res = await fetch("/api/upload/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setPhotoError(data.error ?? "Erreur upload");
      } else {
        setPhotos((prev) => [...prev, ...(data.urls as string[])].slice(0, MAX_PHOTOS));
      }
    } catch {
      setPhotoError("Erreur réseau lors de l'upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

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

      {/* Photos de chantier */}
      <div>
        <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
          Photos du chantier{" "}
          <span className="font-normal text-gray-400">(optionnel, max {MAX_PHOTOS})</span>
        </label>
        {photos.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div
                key={url}
                className="group relative h-20 w-20 overflow-hidden rounded-lg border-2 border-[#1a1a2e]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((u) => u !== url))}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Supprimer"
                >
                  <span className="rounded-full bg-[#ff6b6b] px-1.5 py-0.5 text-xs font-black text-white">
                    &#10005;
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-[#1a1a2e]/30 bg-[#fafafa] px-4 py-3 text-sm font-semibold text-[#1a1a2e] transition-colors hover:border-[#1a1a2e] hover:bg-[#fff8f0] ${
              uploading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <span>&#128444;</span>
            <span>
              {uploading
                ? "Upload en cours…"
                : `Ajouter des photos (${MAX_PHOTOS - photos.length} restant${MAX_PHOTOS - photos.length > 1 ? "s" : ""})`}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
            />
          </label>
        )}
        {photoError && <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">{photoError}</p>}
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
