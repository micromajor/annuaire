import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { sendPasswordResetEmail } from "@/lib/email";

// Rate limiting : 3 demandes / heure / IP
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
    // Réponse 200 même en cas de rate limit pour ne pas leaker l'info
    return NextResponse.json({ ok: true });
  }

  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ ok: true });

  const artisan = await prisma.artisan.findFirst({
    where: { email, deletedAt: null, passwordHash: { not: null } },
    select: { id: true },
  });

  // Toujours répondre 200 — ne pas indiquer si l'email existe ou non
  if (!artisan) return NextResponse.json({ ok: true });

  // Invalider les tokens précédents non utilisés
  await prisma.passwordResetToken.updateMany({
    where: { artisanId: artisan.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Créer un nouveau token valable 1 heure
  const resetToken = await prisma.passwordResetToken.create({
    data: {
      artisanId: artisan.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  await sendPasswordResetEmail({ destinataireEmail: email, resetToken: resetToken.token });

  return NextResponse.json({ ok: true });
}
