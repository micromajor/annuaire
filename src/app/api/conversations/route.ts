import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  artisanId: z.string().min(1),
  sujet: z.string().min(1).max(200),
  premierMessage: z.string().min(1).max(2000),
});

// POST /api/conversations — initier (ou reprendre) une conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  if (!session || role !== "particulier" || !userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const { artisanId, sujet, premierMessage } = parsed.data;

  // Vérifier que l'artisan existe et est validé
  const artisan = await prisma.artisan.findFirst({
    where: { id: artisanId, status: "VALIDE", deletedAt: null },
    select: { id: true },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });
  }

  // Créer ou retrouver la conversation existante
  let conversation = await prisma.conversation.findUnique({
    where: { artisanId_particulierId: { artisanId, particulierId: userId } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { artisanId, particulierId: userId, sujet },
    });
  }

  // Ajouter le message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      expediteur: "particulier",
      contenu: premierMessage,
    },
  });

  // Mettre à jour updatedAt de la conversation
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}

// GET /api/conversations — liste des conversations de l'utilisateur
export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  if (!session || !["artisan", "particulier"].includes(role ?? "") || !userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const where = role === "artisan" ? { artisanId: userId } : { particulierId: userId };

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      artisan: {
        select: { id: true, prenom: true, nom: true, raisonSociale: true, logoUrl: true },
      },
      particulier: { select: { id: true, prenom: true, nom: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  // Compter les non lus par conversation
  const nonLusParConv = await Promise.all(
    conversations.map((c) =>
      prisma.message.count({
        where: {
          conversationId: c.id,
          lu: false,
          expediteur: role === "artisan" ? "particulier" : "artisan",
        },
      })
    )
  );

  const result = conversations.map((c, i) => ({
    id: c.id,
    sujet: c.sujet,
    updatedAt: c.updatedAt,
    artisan: c.artisan,
    particulier: c.particulier,
    dernierMessage: c.messages[0] ?? null,
    nonLus: nonLusParConv[i],
  }));

  return NextResponse.json(result);
}
