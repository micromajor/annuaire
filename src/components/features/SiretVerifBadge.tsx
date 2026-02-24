"use client";

import { useState, useEffect } from "react";
import type { SiretVerifData } from "@/app/api/artisans/verify-siret/route";

interface Props {
  siret: string | null | undefined;
  /** Callback optionnel pour pré-remplir la raison sociale */
  onNomOfficiel?: (nom: string) => void;
}

function parseSiret(raw: string | null | undefined): string {
  return (raw ?? "").replace(/\s/g, "");
}

export default function SiretVerifBadge({ siret, onNomOfficiel }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SiretVerifData | null>(null);

  const clean = parseSiret(siret);
  const validFormat = /^\d{14}$/.test(clean);

  useEffect(() => {
    const s = parseSiret(siret);

    if (!/^\d{14}$/.test(s)) {
      return;
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    setResult(null);

    fetch(`/api/artisans/verify-siret?siret=${s}`)
      .then((r) => r.json() as Promise<SiretVerifData>)
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setLoading(false);
        if (data.found && data.actif && data.nomOfficiel) {
          onNomOfficiel?.(data.nomOfficiel);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setResult({ found: false });
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [siret, onNomOfficiel]);

  if (!validFormat) return null;

  if (loading) {
    return (
      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
        Vérification en cours…
      </p>
    );
  }

  if (!result) return null;

  if (!result.found) {
    return (
      <p className="mt-1 text-xs font-semibold text-[#ff6b6b]">
        ⚠️ SIRET introuvable dans la base officielle
      </p>
    );
  }

  if (!result.actif) {
    return (
      <div className="mt-1 rounded-lg border-2 border-orange-300 bg-orange-50 px-3 py-1.5 text-xs">
        <p className="font-bold text-orange-700">⚠️ Établissement cessé</p>
        {result.nomOfficiel && <p className="text-orange-600">{result.nomOfficiel}</p>}
      </div>
    );
  }

  return (
    <div className="mt-1 rounded-lg border-2 border-green-300 bg-green-50 px-3 py-1.5 text-xs">
      <p className="font-bold text-green-700">✓ SIRET valide — établissement actif</p>
      {result.nomOfficiel && (
        <p className="text-green-700">
          <span className="font-semibold">{result.nomOfficiel}</span>
          {result.commune && <span className="text-green-500"> · {result.commune}</span>}
        </p>
      )}
      {result.nafLibelle && (
        <p className="text-green-500">
          Activité&nbsp;: {result.nafLibelle}
          {result.naf && <span className="ml-1 text-green-400">({result.naf})</span>}
        </p>
      )}
    </div>
  );
}
