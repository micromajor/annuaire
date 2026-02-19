import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "contact");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0)
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });

    if (files.length > MAX_FILES)
      return NextResponse.json({ error: `Maximum ${MAX_FILES} photos` }, { status: 400 });

    await mkdir(UPLOAD_DIR, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type))
        return NextResponse.json({ error: `Type non supporté : ${file.type}` }, { status: 400 });

      if (file.size > MAX_SIZE_MB * 1024 * 1024)
        return NextResponse.json(
          { error: `Fichier trop lourd (max ${MAX_SIZE_MB} Mo)` },
          { status: 400 }
        );

      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${randomUUID()}.${ext}`;
      await writeFile(join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
      urls.push(`/uploads/contact/${filename}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}
