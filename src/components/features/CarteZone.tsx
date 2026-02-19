"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Commune {
  nom: string;
  codePostal: string;
  lat: number;
  lng: number;
}

interface CarteZoneProps {
  communes: Commune[];
}

function getBounds(communes: Commune[]): [[number, number], [number, number]] {
  const lats = communes.map((c) => c.lat);
  const lngs = communes.map((c) => c.lng);
  const pad = 0.05;
  return [
    [Math.min(...lats) - pad, Math.min(...lngs) - pad],
    [Math.max(...lats) + pad, Math.max(...lngs) + pad],
  ];
}

export default function CarteZone({ communes }: CarteZoneProps) {
  // Fix Leaflet default icon issue with webpack
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).L?.Icon?.Default?.prototype?._getIconUrl;
  }, []);

  if (communes.length === 0) return null;

  const bounds = getBounds(communes);

  return (
    <MapContainer
      bounds={bounds}
      scrollWheelZoom={false}
      className="h-48 w-full rounded-xl border-2 border-[#1a1a1a] sm:h-56"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {communes.map((c) => (
        <CircleMarker
          key={`${c.nom}-${c.codePostal}`}
          center={[c.lat, c.lng]}
          radius={10}
          pathOptions={{
            color: "#1a1a2e",
            fillColor: "#ffd93d",
            fillOpacity: 0.9,
            weight: 2.5,
          }}
        >
          <Tooltip permanent={false} direction="top" offset={[0, -8]}>
            <span className="text-xs font-bold">
              {c.nom} ({c.codePostal})
            </span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
