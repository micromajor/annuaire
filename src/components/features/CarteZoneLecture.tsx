"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import type { GeoJsonObject, Feature, Geometry } from "geojson";
import type { PathOptions, Layer } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  communeNoms: string[];
}

type CommuneFeature = Feature<Geometry, { nom: string; code: string }>;

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    map.setView([47.35, -1.55], 9);
  }, [map]);
  return null;
}

export default function CarteZoneLecture({ communeNoms }: Props) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  function styleFeature(feature?: CommuneFeature): PathOptions {
    const nom = feature?.properties?.nom ?? "";
    const covered = communeNoms.includes(nom);
    return {
      fillColor: covered ? "#6bcb77" : "#fff8f0",
      fillOpacity: covered ? 0.75 : 0.35,
      color: "#1a1a2e",
      weight: covered ? 2.5 : 0.8,
    };
  }

  function onEachFeature(feature: CommuneFeature, layer: Layer) {
    const nom = feature.properties.nom;
    const covered = communeNoms.includes(nom);
    if (covered) {
      (layer as import("leaflet").Path).bindTooltip(nom, {
        permanent: false,
        direction: "center",
        className: "leaflet-tooltip-bd",
      });
    }
  }

  if (loading) {
    return (
      <div
        className="flex h-64 animate-pulse items-center justify-center bg-[#fff8f0] text-sm font-bold text-gray-400"
        style={{ border: "2px solid #1a1a2e", borderRadius: "0.75rem" }}
      >
        &#128506; Chargement de la carte&hellip;
      </div>
    );
  }

  if (error || !geoData) return null;

  return (
    <MapContainer
      center={[47.35, -1.55]}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: "300px", width: "100%", zIndex: 0 }}
      zoomControl
    >
      <FitBounds />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      <GeoJSON
        key={communeNoms.join(",")}
        data={geoData}
        style={(f) => styleFeature(f as CommuneFeature)}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
