import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";
import { Resend } from "resend";
import { randomBytes } from "crypto";

const resend =
  process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_placeholder"
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const bodySchema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const result = bodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Email invalide." }, { status: 422 });
  }

  const { email } = result.data;

  // On ne révèle pas si l'email existe ou non (sécurité)
  const artisan = await prisma.artisan.findFirst({
    where: { email, deletedAt: null },
  });

  if (artisan) {
    // Invalider les anciens tokens non utilisés
    await prisma.editToken.updateMany({
      where: { artisanId: artisan.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Créer un nouveau token (expire dans 1h)
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.editToken.create({
      data: { token, artisanId: artisan.id, expiresAt },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";
    const editUrl = `${baseUrl}/mon-profil/${token}`;
    const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;

    if (resend) {
      await resend.emails.send({
        from: "OyezArtisans <noreply@oyezartisans.fr>",
        to: email,
        subject: "🔗 Votre lien de modification de fiche OyezArtisans",
        html: `
          <h2>Bonjour ${artisan.prenom},</h2>
          <p>Vous avez demandé à modifier votre fiche <strong>${nomAffiche}</strong> sur OyezArtisans.</p>
          <p>
            <a href="${editUrl}" style="background:#ffd93d;color:#1a1a1a;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block;">
              ✏️ Modifier ma fiche →
            </a>
          </p>
          <p style="color:#999;font-size:12px;">Ce lien est valable 1 heure et ne peut être utilisé qu'une seule fois.<br>Si vous n'avez pas fait cette demande, ignorez cet email.</p>
        `,
      });
    } else {
      // Dev : log le lien dans la console serveur
      console.log(`\n[DEV] Lien de modification : ${editUrl}\n`);
    }
  }

  // Toujours la même réponse (pas de fuite d'info)
  return NextResponse.json({ success: true });
}
