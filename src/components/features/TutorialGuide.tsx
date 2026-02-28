"use client";

// TutorialGuide — tutoriel guidé style "jeu mobile"
// Spotlight + tooltip positionnés sur les éléments data-tuto="..."
// Persistance localStorage — bouton ? pour relancer à tout moment

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { TUTORIAL_STEPS } from "./tutorialSteps";

// ─── Clés localStorage par rôle ────────────────────────────────────────────
const LS_KEY: Record<string, string> = {
  artisan: "tuto_artisan_v1",
  particulier: "tuto_particulier_v1",
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface SpotRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Props {
  role: "artisan" | "particulier";
  prenom?: string | null;
}

// ─── Composant ──────────────────────────────────────────────────────────────
export default function TutorialGuide({ role, prenom }: Props) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [spotRect, setSpotRect] = useState<SpotRect | null>(null);
  const rafRef = useRef<number | null>(null);

  const steps = TUTORIAL_STEPS[role] ?? [];
  const step = steps[stepIndex];
  const lsKey = LS_KEY[role] ?? "tuto_v1";

  // ── Hydratation (éviter SSR mismatch) ──────────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // ── Auto-démarrage au 1er passage ──────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    try {
      const done = localStorage.getItem(lsKey);
      if (!done) {
        const t = setTimeout(() => {
          setActive(true);
          setStepIndex(0);
        }, 900);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage indisponible — dégradation silencieuse
    }
  }, [mounted, lsKey]);

  // ── Calcul position du spotlight ──────────────────────────────────────
  const updateSpotlight = useCallback(() => {
    if (!step?.target) {
      setSpotRect(null);
      return;
    }
    const el = document.querySelector(`[data-tuto="${step.target}"]`) as HTMLElement | null;
    if (!el) {
      setSpotRect(null);
      return;
    }
    // Scroll vers l'élément d'abord (instant) pour que getBoundingClientRect
    // retourne des coordonnées viewport correctes
    el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });
    // Calculer la rect après le prochain frame (layout flush garanti)
    requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const pad = step.spotlightPadding ?? 8;
      setSpotRect({
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      });
    });
  }, [step]);

  // Recalcule quand l'étape change (avec délai pour laisser le scroll se stabiliser)
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(updateSpotlight, 450);
    return () => clearTimeout(t);
  }, [active, stepIndex, updateSpotlight]);

  // Recalcule sur resize
  useEffect(() => {
    if (!active) return;
    const handler = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateSpotlight);
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, updateSpotlight]);

  // ── Actions (déclarées avant les useEffect qui les référencent) ─────
  const markDone = useCallback(() => {
    try {
      localStorage.setItem(lsKey, "1");
    } catch {}
  }, [lsKey]);

  const finish = useCallback(() => {
    markDone();
    setActive(false);
    setSpotRect(null);
  }, [markDone]);

  const skip = useCallback(() => {
    markDone();
    setActive(false);
    setSpotRect(null);
  }, [markDone]);

  const next = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    } else {
      finish();
    }
  }, [stepIndex, steps.length, finish]);

  const prev = useCallback(() => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }, [stepIndex]);

  function restart() {
    try {
      localStorage.removeItem(lsKey);
    } catch {}
    setStepIndex(0);
    setSpotRect(null);
    setActive(true);
  }

  // ── Navigation clavier ────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight" || e.key === "Enter") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, skip, next, prev]);

  // ── Écoute l'action déclenchante (clic sur un sélecteur CSS) ─────────
  useEffect(() => {
    if (!active || !step?.action) return;
    let el: Element | null = null;
    const handler = () => next();
    // Délai court : laisse le temps au DOM de se mettre à jour (ex: après ouverture du form)
    const t = setTimeout(() => {
      el = document.querySelector(step.action!.selector);
      if (el) el.addEventListener("click", handler, { once: true });
    }, 500);
    return () => {
      clearTimeout(t);
      if (el) el.removeEventListener("click", handler);
    };
  }, [active, stepIndex, next, step]);

  if (!mounted || steps.length === 0) return null;

  // ── Calcul positionnement du tooltip ──────────────────────────────────
  function getTooltipStyle(): React.CSSProperties {
    if (!spotRect || !step?.target) {
      // Pas de cible → centré sur l'écran
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(480px, 92vw)",
        zIndex: 10003,
      };
    }

    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const tooltipW = Math.min(400, vw - 24);

    const spotBottom = spotRect.top + spotRect.height;
    const spaceBelow = vh - spotBottom;
    const spaceAbove = spotRect.top;

    const placement =
      step.placement ?? (spaceBelow >= 200 || spaceBelow >= spaceAbove ? "bottom" : "top");

    // Centrage horizontal sur le spotlight, clampé dans le viewport
    let left = spotRect.left + spotRect.width / 2 - tooltipW / 2;
    left = Math.max(12, Math.min(vw - tooltipW - 12, left));

    if (placement === "bottom") {
      return {
        position: "fixed",
        top: spotBottom + 16,
        left,
        width: tooltipW,
        zIndex: 10003,
      };
    } else {
      return {
        position: "fixed",
        top: spaceAbove - 16,
        left,
        width: tooltipW,
        zIndex: 10003,
        transform: "translateY(-100%)",
      };
    }
  }

  // ── Interpolation des variables dans le texte ──────────────────────────
  function interpolate(text: string) {
    const p = prenom ? `, ${prenom}` : "";
    return text.replace("{prenom}", p);
  }

  return (
    <>
      {/* ── Bouton ? (flottant, visible quand inactif) ─────────────────── */}
      {!active && (
        <button
          onClick={restart}
          title="Revoir le tutoriel"
          aria-label="Relancer le tutoriel"
          className="fixed right-4 bottom-20 z-50 flex h-11 w-11 items-center justify-center rounded-full font-black text-[#1a1a2e] transition-transform hover:scale-110 active:scale-95"
          style={{
            background: "#ffd93d",
            border: "3px solid #1a1a2e",
            boxShadow: "3px 3px 0 #1a1a2e",
            fontSize: 20,
          }}
        >
          ?
        </button>
      )}

      {/* ── Overlay principal ─────────────────────────────────────────── */}
      {active &&
        createPortal(
          <div>
            {/* Overlay — standard ou 4 cadres si step interactif/action */}
            {(() => {
              const isInteractive = !!(step?.interactive || step?.action);
              if (isInteractive && spotRect) {
                // 4 panneaux laissant le spotlight libre pour clic/saisie
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                return (
                  <>
                    {/* Dessus */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: spotRect.top,
                        background: "rgba(0,0,0,0.75)",
                        zIndex: 10001,
                      }}
                    />
                    {/* Gauche */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        top: spotRect.top,
                        left: 0,
                        width: spotRect.left,
                        height: spotRect.height,
                        background: "rgba(0,0,0,0.75)",
                        zIndex: 10001,
                      }}
                    />
                    {/* Droite */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        top: spotRect.top,
                        left: spotRect.left + spotRect.width,
                        width: Math.max(0, vw - spotRect.left - spotRect.width),
                        height: spotRect.height,
                        background: "rgba(0,0,0,0.75)",
                        zIndex: 10001,
                      }}
                    />
                    {/* Dessous */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        top: spotRect.top + spotRect.height,
                        left: 0,
                        width: "100%",
                        height: Math.max(0, vh - spotRect.top - spotRect.height),
                        background: "rgba(0,0,0,0.75)",
                        zIndex: 10001,
                      }}
                    />
                    {/* Bordure dorée (juste visuelle) */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        top: spotRect.top,
                        left: spotRect.left,
                        width: spotRect.width,
                        height: spotRect.height,
                        borderRadius: 12,
                        outline: "3px solid #ffd93d",
                        outlineOffset: 2,
                        zIndex: 10002,
                        pointerEvents: "none",
                      }}
                    />
                  </>
                );
              }
              // Overlay standard + box-shadow spotlight (non interactif)
              return (
                <>
                  {/* Fond plein UNIQUEMENT pour les modals sans spotlight (step centré) */}
                  {!spotRect && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.72)",
                        zIndex: 10000,
                        transition: "opacity 0.3s",
                      }}
                    />
                  )}
                  {spotRect && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "fixed",
                        top: spotRect.top,
                        left: spotRect.left,
                        width: spotRect.width,
                        height: spotRect.height,
                        borderRadius: 12,
                        background: "transparent",
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
                        zIndex: 10001,
                        pointerEvents: "none",
                        outline: "3px solid #ffd93d",
                        outlineOffset: 2,
                        transition:
                          "top 0.35s cubic-bezier(0.4,0,0.2,1), left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1), height 0.35s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  )}
                </>
              );
            })()}

            {/* Tooltip ───────────────────────────────────────────────── */}
            <div
              style={getTooltipStyle()}
              role="dialog"
              aria-modal="true"
              aria-label={`Tutoriel — étape ${stepIndex + 1} sur ${steps.length}`}
            >
              <div
                style={{
                  background: "#fef9e7",
                  border: "4px solid #1a1a2e",
                  borderRadius: 18,
                  padding: "22px 24px 20px",
                  boxShadow: "6px 6px 0 #1a1a2e",
                }}
              >
                {/* Indicateur de progression */}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginBottom: 14,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 7,
                        width: i === stepIndex ? 22 : 7,
                        borderRadius: 4,
                        background:
                          i === stepIndex ? "#1a1a2e" : i < stepIndex ? "#6bcb77" : "#ddd",
                        transition: "width 0.35s, background 0.35s",
                        cursor: "pointer",
                      }}
                      onClick={() => setStepIndex(i)}
                      title={`Étape ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Titre */}
                <h3
                  style={{
                    fontFamily: "var(--font-bangers, Bangers, Impact, sans-serif)",
                    fontSize: 24,
                    letterSpacing: 2,
                    color: "#1a1a2e",
                    lineHeight: 1.1,
                    marginBottom: 10,
                  }}
                >
                  {interpolate(step.title)}
                </h3>

                {/* Contenu */}
                <p
                  style={{
                    fontSize: 14,
                    color: "#333",
                    lineHeight: 1.6,
                    marginBottom: step.actionHint ? 10 : 18,
                  }}
                  dangerouslySetInnerHTML={{ __html: interpolate(step.content) }}
                />

                {/* Indice d'action */}
                {step.actionHint && (
                  <div
                    style={{
                      background: "#fff8e1",
                      border: "2px solid #ffd93d",
                      borderRadius: 8,
                      padding: "9px 12px",
                      marginBottom: 18,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1a1a2e",
                      lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: step.actionHint }}
                  />
                )}

                {/* Boutons d'action */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {stepIndex > 0 && (
                    <button
                      onClick={prev}
                      style={{
                        background: "white",
                        border: "3px solid #1a1a2e",
                        borderRadius: 10,
                        padding: "7px 14px",
                        fontWeight: 900,
                        fontSize: 13,
                        cursor: "pointer",
                        color: "#1a1a2e",
                      }}
                    >
                      ← Retour
                    </button>
                  )}

                  <button
                    onClick={next}
                    style={{
                      background: "#ffd93d",
                      border: "3px solid #1a1a2e",
                      borderRadius: 10,
                      padding: "8px 20px",
                      fontWeight: 900,
                      fontSize: 14,
                      cursor: "pointer",
                      color: "#1a1a2e",
                      boxShadow: "3px 3px 0 #1a1a2e",
                      flex: 1,
                      minWidth: 110,
                      textAlign: "center",
                    }}
                    autoFocus
                  >
                    {stepIndex === steps.length - 1
                      ? "🎉 Terminer"
                      : step?.action
                        ? "Passer →"
                        : step?.interactive
                          ? "C'est fait →"
                          : "Suivant →"}
                  </button>

                  <button
                    onClick={skip}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 12,
                      color: "#888",
                      cursor: "pointer",
                      fontWeight: 700,
                      padding: "4px 6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ignorer
                  </button>
                </div>

                {/* Raccourcis clavier */}
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: "#aaa",
                    textAlign: "right",
                  }}
                >
                  ← → Entrée · Échap pour quitter
                </p>
              </div>
            </div>

            {/* Zone cliquable pour ignorer — désactivée sur les steps interactifs */}
            {!(step?.interactive || step?.action) && (
              <div
                onClick={skip}
                aria-hidden="true"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  cursor: "pointer",
                }}
              />
            )}
          </div>,
          document.body
        )}
    </>
  );
}
