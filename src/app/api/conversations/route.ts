import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendNouveauMessageEmail } from "@/lib/email";

const particulierSchema = z.object({
  artisanId: z.string().min(1),
  premierMessage: z.string().min(1).max(2000),
  sujet: z.string().max(200).optional(),
});

const artisanSchema = z.object({
  particulierId: z.string().min(1),
  premierMessage: z.string().min(1).max(2000),
  sujet: z.string().max(200).optional(),
});

// POST /api/conversations — initier (ou reprendre) une conversation
export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  if (!session || !["artisan", "particulier"].includes(role ?? "") || !userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();

  let artisanId: string;
  let particulierId: string;
  let sujet: string;
  let premierMessage: string;
  let expediteur: "artisan" | "particulier";

  if (role === "particulier") {
    const parsed = particulierSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    artisanId = parsed.data.artisanId;
    particulierId = userId;
    premierMessage = parsed.data.premierMessage;
    sujet = parsed.data.sujet ?? `Contact depuis OyezArtisans`;
    expediteur = "particulier";

    // Vérifier que l'artisan existe et est validé
    const artisan = await prisma.artisan.findFirst({
      where: { id: artisanId, status: "VALIDE", deletedAt: null },
      select: { id: true },
    });
    if (!artisan) return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });
  } else {
    // role === "artisan"
    const parsed = artisanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    artisanId = userId;
    particulierId = parsed.data.particulierId;
    premierMessage = parsed.data.premierMessage;
    sujet = parsed.data.sujet ?? `Réponse via OyezArtisans`;
    expediteur = "artisan";

    // Vérifier que le particulier existe
    const particulier = await prisma.artisan.findFirst({
      where: { id: particulierId, deletedAt: null },
      select: { id: true },
    });
    if (!particulier)
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Créer ou retrouver la conversation existante
  let conversation = await prisma.conversation.findUnique({
    where: { artisanId_particulierId: { artisanId, particulierId } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { artisanId, particulierId, sujet },
    });
  }

  // Ajouter le message
  await prisma.message.create({
    data: { conversationId: conversation.id, expediteur, contenu: premierMessage },
  });

  // Mettre à jour updatedAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  // Notification email à l'interlocuteur (fire-and-forget)
  const destinataireId = expediteur === "particulier" ? artisanId : particulierId;
  const expediteurId = expediteur === "particulier" ? particulierId : artisanId;
  const [destinataireData, expediteurData] = await Promise.all([
    prisma.artisan.findFirst({
      where: { id: destinataireId },
      select: { email: true, prenom: true, nom: true, raisonSociale: true },
    }),
    prisma.artisan.findFirst({
      where: { id: expediteurId },
      select: { prenom: true, nom: true, raisonSociale: true },
    }),
  ]);
  if (destinataireData?.email) {
    void sendNouveauMessageEmail({
      destinataireEmail: destinataireData.email,
      destinataireNom: destinataireData.prenom ?? destinataireData.raisonSociale ?? "vous",
      expediteurNom:
        expediteurData?.raisonSociale ??
        `${expediteurData?.prenom ?? ""} ${expediteurData?.nom ?? ""}`.trim(),
      conversationId: conversation.id,
      apercu: premierMessage,
    });
  }

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
