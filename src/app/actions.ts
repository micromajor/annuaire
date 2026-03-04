"use server";

import { signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

/**
 * Action de déconnexion partagée par toutes les pages.
 * Export nommé = ID de Server Action stable entre les builds.
 * Ne jamais utiliser d'inline "use server" dans les pages — ça génère
 * des IDs basés sur la position dans le fichier, qui changent dès qu'on
 * ajoute/supprime du JSX et provoquent des erreurs 404 sur les anciens clients.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/**
 * Marque toutes les demandes de contact non lues de l'artisan connecté comme lues.
 * Appelée côté client après le chargement du dashboard artisan.
 */
export async function markContactsAsReadAction(): Promise<{ updated: number }> {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  const userId = (session?.user as { id?: string })?.id;

  if (!session || role !== "artisan" || !userId) {
    return { updated: 0 };
  }

  const result = await prisma.contactRequest.updateMany({
    where: { artisanId: userId, lu: false },
    data: { lu: true },
  });

  return { updated: result.count };
}
