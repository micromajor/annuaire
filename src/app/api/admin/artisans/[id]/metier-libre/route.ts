import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

/** Génère un slug à partir d'un label libre (ex: "Ramoneur" → "ramoneur") */
function toSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // supprime les diacritiques
    .replace(/[^a-z0-9]+/g, "-") // remplace tout ce qui n'est pas alphanum par -
    .replace(/^-+|-+$/g, ""); // trim les tirets
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const artisan = await prisma.artisan.findFirst({
    where: { id, deletedAt: null },
  });

  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  const label = artisan.metierLibre?.trim();
  if (!label) {
    return NextResponse.json({ error: "Aucun métier libre sur cet artisan." }, { status: 400 });
  }

  // Capitalise la première lettre
  const labelFormatted = label.charAt(0).toUpperCase() + label.slice(1);
  const slug = toSlug(label);

  // Upsert le métier (crée s'il n'existe pas, ne modifie pas s'il existe déjà)
  const metier = await prisma.metier.upsert({
    where: { slug },
    create: { slug, label: labelFormatted },
    update: {},
  });

  // Assigner à l'artisan (ignore si déjà assigné)
  const existingLink = await prisma.artisanMetier.findFirst({
    where: { artisanId: id, metierId: metier.id },
  });
  if (!existingLink) {
    await prisma.artisanMetier.create({
      data: { artisanId: id, metierId: metier.id },
    });
  }

  // Vider le champ metierLibre
  await prisma.artisan.update({
    where: { id },
    data: { metierLibre: null },
  });

  return NextResponse.json({ ok: true, metier: { slug, label: labelFormatted } });
}
