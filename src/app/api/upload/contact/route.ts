import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { compressImage } from "@/lib/utils/compressImage";

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0)
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

    if (files.length > MAX_FILES)
      return NextResponse.json({ error: `Maximum ${MAX_FILES} photos` }, { status: 400 });

    const urls: string[] = [];

    for (const file of files) {
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
          contexte: "contact",
          uploaderId: null,
        },
      });
      urls.push(`/api/files/${record.id}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
