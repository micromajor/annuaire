import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return null;
  return session;
}

// PATCH /api/admin/metiers/[id] — renommer le label
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = z.object({ label: z.string().min(1).max(80) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Label invalide" }, { status: 400 });

  const metier = await prisma.metier.update({
    where: { id },
    data: { label: parsed.data.label },
  });

  return NextResponse.json(metier);
}

// DELETE /api/admin/metiers/[id] — supprime si aucun artisan ne l'utilise
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;

  const count = await prisma.artisanMetier.count({ where: { metierId: id } });
  if (count > 0)
    return NextResponse.json(
      { error: `Impossible de supprimer : ${count} artisan(s) utilisent ce métier` },
      { status: 409 }
    );

  await prisma.metier.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
