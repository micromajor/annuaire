import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const metier = searchParams.get("metier") || undefined;
  const commune = searchParams.get("commune") || undefined;

  const artisans = await prisma.artisan.findMany({
    where: {
      status: "VALIDE",
      deletedAt: null,
      ...(metier ? { metiers: { some: { metier: { slug: metier } } } } : {}),
      ...(commune ? { communes: { some: { commune: { nom: commune } } } } : {}),
    },
    select: {
      id: true,
      prenom: true,
      nom: true,
      raisonSociale: true,
      logoUrl: true,
      siret: true,
      description: true,
      telephone: true,
      siteWeb: true,
      metiers: { select: { metier: { select: { slug: true, label: true } } } },
      communes: { select: { commune: { select: { nom: true } } } },
      avis: { where: { status: "VALIDE" }, select: { note: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 9,
  });

  return NextResponse.json(artisans);
}
