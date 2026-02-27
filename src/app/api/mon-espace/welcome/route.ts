import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { sendBienvenueArtisanGoogle } from "@/lib/email";

export async function POST() {
  const session = await auth();
  const artisanId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!artisanId || role !== "artisan") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const artisan = await prisma.artisan.findUnique({
    where: { id: artisanId },
    select: {
      email: true,
      prenom: true,
      nom: true,
      raisonSociale: true,
      passwordHash: true,
      metiers: { take: 1 },
    },
  });

  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });
  }

  // Uniquement pour les comptes Google (pas de passwordHash) avec profil vide
  if (artisan.passwordHash || artisan.metiers.length > 0) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const prenom = artisan.raisonSociale || artisan.prenom || "artisan";

  await sendBienvenueArtisanGoogle({
    destinataireEmail: artisan.email,
    prenomArtisan: prenom,
  });

  return NextResponse.json({ ok: true });
}
