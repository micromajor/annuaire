import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const patchSchema = z.object({
  action: z.enum(["valider", "rejeter"]),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Action invalide." }, { status: 422 });
  }

  const artisan = await prisma.artisan.findFirst({
    where: { id, deletedAt: null },
    include: {
      metiers: true,
      communes: true,
    },
  });
  if (!artisan) {
    return NextResponse.json({ error: "Artisan introuvable." }, { status: 404 });
  }

  const { action } = result.data;

  // Bloquer la validation si le profil est incomplet
  if (action === "valider") {
    const hasDescription = !!artisan.description?.trim();
    const hasMetier = artisan.metiers.length > 0;
    const hasContact = !!(artisan.telephone?.trim() || artisan.instagram || artisan.facebook);
    if (!hasDescription || !hasMetier) {
      const missing = [
        !hasDescription && "une description",
        !hasMetier && "au moins un métier",
        !hasContact && "un moyen de contact (tel, réseau)",
      ]
        .filter(Boolean)
        .join(", ");
      return NextResponse.json(
        { error: `Profil incomplet — il manque : ${missing}. Complétez avant de valider.` },
        { status: 422 }
      );
    }
  }

  // Valider/rejeter une inscription EN_ATTENTE
  const newStatus = action === "valider" ? "VALIDE" : "REJETE";
  const updated = await prisma.artisan.update({
    where: { id },
    data: { status: newStatus },
  });

  return NextResponse.json({ success: true, status: updated.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;

  const artisan = await prisma.artisan.findFirst({ where: { id, deletedAt: null } });
  if (!artisan) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  // Suppression définitive — toutes les relations cascadent (avis, messages,
  // conversations, oAuthAccounts, metiers, communes, besoins)
  await prisma.artisan.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
