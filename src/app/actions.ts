"use server";

import { signOut } from "@/lib/auth";

/**
 * Action de déconnexion partagée par toutes les pages.
 * Export nommé = ID de Server Action stable entre les builds.
 * Ne jamais utiliser d'inline "use server" dans les pages — ça génère
 * des IDs basés sur la position dans le fichier, qui changent dès qu'on
 * ajoute/supprime du JSX et provoquent des erreurs 404 sur les anciens clients.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
