"use client";

import dynamic from "next/dynamic";

const CarteZoneLecture = dynamic(() => import("@/components/features/CarteZoneLecture"), {
  ssr: false,
});

interface Props {
  communeNoms: string[];
}

export default function CarteZoneLectureWrapper({ communeNoms }: Props) {
  return <CarteZoneLecture communeNoms={communeNoms} />;
}
