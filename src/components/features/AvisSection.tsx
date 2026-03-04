"use client";

import { useState, useEffect } from "react";
import AvisForm from "@/components/features/AvisForm";

interface AvisSectionProps {
  artisanId: string;
  artisanNom: string;
  token?: string;
}

/**
 * Wrapper autour d'AvisForm qui gère la vérification du token côté client.
 *
 * Ce composant est SÉPARÉ d'AvisForm pour contourner un bug Turbopack
 * qui sert un module client stale lors de l'hydratation initiale.
 * AvisForm reste inchangé (rendu identique au code déjà en cache),
 * et la logique de vérification vit ici dans un fichier "neuf".
 */
export default function AvisSection({ artisanId, artisanNom, token }: AvisSectionProps) {
  // null = vérification en cours, true = token utilisé, false = token valide
  const [tokenUsed, setTokenUsed] = useState<boolean | null>(token ? null : false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/artisans/${artisanId}/avis/check-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data: { used: boolean }) => setTokenUsed(data.used))
      .catch(() => setTokenUsed(false));
  }, [artisanId, token]);

  // Token déjà utilisé → message final
  if (tokenUsed === true) {
    return (
      <div className="bd-bubble p-6 text-center">
        <p className="mb-2 text-3xl">&#9989;</p>
        <p className="bd-titre text-lg text-[#1a1a2e]">Avis déjà envoyé</p>
        <p className="mt-2 text-sm text-gray-500">
          Vous avez déjà laissé un avis pour {artisanNom} via ce lien. Merci pour votre retour !
        </p>
      </div>
    );
  }

  // Pas de token ou vérification en cours ou token valide → afficher le formulaire
  // (pendant la vérification le formulaire est visible mais la soumission vérifiera aussi)
  return <AvisForm artisanId={artisanId} artisanNom={artisanNom} token={token} />;
}
