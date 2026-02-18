import { NextResponse } from "next/server";
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
