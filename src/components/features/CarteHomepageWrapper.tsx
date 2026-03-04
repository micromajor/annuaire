"use client";

import dynamic from "next/dynamic";

interface CommuneCount {
  slug: string;
  nom: string;
  count: number;
}

const CarteHomepage = dynamic(() => import("@/components/features/CarteHomepage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-80 animate-pulse items-center justify-center rounded-2xl border-4 border-[#1a1a1a] bg-[#fff8f0]">
      <span className="text-sm font-bold text-gray-400">🗺️ Chargement de la carte…</span>
    </div>
  ),
});

interface Props {
  communeCounts: CommuneCount[];
}

export default function CarteHomepageWrapper({ communeCounts }: Props) {
  return <CarteHomepage communeCounts={communeCounts} />;
}
