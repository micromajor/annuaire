"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";

const STORAGE_KEY = "cookie_consent";

type ConsentState = "accepted" | "refused" | null;

export default function CookieConsent({ gaId }: { gaId: string }) {
  // Lazy init : lit localStorage côté client dès le premier rendu (composant client uniquement)
  const [consent, setConsent] = useState<ConsentState>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY) as ConsentState;
  });
  const [visible, setVisible] = useState(false);

  // Affiche la bannière uniquement si aucun choix n'a encore été fait
  useEffect(() => {
    if (consent === null) {
      // Petit délai pour éviter le flash au chargement initial
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
  }, [consent]);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  }

  function handleRefuse() {
    localStorage.setItem(STORAGE_KEY, "refused");
    setConsent("refused");
    setVisible(false);
  }

  return (
    <>
      {/* GA4 — chargé uniquement si consentement donné */}
      {consent === "accepted" && <GoogleAnalytics gaId={gaId} />}

      {/* Bannière CNIL */}
      {visible && (
        <div
          role="dialog"
          aria-label="Gestion des cookies"
          className="fixed right-0 bottom-0 left-0 z-[9999] border-t-4 border-[#1a1a1a] bg-white p-4 md:p-6"
          style={{ boxShadow: "0 -4px 0 #1a1a1a" }}
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#1a1a2e]">
              🍪 Ce site utilise Google Analytics pour mesurer son audience. Ces cookies ne sont
              déposés qu&apos;avec votre accord.{" "}
              <Link href="/politique-confidentialite" className="underline hover:text-[#e63946]">
                En savoir plus
              </Link>
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={handleRefuse}
                className="rounded-xl border-2 border-[#1a1a1a] px-4 py-2 text-sm font-bold text-[#1a1a2e] transition hover:bg-gray-100"
              >
                Refuser
              </button>
              <button
                onClick={handleAccept}
                className="rounded-xl border-2 border-[#1a1a1a] bg-[#ffd93d] px-4 py-2 text-sm font-bold text-[#1a1a2e] transition hover:bg-[#ffca28]"
                style={{ boxShadow: "2px 2px 0 #1a1a1a" }}
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
