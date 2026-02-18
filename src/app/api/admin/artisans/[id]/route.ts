import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const patchSchema = z.object({
  action: z.enum(["valider", "rejeter"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Action invalide." }, { status: 422 });
  }

  const artisan = await prisma.artisan.findFirst({
    where: { id, deletedAt: null },
    include: {
      metiers: true,
      communes: true,
    },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  const { action } = result.data;

  // Cas 1 : artisan VALIDE avec un draft en attente
  if (artisan.status === "VALIDE" && artisan.hasPendingDraft && artisan.draftData) {
    if (action === "valider") {
      const draft = artisan.draftData as {
        raisonSociale?: string | null;
        siret?: string | null;
        telephone?: string | null;
        siteWeb?: string | null;
        logoUrl?: string | null;
        description?: string | null;
        metierSlugs: string[];
        communeIds: string[];
      };

      const metiers = await prisma.metier.findMany({
        where: { slug: { in: draft.metierSlugs } },
      });
      const communes = await prisma.commune.findMany({
        where: { id: { in: draft.communeIds } },
      });

      await prisma.$transaction([
        prisma.artisanMetier.deleteMany({ where: { artisanId: id } }),
        prisma.artisanCommune.deleteMany({ where: { artisanId: id } }),
        prisma.artisan.update({
          where: { id },
          data: {
            raisonSociale: draft.raisonSociale ?? null,
            siret: draft.siret || null,
            telephone: draft.telephone ?? null,
            siteWeb: draft.siteWeb || null,
            logoUrl: draft.logoUrl || null,
            description: draft.description ?? null,
            hasPendingDraft: false,
            draftData: Prisma.DbNull,
            metiers: { create: metiers.map((m) => ({ metierId: m.id })) },
            communes: { create: communes.map((c) => ({ communeId: c.id })) },
          },
        }),
      ]);
    } else {
      // Rejeter le draft → fiche live intacte, on efface juste le draft
      await prisma.artisan.update({
        where: { id },
        data: { hasPendingDraft: false, draftData: Prisma.DbNull },
      });
    }
    return NextResponse.json({ success: true, status: "VALIDE" });
  }

  // Cas 2 : nouvelle inscription EN_ATTENTE
  const newStatus = action === "valider" ? "VALIDE" : "REJETE";
  const updated = await prisma.artisan.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json({ success: true, status: updated.status });
}
