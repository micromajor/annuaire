import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

const MAX_TOTAL = 6;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ------------------------------------------------------------------ */
/* POST — upload de nouvelles photos                                    */
/* ------------------------------------------------------------------ */
export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const artisan = await prisma.artisan.findUnique({
    where: { id: userId },
    select: { portfolioPhotos: true },
  });
  if (!artisan) return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });

  const existing: string[] = Array.isArray(artisan.portfolioPhotos)
    ? (artisan.portfolioPhotos as string[])
    : [];

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0)
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

  if (existing.length + files.length > MAX_TOTAL)
    return NextResponse.json(
      { error: `Maximum ${MAX_TOTAL} photos au total (vous en avez déjà ${existing.length})` },
      { status: 400 }
    );

  const newUrls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: `Type non supporté : ${file.type}` }, { status: 400 });
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return NextResponse.json(
        { error: `Fichier trop lourd (max ${MAX_SIZE_MB} Mo)` },
        { status: 400 }
      );

    const record = await prisma.uploadedFile.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        data: Buffer.from(await file.arrayBuffer()),
        contexte: "portfolio",
        uploaderId: userId,
      },
    });
    newUrls.push(`/api/files/${record.id}`);
  }

  const updated = [...existing, ...newUrls];
  await prisma.artisan.update({
    where: { id: userId },
    data: { portfolioPhotos: updated },
  });

  return NextResponse.json({ urls: updated }, { status: 201 });
}

/* ------------------------------------------------------------------ */
/* DELETE — suppression d'une photo                                     */
/* ------------------------------------------------------------------ */
export async function DELETE(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { url } = (await req.json()) as { url?: string };
  if (!url) return NextResponse.json({ error: "URL manquante" }, { status: 400 });

  const artisan = await prisma.artisan.findUnique({
    where: { id: userId },
    select: { portfolioPhotos: true },
  });
  if (!artisan) return NextResponse.json({ error: "Artisan introuvable" }, { status: 404 });

  const existing: string[] = Array.isArray(artisan.portfolioPhotos)
    ? (artisan.portfolioPhotos as string[])
    : [];

  if (!existing.includes(url))
    return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });

  // Supprimer le fichier en base (sécurité : vérifier l'uploaderId)
  const fileId = url.split("/").pop();
  if (fileId) {
    await prisma.uploadedFile.deleteMany({
      where: { id: fileId, uploaderId: userId },
    });
  }

  const updated = existing.filter((u) => u !== url);
  await prisma.artisan.update({
    where: { id: userId },
    data: { portfolioPhotos: updated },
  });

  return NextResponse.json({ urls: updated });
}
