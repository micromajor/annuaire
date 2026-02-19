import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendNouveauMessageEmail } from "@/lib/email";

async function getConversationAndUser(conversationId: string) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  if (!session || !["artisan", "particulier"].includes(role ?? "") || !userId) {
    return { error: "Non autorisé", status: 401 };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) return { error: "Conversation introuvable", status: 404 };

  // Vérifier que l'utilisateur appartient à cette conversation
  const appartient =
    (role === "artisan" && conversation.artisanId === userId) ||
    (role === "particulier" && conversation.particulierId === userId);

  if (!appartient) return { error: "Accès refusé", status: 403 };

  return { conversation, role, userId };
}

// GET /api/conversations/[id]/messages — récupérer les messages
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getConversationAndUser(id);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { conversation, role } = ctx;

  // Marquer les messages reçus comme lus
  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      expediteur: role === "artisan" ? "particulier" : "artisan",
      lu: false,
    },
    data: { lu: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  const conv = await prisma.conversation.findUnique({
    where: { id: conversation.id },
    include: {
      artisan: {
        select: { id: true, prenom: true, nom: true, raisonSociale: true, logoUrl: true },
      },
      particulier: { select: { id: true, prenom: true, nom: true } },
    },
  });

  return NextResponse.json({ conversation: conv, messages });
}

// POST /api/conversations/[id]/messages — envoyer un message
const messageSchema = z.object({ contenu: z.string().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getConversationAndUser(id);
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });

  const { conversation, role } = ctx;

  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Contenu invalide" }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      expediteur: role!,
      contenu: parsed.data.contenu,
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  // Notification email à l'interlocuteur (fire-and-forget)
  const destinataireId =
    role === "particulier" ? conversation.artisanId : conversation.particulierId;
  const expediteurId = role === "particulier" ? conversation.particulierId : conversation.artisanId;
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
      apercu: parsed.data.contenu,
    });
  }

  return NextResponse.json(message, { status: 201 });
}
