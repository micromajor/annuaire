"use client";

import { useRouter } from "next/navigation";

interface SearchBarProps {
  currentSearch?: string;
  currentMetiers?: string[];
  currentCommune?: string;
}

export default function SearchBar({
  currentSearch,
  currentMetiers = [],
  currentCommune,
}: SearchBarProps) {
  const router = useRouter();

  function handleSearch(value: string): void {
    const params = new URLSearchParams();
    for (const m of currentMetiers) params.append("metier", m);
    if (currentCommune) params.set("commune", currentCommune);
    if (value.trim()) params.set("q", value.trim());
    router.push(`/artisans${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="relative">
      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="search"
        defaultValue={currentSearch ?? ""}
        placeholder="Rechercher un artisan, un métier…"
        className="w-full rounded-xl border-3 border-[#1a1a1a] bg-white py-3 pr-4 pl-10 text-sm font-semibold text-[#1a1a2e] outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#ffd93d]"
        style={{ boxShadow: "3px 3px 0 #1a1a1a" }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch((e.target as HTMLInputElement).value);
          }
        }}
      />
    </div>
  );
}
