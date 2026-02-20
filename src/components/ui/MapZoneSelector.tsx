"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry } from "geojson";
import type { PathOptions, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  selected: string[]; // noms de communes sélectionnées
  onChange: (communes: { nom: string; codePostal: string }[]) => void;
  departement?: string; // code département INSEE, défaut "44"
};

type CommuneFeature = Feature<Geometry, { nom: string; code: string; codesPostaux?: string[] }>;

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.setView([47.35, -1.55], 9);
  }, [map]);
  return null;
}

export default function MapZoneSelector({ selected, onChange, departement = "44" }: Props) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [communeMap, setCommuneMap] = useState<Map<string, string>>(new Map()); // nom → codePostal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [geoJsonKey, setGeoJsonKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchDepartement() {
      try {
        const res = await fetch(
          `https://geo.api.gouv.fr/departements/${departement}/communes?fields=nom,code,codesPostaux,contour&format=geojson&geometry=contour`
        );
        if (!res.ok) throw new Error("fetch failed");
        const geojson = await res.json();
        if (!cancelled) {
          setGeoData(geojson);
          // Construire la map nom → codePostal une seule fois
          const map = new Map<string, string>();
          (geojson.features as CommuneFeature[]).forEach((f) => {
            map.set(f.properties.nom, f.properties.codesPostaux?.[0] ?? "");
          });
          setCommuneMap(map);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDepartement();
    return () => {
      cancelled = true;
    };
  }, [departement]);

  useEffect(() => {
    setGeoJsonKey((k) => k + 1);
  }, [selected]);

  function styleFeature(feature?: CommuneFeature): PathOptions {
    const nom = feature?.properties?.nom ?? "";
    const isSelected = selected.includes(nom);
    return {
      fillColor: isSelected ? "#6bcb77" : "#fff8f0",
      fillOpacity: isSelected ? 0.75 : 0.4,
      color: "#1a1a2e",
      weight: isSelected ? 3 : 1,
    };
  }

  function onEachFeature(feature: CommuneFeature, layer: Layer) {
    const nom = feature.properties.nom;

    (layer as import("leaflet").Path).bindTooltip(nom, {
      permanent: false,
      direction: "center",
      className: "leaflet-tooltip-bd",
    });

    layer.on("click", () => {
      const newNoms = selected.includes(nom)
        ? selected.filter((n) => n !== nom)
        : [...selected, nom];
      onChange(newNoms.map((n) => ({ nom: n, codePostal: communeMap.get(n) ?? "" })));
    });

    layer.on("mouseover", () => {
      (layer as import("leaflet").Path).setStyle({ fillOpacity: 0.9, weight: 3 });
    });
    layer.on("mouseout", () => {
      (layer as import("leaflet").Path).setStyle(styleFeature(feature));
    });
  }

  if (loading) {
    return (
      <div
        className="flex h-80 animate-pulse items-center justify-center rounded-2xl bg-[#fff8f0] text-sm font-bold text-gray-400"
        style={{ border: "3px solid #1a1a1a" }}
      >
        🗺️ Chargement de la carte Loire-Atlantique…
      </div>
    );
  }

  if (error || !geoData) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-2xl bg-[#fff8f0] text-sm font-bold text-[#ff6b6b]"
        style={{ border: "3px solid #ff6b6b" }}
      >
        Impossible de charger la carte. Vérifiez votre connexion.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs font-bold text-gray-500">
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-5 rounded"
            style={{ background: "#6bcb77", border: "2px solid #1a1a2e" }}
          />
          Sélectionnée
        </span>
        <span className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-5 rounded"
            style={{ background: "#fff8f0", border: "1px solid #1a1a2e" }}
          />
          Cliquer pour ajouter
        </span>
        <span className="ml-auto font-normal text-gray-400">
          {selected.length} commune{selected.length > 1 ? "s" : ""} sélectionnée
          {selected.length > 1 ? "s" : ""}
        </span>
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{ border: "3px solid #1a1a1a", boxShadow: "4px 4px 0 #1a1a1a", height: 420 }}
      >
        <MapContainer
          center={[47.35, -1.55]}
          zoom={9}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          />
          <GeoJSON
            key={geoJsonKey}
            data={geoData}
            style={(feature) => styleFeature(feature as CommuneFeature)}
            onEachFeature={(feature, layer) => onEachFeature(feature as CommuneFeature, layer)}
          />
          <FitBounds />
        </MapContainer>
      </div>

      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {selected.map((nom) => (
            <span
              key={nom}
              className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold"
              style={{ background: "#6bcb77", border: "2px solid #1a1a2e", color: "#1a1a2e" }}
            >
              {nom}
              <button
                type="button"
                onClick={() => {
                  const newNoms = selected.filter((n) => n !== nom);
                  onChange(newNoms.map((n) => ({ nom: n, codePostal: communeMap.get(n) ?? "" })));
                }}
                className="ml-0.5 font-black hover:text-[#ff6b6b]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <style>{`
        .leaflet-tooltip-bd {
          background: #1a1a2e;
          border: 2px solid #1a1a2e;
          border-radius: 8px;
          color: #ffd93d;
          font-family: 'Bangers', 'Impact', sans-serif;
          font-size: 13px;
          letter-spacing: 0.05em;
          padding: 3px 8px;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.3);
        }
        .leaflet-tooltip-bd::before { display: none; }
      `}</style>
    </div>
  );
}
