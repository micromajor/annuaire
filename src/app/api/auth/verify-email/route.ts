import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/connexion?error=lien-invalide", request.nextUrl.origin));
  }

  const artisan = await prisma.artisan.findUnique({
    where: { emailVerificationToken: token },
    select: { id: true, status: true },
  });

  if (!artisan) {
    return NextResponse.redirect(new URL("/connexion?error=lien-invalide", request.nextUrl.origin));
  }

  // Valider le compte et supprimer le token
  await prisma.artisan.update({
    where: { id: artisan.id },
    data: {
      status: "VALIDE",
      emailVerificationToken: null,
    },
  });

  // Rediriger vers mon-espace avec un flag de succès
  return NextResponse.redirect(new URL("/mon-espace?verified=1", request.nextUrl.origin));
}
