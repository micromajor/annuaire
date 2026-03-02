import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Rate limiting : 5 tentatives / heure / IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

/** Inscription rapide depuis la page /connexion — crée un artisan EN_ATTENTE avec juste email + password */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans une heure." },
      { status: 429 }
    );
  }
  const body = (await request.json()) as unknown;
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 422 });
  }

  const { email, password } = result.data;

  const existing = await prisma.artisan.findFirst({
    where: { email, deletedAt: null },
  });
  if (existing) {
    // Compte existe mais sans password (inscrit via form artisan) — on lui ajoute
    if (!existing.passwordHash) {
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.artisan.update({
        where: { id: existing.id },
        data: { passwordHash },
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Prenom/nom temporaires — l'utilisateur choisira son profil sur /bienvenue
  // needsSetup: true → déclenche le choix artisan/particulier après connexion
  await prisma.artisan.create({
    data: {
      email,
      prenom: "",
      nom: "",
      passwordHash,
      status: "EN_ATTENTE",
      draftData: { needsSetup: true },
    },
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
