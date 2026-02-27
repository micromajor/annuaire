import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { sendEmailVerification } from "@/lib/email";
import crypto from "crypto";

// Rate limit : 1 renvoi toutes les 10 minutes par artisan (en mémoire)
const COOLDOWN_MS = 10 * 60 * 1000;
const resendLimitMap = new Map<string, number>(); // artisanId → lastSentAt

export async function POST() {
  const session = await auth();
  const artisanId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!artisanId || role !== "artisan") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Vérifier que l'artisan est bien EN_ATTENTE (pas VALIDE, pas REJETE)
  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: {
      status: true,
      email: true,
      prenom: true,
      passwordHash: true,
      emailVerificationToken: true,
      metiers: { select: { artisanId: true }, take: 1 },
    },
  });

  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });
  }

  if (artisan.status !== "EN_ATTENTE") {
    return NextResponse.json(
      { error: "Cette action n'est disponible qu'en attente de validation." },
      { status: 400 }
    );
  }

  if (artisan.metiers.length === 0) {
    return NextResponse.json(
      { error: "Complétez d'abord votre fiche avant de renvoyer l'email." },
      { status: 400 }
    );
  }

  // Compte sans mot de passe = compte Google OAuth (devrait être auto-validé — cas de migration)
  if (!artisan.passwordHash) {
    return NextResponse.json(
      {
        error:
          "Votre compte Google sera validé automatiquement à votre prochaine connexion. Déconnectez-vous et reconnectez-vous avec Google.",
      },
      { status: 400 }
    );
  }

  // Rate limit
  const now = Date.now();
  const lastSent = resendLimitMap.get(artisanId);
  if (lastSent && now - lastSent < COOLDOWN_MS) {
    const nextAllowedAt = lastSent + COOLDOWN_MS;
    return NextResponse.json(
      {
        error: "Vous avez déjà demandé un renvoi récemment. Patientez quelques minutes.",
        nextAllowedAt,
      },
      { status: 429 }
    );
  }

  resendLimitMap.set(artisanId, now);
  const nextAllowedAt = now + COOLDOWN_MS;

  // Réutiliser le token existant ou en générer un nouveau si absent/expiré
  let token = artisan.emailVerificationToken;
  if (!token) {
    token = crypto.randomBytes(32).toString("hex");
    await prisma.artisan.update({
      where: { id: artisanId },
      data: { emailVerificationToken: token },
    });
  }

  await sendEmailVerification({
    destinataireEmail: artisan.email,
    prenomArtisan: artisan.prenom || "artisan",
    token,
  });

  return NextResponse.json({ ok: true, nextAllowedAt });
}
