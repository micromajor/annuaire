"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inscriptionArtisanSchema, type InscriptionArtisanData } from "@/lib/validators/schemas";
import { COMMUNES_NANTES_EST } from "@/constants";
import ToolsConfetti from "@/components/ui/ToolsConfetti";
import SiretVerifBadge from "@/components/features/SiretVerifBadge";

// Les communes seront passées depuis le server component (avec leurs IDs réels)
interface Commune {
  id: string;
  nom: string;
  codePostal: string;
}

interface InscriptionFormProps {
  communes: Commune[];
  metiers: { slug: string; label: string }[];
}

export default function InscriptionForm({ communes, metiers }: InscriptionFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showMetierLibre, setShowMetierLibre] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InscriptionArtisanData>({
    resolver: zodResolver(inscriptionArtisanSchema),
    defaultValues: {
      metierSlugs: [],
      communeIds: [],
    },
  });

  const selectedMetiers = watch("metierSlugs") ?? [];
  const selectedCommunes = watch("communeIds") ?? [];
  const metierLibreValue = watch("metierLibre") ?? "";
  const siretValue = watch("siret");
  const raisonSocialeValue = watch("raisonSociale");

  const handleNomOfficiel = useCallback(
    (nom: string) => {
      // Pré-remplit la raison sociale seulement si elle est encore vide
      if (!raisonSocialeValue) {
        setValue("raisonSociale", nom, { shouldValidate: false });
      }
    },
    [raisonSocialeValue, setValue]
  );

  function toggleMetier(slug: string) {
    const current = selectedMetiers;
    const updated = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    setValue("metierSlugs", updated, { shouldValidate: true });
  }

  function toggleAutre() {
    const next = !showMetierLibre;
    setShowMetierLibre(next);
    if (!next) {
      setValue("metierLibre", "", { shouldValidate: true });
    }
  }

  function toggleCommune(id: string) {
    const current = selectedCommunes;
    const updated = current.includes(id) ? current.filter((c) => c !== id) : [...current, id];
    setValue("communeIds", updated, { shouldValidate: true });
  }

  async function onSubmit(data: InscriptionArtisanData) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      <div className="bd-card relative overflow-hidden p-8 text-center">
        <ToolsConfetti />
        <div className="bd-onomatopee mb-4 text-5xl" style={{ animation: "bd-swing 0.6s ease" }}>
          ✅ Super !
        </div>
        <h2 className="bd-titre mb-3 text-2xl text-[#1a1a2e]">Inscription reçue !</h2>
        <p className="mb-2 text-gray-600">
          Votre dossier est en cours de vérification par notre équipe.
        </p>
        <p className="text-sm text-gray-400">
          Vous recevrez une confirmation par email sous 48h. On est humains ici 🙂
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* SECTION 1 — Identité */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-5 text-xl text-[#1a1a2e]">👤 Votre identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-bold">
              Prénom <span className="text-[#ff6b6b]">*</span>
            </label>
            <input {...register("prenom")} className="bd-input" placeholder="Jean" />
            {errors.prenom && (
              <p className="mt-1 text-sm text-[#ff6b6b]">{errors.prenom.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">
              Nom <span className="text-[#ff6b6b]">*</span>
            </label>
            <input {...register("nom")} className="bd-input" placeholder="Dupont" />
            {errors.nom && <p className="mt-1 text-sm text-[#ff6b6b]">{errors.nom.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">
              Email professionnel <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              {...register("email")}
              type="email"
              className="bd-input"
              placeholder="jean@mon-entreprise.fr"
            />
            {errors.email && <p className="mt-1 text-sm text-[#ff6b6b]">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Téléphone</label>
            <input
              {...register("telephone")}
              type="tel"
              className="bd-input"
              placeholder="06 12 34 56 78"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold">Raison sociale</label>
            <input
              {...register("raisonSociale")}
              className="bd-input"
              placeholder="Dupont Plomberie SARL"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">
              SIRET{" "}
              <span className="text-xs font-normal text-gray-400">(14 chiffres, optionnel)</span>
            </label>
            <input
              {...register("siret")}
              className="bd-input"
              placeholder="12345678901234"
              maxLength={14}
            />
            {errors.siret && <p className="mt-1 text-sm text-[#ff6b6b]">{errors.siret.message}</p>}
            <SiretVerifBadge siret={siretValue} onNomOfficiel={handleNomOfficiel} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Site web</label>
            <input
              {...register("siteWeb")}
              type="url"
              className="bd-input"
              placeholder="https://mon-site.fr"
            />
            {errors.siteWeb && (
              <p className="mt-1 text-sm text-[#ff6b6b]">{errors.siteWeb.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-sm font-bold">
            Présentez-vous en quelques mots{" "}
            <span className="text-xs font-normal text-gray-400">(optionnel, 500 car. max)</span>
          </label>
          <textarea
            {...register("description")}
            className="bd-input min-h-[100px] resize-none"
            placeholder="Artisan depuis 15 ans, spécialiste de la rénovation de maisons anciennes..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-[#ff6b6b]">{errors.description.message}</p>
          )}
        </div>
      </section>

      {/* SECTION 2 — Métiers */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-2 text-xl text-[#1a1a2e]">🔧 Votre / vos métiers</h2>
        <p className="mb-4 text-sm text-gray-500">Sélectionnez un ou plusieurs métiers.</p>
        <div className="flex flex-wrap gap-2">
          {metiers.map((m) => {
            const isSelected = selectedMetiers.includes(m.slug);
            return (
              <button
                key={m.slug}
                type="button"
                onClick={() => toggleMetier(m.slug)}
                className={`bd-badge cursor-pointer transition-all ${
                  isSelected
                    ? "bd-badge-jaune scale-105 shadow-md"
                    : "bd-badge-rouge opacity-60 hover:opacity-100"
                }`}
                style={{ border: "2px solid #1a1a1a" }}
              >
                {isSelected ? "✓ " : ""}
                {m.label}
              </button>
            );
          })}
          {/* Bouton Autre */}
          <button
            type="button"
            onClick={toggleAutre}
            className={`bd-badge cursor-pointer transition-all ${
              showMetierLibre
                ? "bd-badge-jaune scale-105 shadow-md"
                : "bd-badge-rouge opacity-60 hover:opacity-100"
            }`}
            style={{ border: "2px solid #1a1a1a" }}
          >
            {showMetierLibre ? "✓ " : ""}Autre…
          </button>
        </div>

        {/* Champ texte libre métier */}
        {showMetierLibre && (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-bold">
              Précisez votre métier <span className="text-[#ff6b6b]">*</span>
            </label>
            <input
              {...register("metierLibre")}
              className="bd-input"
              placeholder="Ex : Ramoneur, Cuisiniste, Cordiste…"
              maxLength={80}
            />
            <p className="mt-1 text-xs text-gray-400">
              Notre équipe examinera votre métier — votre fiche sera validée normalement.
            </p>
            {errors.metierLibre && (
              <p className="mt-1 text-sm text-[#ff6b6b]">{errors.metierLibre.message}</p>
            )}
          </div>
        )}

        {/* Erreur métier (refine) — visible seulement si ni slug ni libre */}
        {!showMetierLibre && errors.metierSlugs && (
          <p className="mt-2 text-sm text-[#ff6b6b]">{errors.metierSlugs.message}</p>
        )}
        {showMetierLibre && !metierLibreValue?.trim() && errors.metierSlugs && (
          <p className="mt-2 text-sm text-[#ff6b6b]">{errors.metierSlugs.message}</p>
        )}
      </section>

      {/* SECTION 3 — Zone d'intervention */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-2 text-xl text-[#1a1a2e]">📍 Zone d&apos;intervention</h2>
        <p className="mb-4 text-sm text-gray-500">Sélectionnez les communes où vous intervenez.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {communes.map((c) => {
            const isSelected = selectedCommunes.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCommune(c.id)}
                className={`rounded-lg border-2 border-[#1a1a1a] px-3 py-2 text-left text-sm font-bold transition-all ${
                  isSelected
                    ? "bg-[#ffd93d] shadow-md"
                    : "bg-white opacity-60 hover:bg-[#fff8f0] hover:opacity-100"
                }`}
              >
                {isSelected ? "✓ " : ""}
                <span className="block">{c.nom}</span>
                <span className="block text-xs font-normal text-gray-400">{c.codePostal}</span>
              </button>
            );
          })}
        </div>
        {errors.communeIds && (
          <p className="mt-2 text-sm text-[#ff6b6b]">{errors.communeIds.message}</p>
        )}
      </section>

      {/* SECTION 4 — Consentement */}
      <section className="bd-card p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[#ffd93d]"
            onChange={(e) =>
              setValue("consent", e.target.checked as true, { shouldValidate: true })
            }
          />
          <span className="text-sm text-gray-600">
            J&apos;accepte que mes informations soient publiées sur OyezArtisans et utilisées pour
            la mise en relation avec des clients particuliers. Données traitées conformément au{" "}
            <a href="/mentions-legales" className="underline">
              RGPD
            </a>
            .
          </span>
        </label>
        {errors.consent && <p className="mt-2 text-sm text-[#ff6b6b]">{errors.consent.message}</p>}
      </section>

      {/* Erreur globale */}
      {status === "error" && (
        <div className="rounded-xl border-2 border-[#ff6b6b] bg-red-50 p-4 text-sm text-[#ff6b6b]">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="bd-btn bd-btn-primary w-full py-4 text-lg disabled:opacity-60"
      >
        {status === "loading" ? "⏳ Envoi en cours..." : "🚀 Soumettre mon inscription"}
      </button>
    </form>
  );
}
