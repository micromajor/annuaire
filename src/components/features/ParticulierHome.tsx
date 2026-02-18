"use client";

import { useState } from "react";
import HeroSearch from "@/components/features/HeroSearch";
import { type METIERS, COMMUNES_NANTES_EST } from "@/constants";

type Tab = "recherche" | "projet";

const MAX_PHOTOS = 6;

interface ParticulierHomeProps {
  prenom: string | null;
  metiers: typeof METIERS;
}

/* ============================================================
   Formulaire de dépôt de besoin
   ============================================================ */
function BesoinForm({
  prenomInitial,
  metiers,
}: {
  prenomInitial: string | null;
  metiers: typeof METIERS;
}) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metierSlug, setMetierSlug] = useState("");
  const [commune, setCommune] = useState("");
  const [description, setDescription] = useState("");
  const [prenom, setPrenom] = useState(prenomInitial ?? "");

  // Photos
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    setPhotos((prev) => {
      const slots = MAX_PHOTOS - prev.length;
      const next = incoming.slice(0, slots).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
    // reset input pour permettre re-sélection du même fichier
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Upload des photos si présentes
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((p) => fd.append("files", p.file));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!upRes.ok) {
          const d = (await upRes.json()) as { error?: string };
          throw new Error(d.error ?? "Erreur upload photos");
        }
        const { urls } = (await upRes.json()) as { urls: string[] };
        photoUrls = urls;
      }

      // 2. Créer le besoin
      const res = await fetch("/api/besoins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metierSlug, commune, description, prenom, photos: photoUrls }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de l'envoi");
      }
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="bd-bubble mx-auto max-w-lg py-16 text-center">
        <p className="bd-onomatopee mb-4 text-6xl" style={{ transform: "rotate(-2deg)" }}>
          Top !
        </p>
        <p className="mb-2 text-xl font-black text-[#1a1a2e]">Annonce publiée 🎉</p>
        <p className="text-sm font-semibold text-[#1a1a2e]/60">
          Les artisans de votre zone seront notifiés. Attendez-vous à être contacté rapidement !
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bd-card mx-auto w-full max-w-xl space-y-5 p-6 text-left"
    >
      <h2 className="bd-titre text-2xl text-[#1a1a2e]">Décrivez votre projet</h2>

      {/* Prénom */}
      <div>
        <label className="mb-1 block text-sm font-black text-[#1a1a2e]">Votre prénom</label>
        <input
          required
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Ex : Camille"
          className="bd-input w-full"
        />
      </div>

      {/* Métier */}
      <div>
        <label className="mb-1 block text-sm font-black text-[#1a1a2e]">
          Quel type d&apos;artisan cherchez-vous ?
        </label>
        <select
          required
          value={metierSlug}
          onChange={(e) => setMetierSlug(e.target.value)}
          className="bd-input w-full"
          style={{ background: "white" }}
        >
          <option value="">— Choisir un métier —</option>
          {metiers.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Commune */}
      <div>
        <label className="mb-1 block text-sm font-black text-[#1a1a2e]">
          Où se situe votre chantier ?
        </label>
        <select
          required
          value={commune}
          onChange={(e) => setCommune(e.target.value)}
          className="bd-input w-full"
          style={{ background: "white" }}
        >
          <option value="">— Choisir une commune —</option>
          {COMMUNES_NANTES_EST.map((c) => (
            <option key={c.nom} value={c.nom}>
              {c.nom} ({c.codePostal})
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-black text-[#1a1a2e]">
          Décrivez votre besoin
          <span className="ml-1 font-normal text-[#1a1a2e]/40">({description.length}/1000)</span>
        </label>
        <textarea
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : refaire la toiture d'une maison de 120m², tuiles à remplacer côté nord…"
          className="bd-input w-full resize-none"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="mb-2 block text-sm font-black text-[#1a1a2e]">
          Photos du chantier
          <span className="ml-1 font-normal text-[#1a1a2e]/40">
            ({photos.length}/{MAX_PHOTOS} — optionnel)
          </span>
        </label>

        {/* Grille de previews */}
        {photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-[#1a1a1a]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1a1a1a] bg-white text-xs font-black opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bouton d'ajout */}
        {photos.length < MAX_PHOTOS && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-3 border-dashed border-[#1a1a1a]/30 bg-white/50 py-4 text-sm font-bold text-[#1a1a2e]/50 transition-colors hover:border-[#60c5f1] hover:text-[#1a1a2e]"
            >
              📷 Ajouter des photos
              <span className="text-xs font-normal">(JPG/PNG/WEBP · max 5 Mo/photo)</span>
            </button>
          </>
        )}
      </div>

      {error && (
        <p className="rounded-lg border-2 border-red-400 bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
          ⚠️ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bd-btn w-full py-3 text-base disabled:opacity-60"
        style={{ background: "#60c5f1", color: "#1a1a2e", boxShadow: "4px 4px 0 #1a1a1a" }}
      >
        {loading ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-[#1a1a2e] border-t-transparent" />
        ) : (
          "Publier mon annonce →"
        )}
      </button>
    </form>
  );
}

export default function ParticulierHome({ prenom, metiers }: ParticulierHomeProps) {
  const [tab, setTab] = useState<Tab>("recherche");

  return (
    <div className="relative z-10 w-full max-w-5xl">
      {/* Salutation */}
      <div className="mb-8 text-center">
        <span
          className="bd-badge bd-anim-pop inline-flex"
          style={{ background: "#1a1a2e", color: "#60c5f1" }}
        >
          👋 Bonjour {prenom ?? ""} !
        </span>
      </div>

      {/* Toggle centré */}
      <div className="mb-10 flex justify-center">
        <div
          className="flex overflow-hidden rounded-2xl border-3 border-[#1a1a1a]"
          style={{ boxShadow: "4px 4px 0 #1a1a1a" }}
        >
          <button
            onClick={() => setTab("recherche")}
            className="bd-titre px-6 py-3 text-base transition-colors"
            style={
              tab === "recherche"
                ? { background: "#1a1a2e", color: "#60c5f1" }
                : { background: "white", color: "#1a1a2e" }
            }
          >
            🔍 Trouver un artisan
          </button>
          <button
            onClick={() => setTab("projet")}
            className="bd-titre border-l-3 border-[#1a1a1a] px-6 py-3 text-base transition-colors"
            style={
              tab === "projet"
                ? { background: "#1a1a2e", color: "#60c5f1" }
                : { background: "white", color: "#1a1a2e" }
            }
          >
            📋 Mon projet
          </button>
        </div>
      </div>

      {/* Contenu selon l'onglet actif */}
      {tab === "recherche" ? (
        <div className="text-center">
          <h1 className="bd-titre bd-anim-build mb-10 text-5xl leading-tight text-[#1a1a2e] sm:text-7xl">
            Trouvez le bon artisan
          </h1>
          <div className="bd-anim-build" style={{ animationDelay: "0.1s" }}>
            <HeroSearch metiers={metiers} />
          </div>
        </div>
      ) : (
        <div className="bd-anim-build">
          <BesoinForm prenomInitial={prenom} metiers={metiers} />
        </div>
      )}
    </div>
  );
}
