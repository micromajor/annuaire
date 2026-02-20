import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = (await request.json()) as unknown;
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Données invalides." }, { status: 422 });
  }

  const { token, password } = result.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { artisan: { select: { id: true } } },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.artisan.update({
      where: { id: resetToken.artisanId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
