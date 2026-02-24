"use server";

import { NextRequest, NextResponse } from "next/server";
import { inscriptionArtisanSchema } from "@/lib/validators/schemas";
import { prisma } from "@/lib/db/client";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Rate limiting simple : 3 tentatives / heure / IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans une heure." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const result = inscriptionArtisanSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const data = result.data;

  // Vérifier si un artisan avec cet email existe déjà
  const existingArtisan = await prisma.artisan.findFirst({
    where: { email: data.email, deletedAt: null },
  });
  if (existingArtisan) {
    return NextResponse.json(
      { error: "Un artisan est déjà inscrit avec cet email." },
      { status: 409 }
    );
  }

  // Récupérer les métiers et communes correspondants
  const metiers = await prisma.metier.findMany({
    where: { slug: { in: data.metierSlugs } },
  });
  const communes = await prisma.commune.findMany({
    where: { id: { in: data.communeIds } },
  });

  // Le refine Zod garantit déjà qu'au moins un des deux est rempli,
  // mais on vérifie quand même en double-sécurité côté serveur
  if (metiers.length === 0 && !data.metierLibre?.trim()) {
    return NextResponse.json({ error: "Aucun métier valide trouvé." }, { status: 422 });
  }
  if (communes.length === 0) {
    return NextResponse.json({ error: "Aucune commune valide trouvée." }, { status: 422 });
  }

  // Créer l'artisan en statut EN_ATTENTE
  const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;

  const artisan = await prisma.artisan.create({
    data: {
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone ?? null,
      raisonSociale: data.raisonSociale ?? null,
      siret: data.siret ?? null,
      siteWeb: data.siteWeb ?? null,
      description: data.description ?? null,
      metierLibre: data.metierLibre?.trim() || null,
      passwordHash,
      status: "EN_ATTENTE",
      metiers: {
        create: metiers.map((m: { id: string }) => ({ metierId: m.id })),
      },
      communes: {
        create: communes.map((c: { id: string }) => ({ communeId: c.id })),
      },
    },
  });

  // Notification email admin + confirmation artisan (si Resend configuré)
  if (resend) {
    const adminEmail = process.env.ADMIN_EMAIL ?? "contact@oyezartisans.fr";
    const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
    const metierLabels = metiers.map((m: { label: string }) => m.label).join(", ");
    const metierLibreInfo = artisan.metierLibre
      ? `<li><strong>⚠️ Métier suggéré (libre) :</strong> <em>${artisan.metierLibre}</em></li>`
      : "";

    await Promise.allSettled([
      // Notification admin
      resend.emails.send({
        from: "OyezArtisans <noreply@oyezartisans.fr>",
        to: adminEmail,
        subject: `🔨 Nouvelle inscription artisan : ${nomAffiche}`,
        html: `
          <h2>Nouvelle inscription artisan en attente de validation</h2>
          <ul>
            <li><strong>Nom :</strong> ${artisan.prenom} ${artisan.nom}</li>
            ${artisan.raisonSociale ? `<li><strong>Raison sociale :</strong> ${artisan.raisonSociale}</li>` : ""}
            ${artisan.siret ? `<li><strong>SIRET :</strong> ${artisan.siret}</li>` : ""}
            <li><strong>Email :</strong> ${artisan.email}</li>
            ${artisan.telephone ? `<li><strong>Tél :</strong> ${artisan.telephone}</li>` : ""}
            <li><strong>Métiers :</strong> ${metierLabels || "(aucun slug sélectionné)"}</li>
            ${metierLibreInfo}
            <li><strong>Communes :</strong> ${communes.map((c: { nom: string }) => c.nom).join(", ")}</li>
            ${artisan.description ? `<li><strong>Description :</strong> ${artisan.description}</li>` : ""}
          </ul>
          <p><a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3001"}/admin">Valider depuis le back-office →</a></p>
        `,
      }),
      // Confirmation artisan
      resend.emails.send({
        from: "OyezArtisans <noreply@oyezartisans.fr>",
        to: artisan.email,
        subject: "✅ Votre inscription OyezArtisans est bien reçue !",
        html: `
          <h2>Bonjour ${artisan.prenom},</h2>
          <p>Votre inscription sur <strong>OyezArtisans</strong> a bien été reçue et est en cours de vérification.</p>
          <p>Notre équipe valide chaque fiche manuellement pour garantir la qualité du réseau. Vous recevrez une confirmation sous 48h.</p>
          <p>À très bientôt sur le réseau local des artisans de Nantes Est !</p>
          <p>— L'équipe OyezArtisans</p>
        `,
      }),
    ]);
  }

  return NextResponse.json({ success: true, artisanId: artisan.id }, { status: 201 });
}
