import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const patchSchema = z.object({
  raisonSociale: z.string().optional(),
  siret: z
    .string()
    .regex(/^\d{14}$/, "SIRET invalide")
    .optional()
    .or(z.literal("")),
  telephone: z.string().optional(),
  siteWeb: z.string().url("URL invalide").optional().or(z.literal("")),
  logoUrl: z
    .string()
    .max(500)
    .refine(
      (v) => v === "" || v.startsWith("/api/files/") || /^https?:\/\//.test(v),
      "URL de logo invalide"
    )
    .optional()
    .or(z.literal("")),
  description: z.string().max(500).optional(),
  metierSlugs: z.array(z.string()).min(1, "Au moins un métier requis"),
  communeIds: z.array(z.string()).min(1, "Au moins une commune requise"),
});

// GET — vérifie que le token est valide et retourne les données de la fiche
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const editToken = await prisma.editToken.findUnique({
    where: { token },
    include: {
      artisan: {
        include: {
          metiers: { include: { metier: true } },
          communes: { include: { commune: true } },
        },
      },
    },
  });

  if (!editToken || editToken.usedAt || editToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 401 });
  }

  const { artisan } = editToken;
  return NextResponse.json({
    artisan: {
      id: artisan.id,
      prenom: artisan.prenom,
      nom: artisan.nom,
      email: artisan.email,
      raisonSociale: artisan.raisonSociale,
      siret: artisan.siret,
      telephone: artisan.telephone,
      siteWeb: artisan.siteWeb,
      logoUrl: artisan.logoUrl,
      description: artisan.description,
      metierSlugs: artisan.metiers.map((m) => m.metier.slug),
      communeIds: artisan.communes.map((c) => c.communeId),
    },
  });
}

// PATCH — applique les modifications et repasse la fiche EN_ATTENTE
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const editToken = await prisma.editToken.findUnique({
    where: { token },
    include: { artisan: true },
  });

  if (!editToken || editToken.usedAt || editToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const data = result.data;
  const artisanId = editToken.artisanId;
  const artisan = editToken.artisan;

  // Récupérer les métiers et communes valides
  const metiers = await prisma.metier.findMany({
    where: { slug: { in: data.metierSlugs } },
  });
  const communes = await prisma.commune.findMany({
    where: { id: { in: data.communeIds } },
  });

  if (artisan.status === "VALIDE") {
    // Artisan déjà publié → stocker en draft, fiche live intacte
    await prisma.$transaction([
      prisma.artisan.update({
        where: { id: artisanId },
        data: {
          hasPendingDraft: true,
          draftData: {
            raisonSociale: data.raisonSociale ?? null,
            siret: data.siret || null,
            telephone: data.telephone ?? null,
            siteWeb: data.siteWeb || null,
            logoUrl: data.logoUrl || null,
            description: data.description ?? null,
            metierSlugs: data.metierSlugs,
            communeIds: data.communeIds,
            metierLabels: metiers.map((m) => m.label),
            communeLabels: communes.map((c) => c.nom),
          },
        },
      }),
      prisma.editToken.update({
        where: { id: editToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
  } else {
    // Nouvelle inscription EN_ATTENTE → modifier directement
    // NOTE: PrismaPg + composite @@id → nested creates échouent silencieusement.
    await prisma.$transaction(async (tx) => {
      await tx.artisanMetier.deleteMany({ where: { artisanId } });
      await tx.artisanCommune.deleteMany({ where: { artisanId } });
      await tx.artisan.update({
        where: { id: artisanId },
        data: {
          raisonSociale: data.raisonSociale ?? null,
          siret: data.siret || null,
          telephone: data.telephone ?? null,
          siteWeb: data.siteWeb || null,
          logoUrl: data.logoUrl || null,
          description: data.description ?? null,
        },
      });
      for (const m of metiers) {
        await tx.artisanMetier.create({ data: { artisanId, metierId: m.id } });
      }
      for (const c of communes) {
        await tx.artisanCommune.create({ data: { artisanId, communeId: c.id } });
      }
      await tx.editToken.update({
        where: { id: editToken.id },
        data: { usedAt: new Date() },
      });
    });
  }

  return NextResponse.json({ success: true });
}
