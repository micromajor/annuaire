import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { compressImage } from "@/lib/utils/compressImage";
import { auth } from "@/lib/auth";

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Rate-limit : 10 uploads / 10 min / IP
const uploadRateMap = new Map<string, { count: number; resetAt: number }>();
function checkUploadRate(ip: string): boolean {
  const now = Date.now();
  const entry = uploadRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    uploadRateMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // Auth obligatoire
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    // Rate-limit par IP
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkUploadRate(ip)) {
      return NextResponse.json(
        { error: "Trop d'uploads — réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

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
