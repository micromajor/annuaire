import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const schema = z.object({
  artisanId: z.string().min(1),
  motif: z.string().min(10, "Décrivez le problème en quelques mots (10 caractères min.)").max(500),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { artisanId, motif, email } = parsed.data;

  const artisan = await prisma.artisan.findFirst({
    where: { id: artisanId, deletedAt: null },
    select: { id: true },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Fiche introuvable" }, { status: 404 });
  }

  await prisma.signalement.create({
    data: { artisanId, motif, email: email || null },
  });

  return NextResponse.json({ ok: true });
}
