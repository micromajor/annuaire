import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin")
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { action?: string };
  const { action } = body;

  if (action !== "valider" && action !== "rejeter") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const avis = await prisma.avis.findUnique({ where: { id } });
  if (!avis) return NextResponse.json({ error: "Avis introuvable" }, { status: 404 });

  await prisma.avis.update({
    where: { id },
    data: { status: action === "valider" ? "VALIDE" : "REJETE" },
  });

  return NextResponse.json({ ok: true });
}
