import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

/**
 * GET /api/artisans/[id]/avis/check-token?token=xxx
 * Vérifie si un token avis a déjà été utilisé.
 * Retourne { used: boolean }.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id: artisanId } = await params;
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ used: true });
  }

  const contact = await prisma.contactRequest.findFirst({
    where: { avisToken: token, artisanId },
    select: { avisUsed: true },
  });

  // Token introuvable → considéré comme utilisé (invalide)
  if (!contact) {
    return NextResponse.json({ used: true });
  }

  return NextResponse.json({ used: contact.avisUsed });
}
