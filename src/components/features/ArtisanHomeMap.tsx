"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry } from "geojson";
import type { PathOptions, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { BesoinItem } from "@/components/features/MatchingBesoins";

const METIER_EMOJIS: Record<string, string> = {
  macon: "🧱",
  plombier: "🔧",
  electricien: "⚡",
  menuisier: "🪵",
  peintre: "🎨",
  couvreur: "🏠",
  carreleur: "🔲",
  chauffagiste: "🔥",
  plaquiste: "🪚",
  charpentier: "🔩",
};

type CommuneFeature = Feature<Geometry, { nom: string; code: string }>;

/* ---- Position initiale ---- */
function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.setView([47.35, -1.55], 9);
  }, [map]);
  return null;
}

/* ---- Mini-carte d'un besoin dans le panneau latéral ---- */
function BesoinCompactCard({ besoin }: { besoin: BesoinItem }) {
  const emoji = METIER_EMOJIS[besoin.metierSlug] ?? "🔧";
  const date = new Date(besoin.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="rounded-xl border-2 border-[#1a1a1a] bg-white p-3 text-left"
      style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
    >
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-tight font-black text-[#1a1a2e]">
            {besoin.prenom} — {besoin.metierLabel}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">{besoin.description}</p>
          <p className="mt-1 text-xs text-gray-400 italic">{date}</p>
        </div>
      </div>

      {besoin.photos.length > 0 && (
        <div className="mt-2 flex gap-1">
          {besoin.photos.slice(0, 3).map((url, i) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={i}
              src={url}
              alt=""
              className="h-12 w-12 rounded-lg border-2 border-[#1a1a1a] object-cover"
            />
          ))}
        </div>
      )}

      <button
        className="bd-btn mt-2 w-full py-1.5 text-xs font-black"
        style={{ background: "#6bcb77", color: "#1a1a2e", boxShadow: "2px 2px 0 #1a1a1a" }}
        onClick={() => alert("Messagerie en cours de développement")}
      >
        💬 Contacter {besoin.prenom} →
      </button>
    </div>
  );
}

/* ============================================================
   Composant principal
   ============================================================ */
