"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { COMMUNES_NANTES_EST } from "@/constants";
import Image from "next/image";

interface Commune {
  id: string;
  nom: string;
  codePostal: string;
}

interface InitialData {
  prenom: string;
  nom: string;
  email: string;
  raisonSociale: string;
  siret: string;
  telephone: string;
  siteWeb: string;
  logoUrl: string;
  description: string;
  metierSlugs: string[];
  communeIds: string[];
}

interface EditProfilFormProps {
  token: string;
  initialData: InitialData;
  communes: Commune[];
  metiers: { slug: string; label: string }[];
}

interface FormValues {
  raisonSociale: string;
  siret: string;
  telephone: string;
  siteWeb: string;
  logoUrl: string;
  description: string;
}

export default function EditProfilForm({
  token,
  initialData,
  communes,
  metiers,
}: EditProfilFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedMetiers, setSelectedMetiers] = useState<string[]>(initialData.metierSlugs);
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>(initialData.communeIds);
  const [logoPreview, setLogoPreview] = useState(initialData.logoUrl);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      raisonSociale: initialData.raisonSociale,
      siret: initialData.siret,
      telephone: initialData.telephone,
      siteWeb: initialData.siteWeb,
      logoUrl: initialData.logoUrl,
      description: initialData.description,
    },
  });

  const logoUrlValue = watch("logoUrl");

  function toggleMetier(slug: string) {
    setSelectedMetiers((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleCommune(id: string) {
    setSelectedCommunes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function onSubmit(data: FormValues) {
    if (selectedMetiers.length === 0) return;
    if (selectedCommunes.length === 0) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/mon-profil/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          metierSlugs: selectedMetiers,
          communeIds: selectedCommunes,
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
      <div className="bd-card p-10 text-center">
        <div className="mb-3 text-5xl">🎉</div>
        <h2 className="bd-titre mb-2 text-2xl text-[#1a1a2e]">Fiche mise à jour !</h2>
        <p className="text-gray-600">
          Votre fiche est <strong>en cours de revalidation</strong> par notre équipe. Elle sera
          remise en ligne sous 48h.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {/* Info non modifiable */}
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white/60 p-4 text-sm text-gray-500">
        📧 Fiche liée à <strong className="text-[#1a1a2e]">{initialData.email}</strong> —{" "}
        {initialData.prenom} {initialData.nom}
      </div>

      {/* SECTION 1 — Identité */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-5 text-xl text-[#1a1a2e]">👤 Identité</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-bold">Raison sociale</label>
            <input {...register("raisonSociale")} className="bd-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">SIRET</label>
            <input {...register("siret")} className="bd-input" maxLength={14} />
            {errors.siret && <p className="mt-1 text-sm text-[#ff6b6b]">{errors.siret.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Téléphone</label>
            <input {...register("telephone")} type="tel" className="bd-input" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold">Site web</label>
            <input
              {...register("siteWeb")}
              type="url"
              className="bd-input"
              placeholder="https://"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-sm font-bold">
            Description <span className="text-xs font-normal text-gray-400">(500 car. max)</span>
          </label>
          <textarea {...register("description")} className="bd-input min-h-[100px] resize-none" />
        </div>
      </section>

      {/* SECTION 2 — Logo */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-2 text-xl text-[#1a1a2e]">🖼️ Logo</h2>
        <p className="mb-4 text-sm text-gray-500">
          Collez l&apos;URL de votre logo (site web, Google Business, LinkedIn...).
        </p>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <input
              {...register("logoUrl")}
              type="url"
              className="bd-input"
              placeholder="https://monsite.fr/logo.png"
              onBlur={() => setLogoPreview(logoUrlValue)}
            />
          </div>
          {logoPreview && (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-[#1a1a1a] bg-white">
              <Image
                src={logoPreview}
                alt="Aperçu logo"
                width={64}
                height={64}
                className="h-full w-full object-contain"
                onError={() => setLogoPreview("")}
                unoptimized
              />
            </div>
          )}
        </div>
        <button
          type="button"
          className="mt-2 text-xs text-gray-400 underline"
          onClick={() => setLogoPreview(logoUrlValue)}
        >
          Prévisualiser
        </button>
      </section>

      {/* SECTION 3 — Métiers */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-2 text-xl text-[#1a1a2e]">🔧 Métiers</h2>
        <div className="flex flex-wrap gap-2">
          {metiers.map((m) => {
            const isSelected = selectedMetiers.includes(m.slug);
            return (
              <button
                key={m.slug}
                type="button"
                onClick={() => toggleMetier(m.slug)}
                className={`bd-badge cursor-pointer transition-all ${isSelected ? "bd-badge-jaune scale-105 shadow-md" : "bd-badge-rouge opacity-60 hover:opacity-100"}`}
                style={{ border: "2px solid #1a1a1a" }}
              >
                {isSelected ? "✓ " : ""}
                {m.label}
              </button>
            );
          })}
        </div>
        {selectedMetiers.length === 0 && (
          <p className="mt-2 text-sm text-[#ff6b6b]">Au moins un métier requis.</p>
        )}
      </section>

      {/* SECTION 4 — Communes */}
      <section className="bd-card p-6">
        <h2 className="bd-titre mb-2 text-xl text-[#1a1a2e]">📍 Zone d&apos;intervention</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {communes.map((c) => {
            const isSelected = selectedCommunes.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCommune(c.id)}
                className={`rounded-lg border-2 border-[#1a1a1a] px-3 py-2 text-left text-sm font-bold transition-all ${isSelected ? "bg-[#ffd93d] shadow-md" : "bg-white opacity-60 hover:bg-[#fff8f0] hover:opacity-100"}`}
              >
                {isSelected ? "✓ " : ""}
                <span className="block">{c.nom}</span>
                <span className="block text-xs font-normal text-gray-400">{c.codePostal}</span>
              </button>
            );
          })}
        </div>
        {selectedCommunes.length === 0 && (
          <p className="mt-2 text-sm text-[#ff6b6b]">Au moins une commune requise.</p>
        )}
      </section>

      {status === "error" && (
        <div className="rounded-xl border-2 border-[#ff6b6b] bg-red-50 p-4 text-sm text-[#ff6b6b]">
          ⚠️ {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={
          status === "loading" || selectedMetiers.length === 0 || selectedCommunes.length === 0
        }
        className="bd-btn bd-btn-primary w-full py-4 text-lg disabled:opacity-60"
      >
        {status === "loading" ? "⏳ Enregistrement..." : "💾 Enregistrer les modifications"}
      </button>
    </form>
  );
}
