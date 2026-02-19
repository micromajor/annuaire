import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/lib/auth";
import { z } from "zod";

const BesoinSchema = z.object({
  metierSlug: z.string().min(1),
  commune: z.string().min(1),
  description: z.string().min(10).max(1000),
  prenom: z.string().min(1).max(50),
  photos: z.array(z.string()).max(6).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string })?.id;

    const body: unknown = await req.json();
    const data = BesoinSchema.parse(body);

    // Persister le prénom sur le compte particulier connecté (silencieux si absent)
    if (userId) {
      await prisma.artisan.updateMany({
        where: { id: userId },
        data: { prenom: data.prenom },
      });
    }

    await prisma.besoin.create({
      data: {
        artisanId: userId ?? null,
        metierSlug: data.metierSlug,
        commune: data.commune,
        description: data.description,
        prenom: data.prenom,
        photos: data.photos ?? [],
        status: "NOUVEAU",
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }
    console.error("[POST /api/besoins]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
