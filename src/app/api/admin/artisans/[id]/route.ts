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
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
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
        // Nouveau format (depuis refacto communePairs)
        communePairs?: { nom: string; codePostal: string }[];
        // Ancien format (legacy)
        communeIds?: string[];
      };

      const metiers = await prisma.metier.findMany({
        where: { slug: { in: draft.metierSlugs } },
      });

      // Résoudre les communes selon le format du draft
      let communes: { id: string }[];
      if (draft.communePairs && draft.communePairs.length > 0) {
        // Nouveau format : upsert pour garantir l'existence en DB
        communes = await Promise.all(
          draft.communePairs.map((pair) =>
            prisma.commune.upsert({
              where: { nom_codePostal: { nom: pair.nom, codePostal: pair.codePostal } },
              create: { nom: pair.nom, codePostal: pair.codePostal },
              update: {},
            })
          )
        );
      } else {
        // Ancien format : lookup par IDs
        communes = await prisma.commune.findMany({
          where: { id: { in: draft.communeIds ?? [] } },
        });
      }

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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const artisan = await prisma.artisan.findFirst({ where: { id, deletedAt: null } });
  if (!artisan) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  // Suppression définitive — toutes les relations cascadent (avis, messages,
  // conversations, oAuthAccounts, metiers, communes, besoins)
  await prisma.artisan.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
