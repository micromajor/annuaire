import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const BesoinSchema = z.object({
  metierSlug: z.string().min(1),
  commune: z.string().min(1),
  description: z.string().min(10).max(1000),
  prenom: z.string().min(1).max(50),
  contact: z.string().min(3).max(200), // email ou tel
});

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const data = BesoinSchema.parse(body);

    await prisma.besoin.create({
      data: {
        metierSlug: data.metierSlug,
        commune: data.commune,
        description: data.description,
        prenom: data.prenom,
        contact: data.contact,
        status: "NOUVEAU",
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[POST /api/besoins]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
