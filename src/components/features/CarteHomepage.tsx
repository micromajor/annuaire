"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry } from "geojson";
import type { PathOptions, Layer, LeafletMouseEvent } from "leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

interface CommuneCount {
  slug: string;
  nom: string;
  count: number;
}

interface Props {
  communeCounts: CommuneCount[];
}

type CommuneFeature = Feature<Geometry, { nom: string; code: string }>;

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.setView([47.28, -1.55], 9);
  }, [map]);
  return null;
}

export default function CarteHomepage({ communeCounts }: Props) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();

  // Map de nom → count pour lookup rapide
  const countMap = useMemo(() => {
    const m = new Map<string, CommuneCount>();
    for (const c of communeCounts) {
      m.set(c.nom, c);
    }
    return m;
  }, [communeCounts]);

  useEffect(() => {
    let cancelled = false;
    fetch(
      "https://geo.api.gouv.fr/departements/44/communes?fields=nom,code,contour&format=geojson&geometry=contour"
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((json) => {
        if (!cancelled) setGeoData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const styleFeature = useCallback(
    (feature?: CommuneFeature): PathOptions => {
      const nom = feature?.properties?.nom ?? "";
      const info = countMap.get(nom);
      const hasArtisans = info && info.count > 0;
      return {
        fillColor: hasArtisans ? "#6bcb77" : "#fff8f0",
        fillOpacity: hasArtisans ? 0.7 : 0.25,
        color: "#1a1a2e",
        weight: hasArtisans ? 2 : 0.6,
      };
    },
    [countMap]
  );

  const onEachFeature = useCallback(
    (feature: CommuneFeature, layer: Layer) => {
      const nom = feature.properties.nom;
      const info = countMap.get(nom);
      const count = info?.count ?? 0;

      const tooltipContent =
        count > 0
          ? `<strong>${nom}</strong><br/>${count} artisan${count > 1 ? "s" : ""}`
          : `<strong>${nom}</strong>`;

      (layer as import("leaflet").Path).bindTooltip(tooltipContent, {
        permanent: false,
        direction: "center",
        className: "leaflet-tooltip-bd",
      });

      // Clic → navigation vers l'annuaire filtré par commune
      if (info && count > 0) {
        layer.on({
          click: () => {
            router.push(`/artisans?commune=${info.slug}`);
          },
          mouseover: (e: LeafletMouseEvent) => {
            const target = e.target as import("leaflet").Path;
            target.setStyle({
              fillOpacity: 0.9,
              weight: 3,
            });
          },
          mouseout: (e: LeafletMouseEvent) => {
            const target = e.target as import("leaflet").Path;
            target.setStyle(styleFeature(feature));
          },
        });
        (layer as import("leaflet").Path).getElement?.()?.classList.add("cursor-pointer");
      }
    },
    [countMap, router, styleFeature]
  );

  if (loading) {
    return (
      <div className="flex h-80 animate-pulse items-center justify-center rounded-2xl border-4 border-[#1a1a1a] bg-[#fff8f0]">
        <span className="text-sm font-bold text-gray-400">🗺️ Chargement de la carte…</span>
      </div>
    );
  }

  if (error || !geoData) {
    return null; // Pas de carte si erreur — dégradation gracieuse
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border-4 border-[#1a1a1a]"
      style={{ boxShadow: "5px 5px 0 #1a1a1a" }}
    >
      <MapContainer
        center={[47.28, -1.55]}
        zoom={9}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        className="h-80 w-full sm:h-96"
        style={{ background: "#e8f4fd" }}
      >
        <FitBounds />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        <GeoJSON
          data={geoData}
          style={styleFeature as (feature?: Feature) => PathOptions}
          onEachFeature={onEachFeature as (feature: Feature, layer: Layer) => void}
        />
      </MapContainer>

      {/* Légende */}
      <div className="flex items-center justify-center gap-6 border-t-2 border-[#1a1a1a] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a2e]">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm bg-[#6bcb77]"
            style={{ border: "1px solid #1a1a2e" }}
          />
          Artisans disponibles
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm bg-[#fff8f0]"
            style={{ border: "1px solid #1a1a2e" }}
          />
          Pas encore d&apos;artisan
        </span>
      </div>
    </div>
  );
}
