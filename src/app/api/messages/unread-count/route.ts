import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  if (!session || !["artisan", "particulier"].includes(role ?? "") || !userId) {
    return NextResponse.json({ count: 0, contacts: 0 });
  }

  const count = await prisma.message.count({
    where: {
      conversation: role === "artisan" ? { artisanId: userId } : { particulierId: userId },
      lu: false,
      expediteur: role === "artisan" ? "particulier" : "artisan",
    },
  });

  // Nombre de demandes de contact non lues (artisans uniquement)
  const contacts =
    role === "artisan"
      ? await prisma.contactRequest.count({
          where: { artisanId: userId, lu: false },
        })
      : 0;

  return NextResponse.json({ count, contacts });
}
