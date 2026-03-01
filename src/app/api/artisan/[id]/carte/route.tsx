// Carte de visite artisan — PNG téléchargeable / partageable + og:image
// Rendu côté serveur (Node runtime) pour accès Prisma
// Design : header sombre, corps crème, tags métier, accroche, tel, réseaux, footer jaune
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db/client";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";

const W = 1200;
const H = 630;
const HEADER_H = 72;
const FOOTER_H = 60;
const RIGHT_W = 310;

// Police Bangers (BD) chargée en lazy
let bangersFont: Buffer | null = null;
function getBangersFont(): Buffer | null {
  if (bangersFont) return bangersFont;
  try {
    bangersFont = fs.readFileSync(path.join(process.cwd(), "public/fonts/Bangers-Regular.ttf"));
    return bangersFont;
  } catch {
    return null;
  }
}

const METIER_EMOJI: Record<string, string> = {
  macon: "🧱",
  plombier: "🔧",
  electricien: "⚡",
  menuisier: "🪵",
  peintre: "🎨",
  couvreur: "🏠",
  carreleur: "🔲",
  chauffagiste: "🔥",
  plaquiste: "🪜",
  charpentier: "🪚",
  terrassier: "⛏",
  paysagiste: "🌿",
  ramoneur: "🏚",
};

