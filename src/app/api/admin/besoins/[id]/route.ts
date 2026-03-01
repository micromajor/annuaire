import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin")
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  await prisma.besoin.update({ where: { id }, data: { status: "TRAITE" } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin")
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  await prisma.besoin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
