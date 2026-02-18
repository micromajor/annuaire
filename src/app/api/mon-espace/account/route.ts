import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function DELETE() {
  const session = await auth();
  const artisanId = (session?.user as { id?: string })?.id;

  if (!artisanId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Hard-delete : cascade sur OAuthAccount, sinon le prochain sign-in Google
  // échoue sur la contrainte unique provider_providerAccountId
  await prisma.artisan.delete({
    where: { id: artisanId },
  });

  return NextResponse.json({ ok: true });
}

// Marquer un compte comme particulier (sans le supprimer)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const artisanId = (session?.user as { id?: string })?.id;

  if (!artisanId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.isParticulier === true) {
    await prisma.artisan.update({
      where: { id: artisanId },
      data: { draftData: { isParticulier: true } },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
