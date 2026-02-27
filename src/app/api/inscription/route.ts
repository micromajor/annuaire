"use server";

import { NextRequest, NextResponse } from "next/server";
import { inscriptionArtisanSchema } from "@/lib/validators/schemas";
import { prisma } from "@/lib/db/client";
import { sendEmailVerification, sendAdminNouvelleInscription } from "@/lib/email";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

  // Vérification double-sécurité côté serveur (le schema Zod garantit min(1))
  if (metiers.length === 0) {
    return NextResponse.json({ error: "Aucun métier valide trouvé." }, { status: 422 });
  }
  if (communes.length === 0) {
    return NextResponse.json({ error: "Aucune commune valide trouvée." }, { status: 422 });
  }

  // Créer l'artisan en statut EN_ATTENTE
  const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : null;

  // Générer un token de vérification d'email
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // NOTE: PrismaPg + composite @@id → les nested creates échouent silencieusement.
  // On crée d'abord l'artisan, puis les jonctions séparément.
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
      metierLibre: null,
      passwordHash,
      emailVerificationToken: verificationToken,
      status: "EN_ATTENTE",
    },
  });

  // Créer les liens ArtisanMetier et ArtisanCommune séparément
  for (const m of metiers) {
    const existing = await prisma.artisanMetier.findFirst({
      where: { artisanId: artisan.id, metierId: m.id },
    });
    if (!existing) {
      await prisma.artisanMetier.create({ data: { artisanId: artisan.id, metierId: m.id } });
    }
  }
  for (const c of communes) {
    const existing = await prisma.artisanCommune.findFirst({
      where: { artisanId: artisan.id, communeId: c.id },
    });
    if (!existing) {
      await prisma.artisanCommune.create({ data: { artisanId: artisan.id, communeId: c.id } });
    }
  }

  // Envoyer le lien de vérification d'email + notifier l'admin
  const nomAffiche = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metierLabels = metiers.map((m: { label: string }) => m.label).join(", ");
  const communeNoms = communes.map((c: { nom: string }) => c.nom).join(", ");
  await Promise.allSettled([
    sendEmailVerification({
      destinataireEmail: artisan.email,
      prenomArtisan: artisan.prenom || nomAffiche,
      token: verificationToken,
    }),
    sendAdminNouvelleInscription({
      nomArtisan: nomAffiche,
      emailArtisan: artisan.email,
      metierLabels: metierLabels || "(aucun)",
      communeNoms: communeNoms || "(aucune)",
      artisanId: artisan.id,
    }),
  ]);

  return NextResponse.json({ success: true, artisanId: artisan.id }, { status: 201 });
}
