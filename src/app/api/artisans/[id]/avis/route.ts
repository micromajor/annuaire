import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { avisSchema } from "@/lib/validators/schemas";
import { z } from "zod";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: artisanId } = await params;

  // Vérifier que l'artisan existe et est validé
  const artisan = await prisma.artisan.findFirst({
    where: { id: artisanId, status: "VALIDE", deletedAt: null },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  let data: z.infer<typeof avisSchema> & { avisToken?: string };
  try {
    const body = (await req.json()) as unknown;
    data = avisSchema.extend({ avisToken: z.string().min(1) }).parse(body);
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 422 });
  }

  // Valider le token
  const contact = await prisma.contactRequest.findFirst({
    where: {
      avisToken: data.avisToken,
      artisanId,
      avisUsed: false,
    },
  });
  if (!contact) {
    return NextResponse.json(
      {
        error:
          "Lien invalide ou déjà utilisé. Vous ne pouvez laisser qu\'un seul avis par demande de contact.",
      },
      { status: 403 }
    );
  }

  // Créer l'avis + marquer le token utilisé
  await prisma.$transaction([
    prisma.avis.create({
      data: {
        artisanId,
        auteurPrenom: data.auteurPrenom,
        auteurEmail: data.auteurEmail,
        note: data.note,
        commentaire: data.commentaire,
        status: "EN_ATTENTE",
      },
    }),
    prisma.contactRequest.update({
      where: { id: contact.id },
      data: { avisUsed: true },
    }),
  ]);

  return NextResponse.json({ ok: true }, { status: 201 });
}
