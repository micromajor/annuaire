import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

// Cache 1 an — les fichiers sont immutables (UUID unique à chaque upload)
const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=31536000, immutable",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const file = await prisma.uploadedFile.findUnique({
    where: { id },
    select: { data: true, mimeType: true, filename: true },
  });

  if (!file) {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }

  return new NextResponse(file.data, {
    status: 200,
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename="${file.filename}"`,
      ...CACHE_HEADERS,
    },
  });
}
