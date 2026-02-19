"use client";

import dynamic from "next/dynamic";

const CarteZone = dynamic(() => import("@/components/features/CarteZone"), { ssr: false });

interface Props {
  communes: Array<{ nom: string; codePostal: string; lat: number; lng: number }>;
}

export default function CarteZoneWrapper({ communes }: Props) {
  return <CarteZone communes={communes} />;
}