function getHandle(val: string | null | undefined): string {
  if (!val) return "";
  try {
    const url = new URL(val);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] ?? "";
    return last.startsWith("@") ? last : `@${last}`;
  } catch {
    return val.startsWith("@") ? val : `@${val}`;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const download = req.nextUrl.searchParams.get("dl") === "1";

  type ArtisanData = {
    prenom: string | null;
    nom: string | null;
    raisonSociale: string | null;
    telephone: string | null;
    siret: string | null;
    logoUrl: string | null;
    accroche: string | null;
    instagram: string | null;
    facebook: string | null;
    youtube: string | null;
    linkedin: string | null;
    whatsapp: string | null;
    metiers: { metier: { label: string; slug: string } }[];
  };

  let artisan: ArtisanData | null = null;
  try {
    artisan = (await prisma.artisan.findFirst({
      where: { id, status: "VALIDE", deletedAt: null },
      select: {
        prenom: true,
        nom: true,
        raisonSociale: true,
        telephone: true,
        siret: true,
        logoUrl: true,
        accroche: true,
        instagram: true,
        facebook: true,
        youtube: true,
        linkedin: true,
        whatsapp: true,
        metiers: { select: { metier: { select: { label: true, slug: true } } } },
      },
    })) as ArtisanData | null;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  if (!artisan) return new Response("Not found", { status: 404 });

  const nom = (artisan.raisonSociale ?? `${artisan.prenom ?? ""} ${artisan.nom ?? ""}`).trim();
  const metiersLabels = artisan.metiers.map((m) => m.metier.label).filter(Boolean);
  const firstSlug = artisan.metiers[0]?.metier?.slug ?? "";
  const emoji = METIER_EMOJI[firstSlug] ?? "🔨";
  const tel = artisan.telephone;
  const isPro = !!artisan.siret;
  const accroche = artisan.accroche ?? "";

  // Réseaux sociaux
  const socialItems: Array<{ bg: string; letter: string; handle: string }> = [];
  if (artisan.instagram)
    socialItems.push({ bg: "#E1306C", letter: "IG", handle: getHandle(artisan.instagram) });
  if (artisan.facebook)
    socialItems.push({ bg: "#1877F2", letter: "Fb", handle: getHandle(artisan.facebook) });
  if (artisan.youtube)
    socialItems.push({ bg: "#FF0000", letter: "YT", handle: getHandle(artisan.youtube) });
  if (artisan.linkedin)
    socialItems.push({ bg: "#0A66C2", letter: "in", handle: getHandle(artisan.linkedin) });
  if (artisan.whatsapp)
    socialItems.push({ bg: "#25D366", letter: "WA", handle: getHandle(artisan.whatsapp) });

  // ── Fetch logo depuis DB (évite la boucle réseau next/og) ──
  let logoDataUrl: string | null = null;
  if (artisan.logoUrl) {
    try {
      const fileId = artisan.logoUrl.match(/\/api\/files\/([^/?]+)/)?.[1];
      if (fileId) {
        const file = await prisma.uploadedFile.findUnique({
          where: { id: fileId },
          select: { data: true, mimeType: true },
        });
        if (file) {
          const b64 = Buffer.from(file.data).toString("base64");
          logoDataUrl = `data:${file.mimeType};base64,${b64}`;
        }
      } else if (artisan.logoUrl.startsWith("http")) {
        const res = await fetch(artisan.logoUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          const mime = res.headers.get("content-type") ?? "image/png";
          logoDataUrl = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
        }
      }
    } catch {
      // Sans logo si erreur
    }
  }

  // ── Satori ne supporte que PNG/JPEG — convertir via sharp ──
  let safeLogoUrl: string | null = null;
  if (logoDataUrl) {
    const logoMime = logoDataUrl.split(";")[0].replace("data:", "");
    if (["image/png", "image/jpeg", "image/jpg"].includes(logoMime)) {
      safeLogoUrl = logoDataUrl;
    } else {
      try {
        const b64data = logoDataUrl.split(",")[1];
        const inputBuf = Buffer.from(b64data, "base64");
        const jpegBuf = await sharp(inputBuf).jpeg({ quality: 90 }).toBuffer();
        safeLogoUrl = `data:image/jpeg;base64,${jpegBuf.toString("base64")}`;
      } catch {
        // Continue sans logo
      }
    }
  }

  const nomFontSize = nom.length > 28 ? 54 : nom.length > 20 ? 68 : 84;

  try {
    const image = new ImageResponse(
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Bangers, Impact, Arial Black, sans-serif",
          background: "#fef9f0",
          border: "12px solid #1a1a2e",
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            height: HEADER_H,
            background: "#1a1a2e",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 44,
            paddingRight: 44,
            flexShrink: 0,
          }}
        >
          <span style={{ color: "#ffd93d", fontSize: 32, letterSpacing: 5, display: "flex" }}>
            OYEZ ARTISANS !
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
              letterSpacing: 3,
              display: "flex",
              fontFamily: "Arial, sans-serif",
              textTransform: "uppercase",
            }}
          >
            ANNUAIRE ARTISANS DU BATIMENT — NANTES & LOIRE-ATLANTIQUE
          </span>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* Colonne gauche */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "24px 44px",
              gap: 14,
              justifyContent: "center",
            }}
          >
            {/* Nom + badge PRO */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span
                style={{
                  fontSize: nomFontSize,
                  color: "#1a1a2e",
                  letterSpacing: 2,
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                {nom}
              </span>
              {isPro ? (
                <div
                  style={{
                    background: "#6bcb77",
                    color: "#1a1a2e",
                    fontSize: 17,
                    padding: "7px 20px",
                    borderRadius: 40,
                    border: "3px solid #1a1a2e",
                    display: "flex",
                    letterSpacing: 1,
                  }}
                >
                  PRO VÉRIFIÉ
                </div>
              ) : null}
            </div>

            {/* Tags métiers */}
            {metiersLabels.length > 0 ? (
              <div style={{ display: "flex", gap: 10 }}>
                {metiersLabels.map((label) => (
                  <div
                    key={label}
                    style={{
                      background: "#ffd93d",
                      color: "#1a1a2e",
                      fontSize: 17,
                      padding: "7px 20px",
                      borderRadius: 40,
                      border: "3px solid #1a1a2e",
                      letterSpacing: 2,
                      display: "flex",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Accroche */}
            {accroche ? (
              <div
                style={{
                  fontSize: 21,
                  color: "#333",
                  fontFamily: "Arial, Georgia, serif",
                  display: "flex",
                }}
              >
                {"\u201C"}
                {accroche}
                {"\u201D"}
              </div>
            ) : null}

            {/* Téléphone */}
            {tel ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "2.5px solid #1a1a2e",
                    borderRadius: 30,
                    padding: "8px 22px",
                    fontSize: 21,
                    color: "#1a1a2e",
                    background: "white",
                  }}
                >
                  {"📞"} {tel}
                </div>
              </div>
            ) : null}

            {/* Réseaux sociaux */}
            {socialItems.length > 0 ? (
              <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                {socialItems.map(({ bg, letter, handle }) => (
                  <div
                    key={letter}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 15,
                      color: "#1a1a2e",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <div
                      style={{
                        background: bg,
                        width: 26,
                        height: 26,
                        borderRadius: 13,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        color: "white",
                        fontWeight: 700,
                      }}
                    >
                      {letter}
                    </div>
                    <span style={{ display: "flex" }}>{handle}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Colonne droite — logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: RIGHT_W,
              background: "white",
              borderLeft: "5px solid #1a1a2e",
              padding: "24px 28px",
              gap: 16,
              flexShrink: 0,
            }}
          >
            {safeLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={safeLogoUrl}
                alt={nom}
                width={200}
                height={200}
                style={{
                  borderRadius: 20,
                  objectFit: "contain",
                  background: "#fff",
                  width: 220,
                  height: 220,
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 160,
                  height: 160,
                  background: "#ffd93d",
                  borderRadius: 24,
                  border: "4px solid #1a1a2e",
                  fontSize: 80,
                }}
              >
                {emoji}
              </div>
            )}
            {/* Marque plateforme */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                fontSize: 24,
                letterSpacing: 1,
              }}
            >
              <span style={{ color: "#1a1a2e", display: "flex" }}>ovez</span>
              <span style={{ color: "#0d9488", display: "flex" }}>artisans</span>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div
          style={{
            display: "flex",
            height: FOOTER_H,
            background: "#ffd93d",
            alignItems: "center",
            justifyContent: "center",
            borderTop: "5px solid #1a1a2e",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: "#1a1a2e",
              letterSpacing: 10,
              display: "flex",
            }}
          >
            OYEZARTISANS.FR
          </span>
        </div>
      </div>,
      {
        width: W,
        height: H,
        fonts: (() => {
          const buf = getBangersFont();
          if (!buf) return [];
          return [
            {
              name: "Bangers",
              data: buf.buffer.slice(
                buf.byteOffset,
                buf.byteOffset + buf.byteLength
              ) as ArrayBuffer,
              weight: 400 as const,
              style: "normal" as const,
            },
          ];
        })(),
      }
    );

    // Force le rendu MAINTENANT (ImageResponse est lazy)
    const buffer = await image.arrayBuffer();
    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    };
    if (download) {
      const slug = nom
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 40);
      headers["Content-Disposition"] = `attachment; filename="carte-${slug}-oyezartisans.png"`;
    }
    return new Response(buffer, { headers });
  } catch (err) {
    console.error("[carte] crash:", {
      msg: err instanceof Error ? err.message : String(err),
      nom,
      accroche: accroche ? `"${accroche.slice(0, 30)}..."` : null,
      metiersCount: metiersLabels.length,
    });
    // Fallback minimal — image PNG jaune avec le nom
    try {
      const fallback = new ImageResponse(
        <div
          style={{
            width: W,
            height: H,
            background: "#ffd93d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
            color: "#1a1a2e",
          }}
        >
          {nom}
        </div>,
        { width: W, height: H }
      );
      const fallbackBuf = await fallback.arrayBuffer();
      return new Response(fallbackBuf, { headers: { "Content-Type": "image/png" } });
    } catch {
      return new Response("Error", { status: 500 });
    }
  }
}
