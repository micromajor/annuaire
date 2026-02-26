import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

function slugify(label: string) {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "admin") return null;
  return session;
}

// GET /api/admin/metiers — liste tous les métiers avec le nombre d'artisans
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const metiers = await prisma.metier.findMany({
    orderBy: { label: "asc" },
    include: { _count: { select: { artisans: true } } },
  });

  return NextResponse.json(metiers);
}

// POST /api/admin/metiers — créer un nouveau métier
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = z.object({ label: z.string().min(1).max(80) }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Label invalide" }, { status: 400 });

  const { label } = parsed.data;
  const slug = slugify(label);

  const existing = await prisma.metier.findUnique({ where: { slug } });
  if (existing)
    return NextResponse.json({ error: "Un métier avec ce slug existe déjà" }, { status: 409 });

  const metier = await prisma.metier.create({ data: { slug, label } });
  return NextResponse.json(metier, { status: 201 });
}