export default function ArtisanHomeMap({
  besoins,
  artisanCommunes,
}: {
  besoins: BesoinItem[];
  artisanCommunes: string[];
}) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [geoJsonKey, setGeoJsonKey] = useState(0);
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);

  /* ---- Groupement des besoins par commune ---- */
  const besoinsByCommune = besoins.reduce<Record<string, BesoinItem[]>>((acc, b) => {
    acc[b.commune] = [...(acc[b.commune] ?? []), b];
    return acc;
  }, {});
  const communesWithBesoins = new Set(Object.keys(besoinsByCommune));
  const artisanCommunesSet = new Set(artisanCommunes);

  /* ---- Chargement GeoJSON dept 44 ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "https://geo.api.gouv.fr/departements/44/communes?fields=nom,code,contour&format=geojson&geometry=contour"
        );
        if (!res.ok) throw new Error();
        const geojson = await res.json();
        if (!cancelled) setGeoData(geojson);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Re-render GeoJSON quand les données changent */
  useEffect(() => {
    setGeoJsonKey((k) => k + 1);
  }, [besoins, artisanCommunes]);

  /* ---- Couleurs ---- */
  function styleFeature(feature?: CommuneFeature): PathOptions {
    const nom = feature?.properties?.nom ?? "";
    const inZone = artisanCommunesSet.has(nom);
    const hasBesoin = communesWithBesoins.has(nom);

    if (inZone && hasBesoin) {
      /* 🔥 Demande dans votre zone — or/jaune fort */
      return { fillColor: "#ffd93d", fillOpacity: 0.9, color: "#1a1a2e", weight: 3 };
    }
    if (hasBesoin) {
      /* ❗ Demande hors zone — rouge */
      return { fillColor: "#ff6b6b", fillOpacity: 0.75, color: "#1a1a2e", weight: 2 };
    }
    if (inZone) {
      /* ✅ Votre zone sans demande — vert */
      return { fillColor: "#6bcb77", fillOpacity: 0.5, color: "#1a1a2e", weight: 2 };
    }
    return { fillColor: "#fff8f0", fillOpacity: 0.2, color: "#1a1a2e", weight: 0.5 };
  }

  /* ---- Interactions ---- */
  function onEachFeature(feature: CommuneFeature, layer: Layer) {
    const nom = feature.properties.nom;
    const communeBesoins = besoinsByCommune[nom];
    const leafletLayer = layer as import("leaflet").Path;

    /* Tooltip */
    let tooltipLabel = nom;
    if (communeBesoins?.length === 1) {
      const b = communeBesoins[0];
      tooltipLabel = `${nom} · ${METIER_EMOJIS[b.metierSlug] ?? "🔧"} ${b.metierLabel} (${b.prenom})`;
    } else if (communeBesoins?.length > 1) {
      const metiers = [...new Set(communeBesoins.map((b) => b.metierLabel))].join(", ");
      tooltipLabel = `${nom} · ${communeBesoins.length} demandes — ${metiers}`;
    }

    leafletLayer.bindTooltip(tooltipLabel, {
      permanent: false,
      direction: "center",
      className: "leaflet-tooltip-bd",
    });

    /* Clic → ouvrir panneau */
    if (communeBesoins) {
      layer.on("click", () => setSelectedCommune(nom));
    }

    layer.on("mouseover", () => leafletLayer.setStyle({ fillOpacity: 0.95, weight: 3 }));
    layer.on("mouseout", () => leafletLayer.setStyle(styleFeature(feature)));
  }

  /* ---- États de chargement ---- */
  if (loading) {
    return (
      <div
        className="flex h-[460px] animate-pulse items-center justify-center rounded-2xl bg-[#fff8f0] text-sm font-bold text-gray-400"
        style={{ border: "3px solid #1a1a1a" }}
      >
        🗺️ Chargement de la carte Loire-Atlantique…
      </div>
    );
  }
  if (error || !geoData) {
    return (
      <div
        className="flex h-[460px] items-center justify-center rounded-2xl bg-[#fff8f0] text-sm font-bold text-[#ff6b6b]"
        style={{ border: "3px solid #ff6b6b" }}
      >
        Impossible de charger la carte. Vérifiez votre connexion.
      </div>
    );
  }

  const selectedBesoins = selectedCommune ? (besoinsByCommune[selectedCommune] ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Carte + panneau lateral (desktop) / empilement (mobile) ---- */}
      <div className="flex flex-col items-start gap-4 sm:flex-row">
        {/* ---- Carte ---- */}
        <div className={selectedCommune ? "w-full min-w-0 sm:flex-1" : "w-full"}>
          {/* Légende */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs font-bold text-[#1a1a2e]/60">
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-5 rounded"
                style={{ background: "#6bcb77", border: "2px solid #1a1a2e" }}
              />
              Votre zone
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-5 rounded"
                style={{ background: "#ff6b6b", border: "2px solid #1a1a2e" }}
              />
              Demandes hors zone
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-3 w-5 rounded"
                style={{ background: "#ffd93d", border: "2px solid #1a1a2e" }}
              />
              🔥 Demandes dans votre zone
            </span>
          </div>

          {/* Carte Leaflet */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "3px solid #1a1a1a", boxShadow: "4px 4px 0 #1a1a1a", height: 400 }}
          >
            <MapContainer
              center={[47.35, -1.55]}
              zoom={9}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
              />
              <GeoJSON
                key={geoJsonKey}
                data={geoData}
                style={(f) => styleFeature(f as CommuneFeature)}
                onEachFeature={(f, l) => onEachFeature(f as CommuneFeature, l)}
              />
              <FitBounds />
            </MapContainer>
          </div>

          {besoins.length === 0 && (
            <p className="mt-3 text-center text-xs font-bold text-[#1a1a2e]/40">
              Aucune demande dans votre zone pour l&apos;instant.
            </p>
          )}
        </div>

        {/* ---- Panneau latéral commune sélectionnée (desktop uniquement) ---- */}
        {selectedCommune && (
          <div className="hidden w-72 shrink-0 sm:block">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="bd-titre text-lg text-[#1a1a2e]">📍 {selectedCommune}</h3>
              <button
                onClick={() => setSelectedCommune(null)}
                className="rounded-lg border-2 border-[#1a1a1a] bg-white px-2 py-1 text-xs font-bold hover:bg-gray-50"
              >
                ✕
              </button>
            </div>
            <p className="mb-2 text-xs font-black tracking-widest text-[#1a1a2e]/40 uppercase">
              {selectedBesoins.length} demande{selectedBesoins.length > 1 ? "s" : ""}
            </p>
            <div className="flex max-h-[370px] flex-col gap-2 overflow-y-auto pr-1">
              {selectedBesoins.map((b) => (
                <BesoinCompactCard key={b.id} besoin={b} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---- Panneau mobile commune sélectionnée (sous la carte) ---- */}
      {selectedCommune && (
        <div className="sm:hidden">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="bd-titre text-lg text-[#1a1a2e]">📍 {selectedCommune}</h3>
            <button
              onClick={() => setSelectedCommune(null)}
              className="rounded-lg border-2 border-[#1a1a1a] bg-white px-2 py-1 text-xs font-bold hover:bg-gray-50"
            >
              ✕
            </button>
          </div>
          <p className="mb-2 text-xs font-black tracking-widest text-[#1a1a2e]/40 uppercase">
            {selectedBesoins.length} demande{selectedBesoins.length > 1 ? "s" : ""}
          </p>
          <div className="flex flex-col gap-2">
            {selectedBesoins.map((b) => (
              <BesoinCompactCard key={b.id} besoin={b} />
            ))}
          </div>
        </div>
      )}

      {/* Tooltip CSS */}
      <style>{`
        .leaflet-tooltip-bd {
          background: #1a1a2e;
          border: 2px solid #1a1a2e;
          border-radius: 8px;
          color: #ffd93d;
          font-family: 'Bangers', 'Impact', sans-serif;
          font-size: 12px;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
          white-space: nowrap;
          max-width: 280px;
        }
        .leaflet-tooltip-bd::before { display: none; }
      `}</style>
    </div>
  );
}
