import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

// Rate limiting : 20 vérifications / heure / IP (protection énumération)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count++;
  return true;
}

/** Vérifie si un email est déjà associé à un compte artisan */
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }
  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ exists: false });

  const artisan = await prisma.artisan.findFirst({
    where: { email, deletedAt: null },
    select: { id: true },
  });

  if (!artisan) return NextResponse.json({ exists: false });

  return NextResponse.json({ exists: true });
}
