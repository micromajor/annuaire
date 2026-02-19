import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { contactFormSchema } from "@/lib/validators/schemas";
import { z } from "zod";

// Rate limiting simple en mémoire (à remplacer par Redis en prod)
const contactRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1h

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    contactRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count += 1;
  return false;
}

const bodySchema = contactFormSchema.extend({
  artisanId: z.string().min(1),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de demandes. Réessayez dans une heure." },
      { status: 429 }
    );
  }

  // Validation
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const parse = bodySchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parse.error.flatten() },
      { status: 422 }
    );
  }

  const {
    artisanId,
    consent: _consent,
    clientPrenom,
    clientNom,
    clientEmail,
    clientTel,
    message,
    typeTraux,
    photos,
  } = parse.data;

  // Vérification artisan
  const artisan = await prisma.artisan.findFirst({
    where: { id: artisanId, status: "VALIDE", deletedAt: null },
  });

  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });
  }

  // Sauvegarde en base
  const avisToken = crypto.randomUUID();
  await prisma.contactRequest.create({
    data: {
      artisanId,
      clientPrenom,
      clientNom,
      clientEmail,
      clientTel: clientTel ?? null,
      message,
      typeTraux,
      avisToken,
      photos: photos ?? [],
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr";
  const avisUrl = `${appUrl}/artisans/${artisanId}?avisToken=${avisToken}#avis`;

  // Email (Resend — sera activé quand la clé API sera configurée)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder") {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.EMAIL_FROM ?? "noreply@example.fr";
      const nomArtisan = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;

      // Email à l'artisan
      await resend.emails.send({
        from,
        to: artisan.email,
        subject: `Nouvelle demande de ${clientPrenom} ${clientNom} — ${typeTraux}`,
        html: `
          <h2>Nouvelle demande de contact</h2>
          <p><strong>De :</strong> ${clientPrenom} ${clientNom}</p>
          <p><strong>Email :</strong> ${clientEmail}</p>
          ${clientTel ? `<p><strong>Téléphone :</strong> ${clientTel}</p>` : ""}
          <p><strong>Type de travaux :</strong> ${typeTraux}</p>
          <hr />
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });

      // Confirmation au client
      await resend.emails.send({
        from,
        to: clientEmail,
        subject: `Votre demande a bien été envoyée à ${nomArtisan}`,
        html: `
          <h2>Demande bien reçue !</h2>
          <p>Bonjour ${clientPrenom},</p>
          <p>Votre demande a été transmise à <strong>${nomArtisan}</strong>. Vous devriez recevoir une réponse sous 48h.</p>
          <p>Récapitulatif de votre message :</p>
          <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
          <hr />
          <p>Une fois vos travaux terminés, vous pouvez laisser un avis sur ${nomArtisan} :</p>
          <p><a href="${avisUrl}" style="background:#ffd93d;color:#1a1a2e;padding:10px 20px;border-radius:8px;font-weight:bold;text-decoration:none;">⭐ Laisser un avis</a></p>
          <p style="font-size:12px;color:#999;">Ce lien est personnel et à usage unique.</p>
        `,
      });
    } catch (emailError) {
      // On ne bloque pas si l'email échoue — la demande est en base
      console.error("Erreur envoi email:", emailError);
    }
  }

  return NextResponse.json(
    { success: true, avisToken, avisUrl: `/artisans/${artisanId}?avisToken=${avisToken}#avis` },
    { status: 201 }
  );
}
