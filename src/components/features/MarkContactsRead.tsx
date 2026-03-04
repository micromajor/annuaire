"use client";

import { useEffect } from "react";
import { markContactsAsReadAction } from "@/app/actions";

/**
 * Composant invisible qui marque les demandes de contact non lues comme lues
 * après un court délai (2s) — le temps que l'artisan ait vu les badges "NOUVEAU".
 */
export default function MarkContactsRead({ hasUnread }: { hasUnread: boolean }): null {
  useEffect(() => {
    if (!hasUnread) return;

    const timer = setTimeout(() => {
      markContactsAsReadAction();
    }, 2000);

    return () => clearTimeout(timer);
  }, [hasUnread]);

  return null;
}
