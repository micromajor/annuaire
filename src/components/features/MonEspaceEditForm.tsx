"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import SiretVerifBadge from "@/components/features/SiretVerifBadge";

// Leaflet ne fonctionne pas en SSR (uses window)
const MapZoneSelector = dynamic(() => import("@/components/ui/MapZoneSelector"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-80 animate-pulse items-center justify-center rounded-2xl bg-[#fff8f0] text-sm font-bold text-gray-400"
      style={{ border: "3px solid #1a1a1a" }}
    >
      🗺️ Chargement de la carte…
    </div>
  ),
});

type CommunePair = { nom: string; codePostal: string };

type Props = {
  artisan: {
    prenom: string | null;
    nom: string | null;
    raisonSociale: string | null;
    telephone: string | null;
    siret: string | null;
    siteWeb: string | null;
    description: string | null;
    logoUrl: string | null;
    metierSlugs: string[];
    metierLibre?: string | null;
    communePairs: CommunePair[];
    status: string;
  };
  metiers: { slug: string; label: string }[];
};

export default function MonEspaceEditForm({ artisan, metiers }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(!artisan.prenom); // Auto-ouvert si profil incomplet

  const [form, setForm] = useState({
    prenom: artisan.prenom ?? "",
    nom: artisan.nom ?? "",
    raisonSociale: artisan.raisonSociale ?? "",
    telephone: artisan.telephone ?? "",
    siret: artisan.siret ?? "",
    siteWeb: artisan.siteWeb ?? "",
    description: artisan.description ?? "",
    logoUrl: artisan.logoUrl ?? "",
    metierSlugs: artisan.metierSlugs,
    metierLibre: artisan.metierLibre ?? "",
    communePairs: artisan.communePairs,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMetierLibre, setShowMetierLibre] = useState(!!artisan.metierLibre);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoLoading(true);
    setErrors((prev) => {
      const n = { ...prev };
      delete n.logoUrl;
      return n;
    });

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrors((prev) => ({ ...prev, logoUrl: [data.error ?? "Erreur lors de l'upload"] }));
        return;
      }
      setForm((prev) => ({ ...prev, logoUrl: data.url! }));
    } catch {
      setErrors((prev) => ({ ...prev, logoUrl: ["Impossible de contacter le serveur"] }));
    } finally {
      setLogoLoading(false);
    }
  }

  function toggleMulti<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    const res = await fetch("/api/mon-espace/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors(data.details ?? { _: [data.error] });
      return;
    }

    setSuccess(true);
    setOpen(false);
    router.refresh();
  }

  return (
    <div
      className="col-span-full rounded-2xl border-4 border-[#1a1a1a] bg-white"
      style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
    >
      {/* Header de la carte */}
      <div className="flex items-center justify-between border-b-4 border-[#1a1a1a] p-6">
        <div>
          <h2 className="bd-titre text-xl text-[#1a1a2e]">
            {!artisan.prenom ? "⚠️ Complétez votre fiche" : "✏️ Modifier ma fiche"}
          </h2>
          {!artisan.prenom && (
            <p className="mt-1 text-sm text-gray-500">
              Votre profil est incomplet. Renseignez vos informations pour apparaître dans
              l&apos;annuaire.
            </p>
          )}
          {artisan.status === "VALIDE" && artisan.prenom && (
            <p className="mt-1 text-xs font-bold text-[#fb923c]">
              ⚠️ Toute modification remettra votre fiche en attente de validation.
            </p>
          )}
        </div>
        {artisan.prenom && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-xl border-3 border-[#1a1a1a] bg-[#ffd93d] px-4 py-2 text-sm font-black text-[#1a1a2e] hover:bg-[#ffc800]"
            style={{ border: "3px solid #1a1a1a", boxShadow: "2px 2px 0 #1a1a1a" }}
          >
            {open ? "Annuler" : "Modifier"}
          </button>
        )}
      </div>

      {/* Formulaire */}
      {open && (
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Logo */}
          <fieldset>
            <legend className="mb-3 text-sm font-black tracking-wide text-gray-400 uppercase">
              Logo / Photo
            </legend>
            <div className="flex items-center gap-5">
              {/* Aperçu */}
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#fff8f0]"
                style={{ border: "3px solid #1a1a1a" }}
              >
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-3xl">🔨</span>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="logo-upload"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-black text-[#1a1a2e] hover:bg-[#ffc800]"
                  style={{
                    background: "#ffd93d",
                    border: "3px solid #1a1a1a",
                    boxShadow: "2px 2px 0 #1a1a1a",
                    opacity: logoLoading ? 0.6 : 1,
                    pointerEvents: logoLoading ? "none" : "auto",
                  }}
                >
                  {logoLoading ? "⏳ Upload…" : "📁 Choisir une image"}
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoChange}
                  className="sr-only"
                />
                <p className="mt-1.5 text-xs text-gray-400">PNG, JPG, WebP ou SVG · max 2 Mo</p>
                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    className="mt-1 text-xs font-bold text-[#ff6b6b] hover:underline"
                  >
                    Supprimer
                  </button>
                )}
                {errors.logoUrl && (
                  <p className="mt-1 text-xs text-[#ff6b6b]">{errors.logoUrl[0]}</p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Identité */}
          <fieldset>
            <legend className="mb-3 text-sm font-black tracking-wide text-gray-400 uppercase">
              Identité
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
                  Prénom <span className="text-[#ff6b6b]">*</span>
                </label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                  required
                />
                {errors.prenom && <p className="mt-1 text-xs text-[#ff6b6b]">{errors.prenom[0]}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
                  Nom <span className="text-[#ff6b6b]">*</span>
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                  required
                />
                {errors.nom && <p className="mt-1 text-xs text-[#ff6b6b]">{errors.nom[0]}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
                  Raison sociale (optionnel)
                </label>
                <input
                  type="text"
                  value={form.raisonSociale}
                  onChange={(e) => setForm({ ...form, raisonSociale: e.target.value })}
                  placeholder="Ex : Plomberie Dupont SARL"
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                />
              </div>
            </div>
          </fieldset>

          {/* Contact */}
          <fieldset>
            <legend className="mb-3 text-sm font-black tracking-wide text-gray-400 uppercase">
              Contact
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">Site web</label>
                <input
                  type="url"
                  value={form.siteWeb}
                  onChange={(e) => setForm({ ...form, siteWeb: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                />
                {errors.siteWeb && (
                  <p className="mt-1 text-xs text-[#ff6b6b]">{errors.siteWeb[0]}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#1a1a2e]">
                  SIRET{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (obtenir le badge ✓ Pro)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.siret}
                  onChange={(e) =>
                    setForm({ ...form, siret: e.target.value.replace(/\D/g, "").slice(0, 14) })
                  }
                  placeholder="14 chiffres"
                  maxLength={14}
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                />
                {errors.siret && <p className="mt-1 text-xs text-[#ff6b6b]">{errors.siret[0]}</p>}
                <SiretVerifBadge siret={form.siret} />
              </div>
            </div>
          </fieldset>

          {/* Description */}
          <fieldset>
            <legend className="mb-3 text-sm font-black tracking-wide text-gray-400 uppercase">
              Présentation
            </legend>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez votre activité, vos spécialités, votre expérience..."
              rows={4}
              maxLength={2000}
              className="w-full resize-none rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
              style={{ border: "3px solid #1a1a1a" }}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{form.description.length}/2000</p>
          </fieldset>

          {/* Métiers */}
          <fieldset>
            <legend className="mb-3 text-sm font-black tracking-wide text-gray-400 uppercase">
              Métiers <span className="text-[#ff6b6b]">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {metiers.map((m) => {
                const selected = form.metierSlugs.includes(m.slug);
                return (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, metierSlugs: toggleMulti(form.metierSlugs, m.slug) })
                    }
                    className="rounded-full px-4 py-1.5 text-sm font-bold transition-all"
                    style={{
                      border: "3px solid #1a1a1a",
                      background: selected ? "#1a1a2e" : "#fff",
                      color: selected ? "#ffd93d" : "#1a1a2e",
                      boxShadow: selected ? "2px 2px 0 #1a1a1a" : "none",
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
              {/* Bouton Autre */}
              <button
                type="button"
                onClick={() => {
                  const next = !showMetierLibre;
                  setShowMetierLibre(next);
                  if (!next) setForm((f) => ({ ...f, metierLibre: "" }));
                }}
                className="rounded-full px-4 py-1.5 text-sm font-bold transition-all"
                style={{
                  border: "3px solid #1a1a1a",
                  background: showMetierLibre ? "#1a1a2e" : "#fff",
                  color: showMetierLibre ? "#ffd93d" : "#1a1a2e",
                  boxShadow: showMetierLibre ? "2px 2px 0 #1a1a1a" : "none",
                }}
              >
                Autre…
              </button>
            </div>

            {showMetierLibre && (
              <div className="mt-3">
                <input
                  type="text"
                  value={form.metierLibre}
                  onChange={(e) => setForm((f) => ({ ...f, metierLibre: e.target.value }))}
                  placeholder="Ex : Ramoneur, Cuisiniste, Cordiste…"
                  maxLength={80}
                  className="w-full rounded-xl border-3 border-[#1a1a1a] px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#6bcb77]"
                  style={{ border: "3px solid #1a1a1a" }}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Notre équipe examinera votre métier — votre fiche sera validée normalement.
                </p>
              </div>
            )}

            {errors.metierSlugs && (
              <p className="mt-1 text-xs text-[#ff6b6b]">{errors.metierSlugs[0]}</p>
            )}
          </fieldset>

          {/* Communes */}
          <fieldset>
            <legend className="mb-3 text-sm font-black tracking-wide text-gray-400 uppercase">
              Zones d&apos;intervention <span className="text-[#ff6b6b]">*</span>
            </legend>
            <MapZoneSelector
              selected={form.communePairs.map((p) => p.nom)}
              onChange={(pairs) => setForm((prev) => ({ ...prev, communePairs: pairs }))}
            />
            {errors.communePairs && (
              <p className="mt-1 text-xs text-[#ff6b6b]">{errors.communePairs[0]}</p>
            )}
          </fieldset>

          {/* Erreur globale */}
          {errors._ && (
            <p className="rounded-xl bg-[#ff6b6b]/10 px-4 py-3 text-sm font-bold text-[#ff6b6b]">
              {errors._[0]}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 border-t-2 border-gray-100 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bd-btn bd-btn-primary text-sm disabled:opacity-60"
            >
              {loading ? "Enregistrement…" : "💾 Enregistrer ma fiche"}
            </button>
            {success && (
              <span className="text-sm font-bold text-[#6bcb77]">✓ Fiche mise à jour !</span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
