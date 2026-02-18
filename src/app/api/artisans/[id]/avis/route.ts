import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { avisSchema } from "@/lib/validators/schemas";
import { z } from "zod";

// Rate limit simple en mémoire (par IP, max 3 avis/heure)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: artisanId } = await params;

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop d'avis soumis. Réessayez dans une heure." },
      { status: 429 }
    );
  }

  // Vérifier que l'artisan existe et est validé
  const artisan = await prisma.artisan.findFirst({
    where: { id: artisanId, status: "VALIDE", deletedAt: null },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  let data: z.infer<typeof avisSchema>;
  try {
    const body = (await req.json()) as unknown;
    data = avisSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Données invalides." }, { status: 422 });
  }

  await prisma.avis.create({
    data: {
      artisanId,
      auteurPrenom: data.auteurPrenom,
      auteurEmail: data.auteurEmail,
      note: data.note,
      commentaire: data.commentaire,
      status: "EN_ATTENTE",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
