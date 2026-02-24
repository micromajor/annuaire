import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

interface SiretApiResult {
  nom_complet?: string;
  siege?: {
    siret?: string;
    code_postal?: string;
    commune?: string;
    activite_principale?: string;
    libelle_activite_principale?: string;
    etat_administratif?: string;
  };
}

interface SiretApiResponse {
  results?: SiretApiResult[];
  total_results?: number;
}

export interface SiretVerifData {
  found: boolean;
  actif?: boolean;
  nomOfficiel?: string;
  commune?: string;
  naf?: string;
  nafLibelle?: string;
  siretOfficiel?: string;
}

const siretSchema = z
  .string()
  .length(14)
  .regex(/^\d{14}$/, "Le SIRET doit contenir exactement 14 chiffres");

export async function GET(req: NextRequest) {
  const siret = req.nextUrl.searchParams.get("siret") ?? "";

  const parsed = siretSchema.safeParse(siret);
  if (!parsed.success) {
    return NextResponse.json({ found: false, error: "Format SIRET invalide" }, { status: 400 });
  }

  try {
    const url = `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&per_page=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // cache 1h côté serveur
    });

    if (!res.ok) {
      return NextResponse.json(
        { found: false, error: "API entreprises indisponible" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as SiretApiResponse;
    const result = data.results?.[0];

    if (!result) {
      return NextResponse.json<SiretVerifData>({ found: false });
    }

    const siege = result.siege;
    const actif = siege?.etat_administratif === "A";

    return NextResponse.json<SiretVerifData>({
      found: true,
      actif,
      nomOfficiel: result.nom_complet ?? undefined,
      commune: siege?.commune ?? undefined,
      naf: siege?.activite_principale ?? undefined,
      nafLibelle: siege?.libelle_activite_principale ?? undefined,
      siretOfficiel: siege?.siret ?? siret,
    });
  } catch {
    return NextResponse.json(
      { found: false, error: "Erreur lors de la vérification" },
      { status: 502 }
    );
  }
}
