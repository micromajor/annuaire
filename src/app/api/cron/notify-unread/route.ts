import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { sendMessagesNonLusDigest } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;
const DELAY_MINUTES = 15; // Envoyer après 15 min sans lecture

/**
 * GET /api/cron/notify-unread
 *
 * Cron job qui envoie des emails de notification pour les messages non lus.
 * - Ne notifie que les messages créés il y a plus de DELAY_MINUTES minutes
 * - Ne notifie qu'une seule fois par message (notificationSentAt)
 * - Agrège par destinataire (1 seul email même si plusieurs messages)
 *
 * Protégé par header Authorization: Bearer <CRON_SECRET>
 */
export async function GET(req: NextRequest) {
  // Vérification du secret
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!CRON_SECRET || token !== CRON_SECRET) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const now = new Date();
  const delayThreshold = new Date(now.getTime() - DELAY_MINUTES * 60 * 1000);
  // Pour éviter de retraiter des messages trop vieux (sécurité), on limite à 24h
  const maxAge = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Récupérer les messages non lus, non notifiés, créés entre 15 min et 24h
  const messagesANotifier = await prisma.message.findMany({
    where: {
      lu: false,
      notificationSentAt: null,
      createdAt: {
        lte: delayThreshold, // créé il y a plus de 15 min
        gte: maxAge, // mais moins de 24h
      },
    },
    include: {
      conversation: {
        include: {
          artisan: {
            select: { id: true, email: true, prenom: true, nom: true, raisonSociale: true },
          },
          particulier: {
            select: { id: true, email: true, prenom: true, nom: true, raisonSociale: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (messagesANotifier.length === 0) {
    return NextResponse.json({ success: true, notified: 0 });
  }

  // Grouper par destinataire
  // Le destinataire est l'opposé de l'expéditeur
  const parDestinataire = new Map<
    string,
    {
      email: string;
      nom: string;
      messages: Array<{
        id: string;
        contenu: string;
        expediteurNom: string;
        conversationId: string;
      }>;
    }
  >();

  for (const msg of messagesANotifier) {
    const conv = msg.conversation;
    const isExpArtisan = msg.expediteur === "artisan";

    // Le destinataire est celui qui n'a PAS envoyé le message
    const destinataire = isExpArtisan ? conv.particulier : conv.artisan;
    const expediteur = isExpArtisan ? conv.artisan : conv.particulier;

    if (!destinataire?.email) continue;

    const destId = destinataire.id;
    const destNom = destinataire.prenom ?? destinataire.raisonSociale ?? destinataire.nom ?? "vous";
    const expNom =
      expediteur?.raisonSociale ??
      (`${expediteur?.prenom ?? ""} ${expediteur?.nom ?? ""}`.trim() || "Quelqu'un");

    if (!parDestinataire.has(destId)) {
      parDestinataire.set(destId, {
        email: destinataire.email,
        nom: destNom,
        messages: [],
      });
    }

    parDestinataire.get(destId)!.messages.push({
      id: msg.id,
      contenu: msg.contenu,
      expediteurNom: expNom,
      conversationId: conv.id,
    });
  }

  // Envoyer les emails et marquer comme notifiés
  let notified = 0;
  const messageIdsNotified: string[] = [];

  for (const [, data] of parDestinataire) {
    try {
      await sendMessagesNonLusDigest({
        destinataireEmail: data.email,
        destinataireNom: data.nom,
        messages: data.messages.map((m) => ({
          expediteurNom: m.expediteurNom,
          apercu: m.contenu.length > 100 ? m.contenu.slice(0, 100) + "…" : m.contenu,
          conversationId: m.conversationId,
        })),
      });
      notified++;
      messageIdsNotified.push(...data.messages.map((m) => m.id));
    } catch (err) {
      console.error("[cron/notify-unread] Échec email pour", data.email, err);
    }
  }

  // Marquer les messages comme notifiés
  if (messageIdsNotified.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: messageIdsNotified } },
      data: { notificationSentAt: now },
    });
  }

  return NextResponse.json({
    success: true,
    notified,
    messagesProcessed: messageIdsNotified.length,
  });
}
