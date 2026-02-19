import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { compressImage } from "@/lib/utils/compressImage";

const MAX_SIZE_MB = 5; // avant compression
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function POST(req: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string; role?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: `Type non supporté : ${file.type}` }, { status: 400 });

  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return NextResponse.json(
      { error: `Fichier trop lourd (max ${MAX_SIZE_MB} Mo)` },
      { status: 400 }
    );

  const raw = Buffer.from(await file.arrayBuffer());
  const { data, mimeType } = await compressImage(raw, file.type);

  const record = await prisma.uploadedFile.create({
    data: {
      filename: file.name,
      mimeType,
      size: data.length,
      data,
      contexte: "logo",
      uploaderId: userId,
    },
  });

  return NextResponse.json({ url: `/api/files/${record.id}` }, { status: 201 });
}
