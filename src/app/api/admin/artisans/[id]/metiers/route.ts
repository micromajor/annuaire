import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

/** POST — assigne un métier existant à un artisan */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { metierSlug?: string };
  const { metierSlug } = body;

  if (!metierSlug) {
    return NextResponse.json({ error: "metierSlug requis." }, { status: 400 });
  }

  const [artisan, metier] = await Promise.all([
    prisma.artisan.findFirst({ where: { id, deletedAt: null } }),
    prisma.metier.findUnique({ where: { slug: metierSlug } }),
  ]);

  if (!artisan) return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  if (!metier) return NextResponse.json({ error: "Métier introuvable." }, { status: 404 });

  // Ignorer si déjà assigné
  const existing = await prisma.artisanMetier.findFirst({
    where: { artisanId: id, metierId: metier.id },
  });
  if (existing) {
    return NextResponse.json({
      ok: true,
      already: true,
      metier: { slug: metier.slug, label: metier.label },
    });
  }

  await prisma.artisanMetier.create({
    data: { artisanId: id, metierId: metier.id },
  });

  return NextResponse.json({ ok: true, metier: { slug: metier.slug, label: metier.label } });
}

/** DELETE — retire un métier d'un artisan */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { metierSlug?: string };
  const { metierSlug } = body;

  if (!metierSlug) {
    return NextResponse.json({ error: "metierSlug requis." }, { status: 400 });
  }

  const metier = await prisma.metier.findUnique({ where: { slug: metierSlug } });
  if (!metier) return NextResponse.json({ error: "Métier introuvable." }, { status: 404 });

  await prisma.artisanMetier.deleteMany({
    where: { artisanId: id, metierId: metier.id },
  });

  return NextResponse.json({ ok: true });
}
