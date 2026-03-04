import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { feedbackSchema } from "@/lib/validators/schemas";

const ipLastSubmit = new Map<string, number>();
const FEEDBACK_COOLDOWN_MS = 60_000; // 1 minute entre chaque feedback par IP

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Rate-limit par IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const lastSubmit = ipLastSubmit.get(ip) ?? 0;
    const now = Date.now();
    if (now - lastSubmit < FEEDBACK_COOLDOWN_MS) {
      const retryAfter = Math.ceil((FEEDBACK_COOLDOWN_MS - (now - lastSubmit)) / 1000);
      return NextResponse.json(
        { error: "Veuillez patienter avant de renvoyer un retour.", retryAfter },
        { status: 429 }
      );
    }
    ipLastSubmit.set(ip, now);

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
