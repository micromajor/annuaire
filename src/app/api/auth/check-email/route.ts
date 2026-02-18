import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/** Vérifie si un email est déjà associé à un compte artisan */
export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };
  if (!email) return NextResponse.json({ exists: false });

  const artisan = await prisma.artisan.findFirst({
    where: { email, deletedAt: null, passwordHash: { not: null } },
    select: { id: true },
  });

  return NextResponse.json({ exists: !!artisan });
}
