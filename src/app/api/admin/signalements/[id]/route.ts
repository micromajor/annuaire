import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  await prisma.signalement.update({ where: { id }, data: { lu: true } });
  return NextResponse.json({ ok: true });
}
