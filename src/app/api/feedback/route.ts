import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { feedbackSchema } from "@/lib/validators/schemas";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, message, pageUrl, email } = parsed.data;

    await prisma.feedback.create({
      data: {
        type,
        message,
        pageUrl: pageUrl ?? null,
        email: email && email.length > 0 ? email : null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/feedback]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
