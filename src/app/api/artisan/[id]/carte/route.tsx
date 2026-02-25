// Carte de visite artisan — PNG téléchargeable / partageable + og:image
// Rendu côté serveur (Node runtime) pour accès Prisma
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db/client";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const W = 1200;
const H = 630;

// Police Bangers (BD) chargée en lazy pour éviter un crash au démarrage si le fichier est absent
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const download = req.nextUrl.searchParams.get("dl") === "1";

  // Données artisan — accroche optional pour compat si migration pas encore appliquée
  type ArtisanData = {
    prenom: string | null;
    nom: string | null;
    raisonSociale: string | null;
    logoUrl: string | null;
    accroche?: string | null;
    metiers: { metier: { label: string } }[];
  };

  let artisan: ArtisanData | null = null;
  try {
    // On tente d'abord avec accroche
    artisan = (await prisma.artisan.findFirst({
      where: { id, status: "VALIDE", deletedAt: null },
      select: {
        prenom: true,
        nom: true,
        raisonSociale: true,
        logoUrl: true,
        accroche: true,
        metiers: { select: { metier: { select: { label: true } } } },
      },
    })) as ArtisanData | null;
  } catch {
    // accroche absent en DB (migration pas encore appliquée) → retry sans
    try {
      artisan = (await prisma.artisan.findFirst({
        where: { id, status: "VALIDE", deletedAt: null },
        select: {
          prenom: true,
          nom: true,
          raisonSociale: true,
          logoUrl: true,
          metiers: { select: { metier: { select: { label: true } } } },
        },
      })) as ArtisanData | null;
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  if (!artisan) {
    return new Response("Not found", { status: 404 });
  }

  const nom = (artisan.raisonSociale ?? `${artisan.prenom ?? ""} ${artisan.nom ?? ""}`).trim();
  const metiersLabels = (artisan.metiers ?? [])
    .map((m: { metier: { label: string } }) => m?.metier?.label ?? "")
    .filter(Boolean);

  // Logo : récupéré directement en DB pour éviter la boucle réseau dans next/og
  let logoDataUrl: string | null = null;
  if (artisan.logoUrl) {
    try {
      // logoUrl peut être /api/files/{id} ou une URL absolue externe
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
        // URL externe : fetch direct
        const res = await fetch(artisan.logoUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          const mime = res.headers.get("content-type") ?? "image/png";
          logoDataUrl = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
        }
      }
    } catch {
      // Pas de logo si erreur — on continue sans
    }
  }

  const accroche = artisan.accroche ?? "";

  // Taille du nom selon longueur et présence de logo
  const hasLogo = !!logoDataUrl;
  const nomFontSize = nom.length > 28 ? 62 : nom.length > 18 ? 80 : 100;
  const font = getBangersFont();

  try {
    const image = new ImageResponse(
      <div
        style={{
          width: W,
          height: H,
          background: "#ffd93d",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Bangers, sans-serif",
          border: "14px solid #1a1a2e",
        }}
      >
        {/* CORPS — flex row */}
        <div style={{ display: "flex", flex: 1 }}>
          {/* Zone principale */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "48px 56px",
            }}
          >
            {/* Branding */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  background: "#1a1a2e",
                  color: "#ffd93d",
                  fontSize: 22,
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                O!
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: "#1a1a2e",
                  textTransform: "uppercase",
                  letterSpacing: 5,
                  display: "flex",
                }}
              >
                Oyez Artisans ! 44
              </div>
            </div>

            {/* Nom artisan */}
            <div
              style={{
                fontSize: nomFontSize,
                color: "#1a1a2e",
                lineHeight: 1,
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              {nom}
            </div>

            {/* Accroche */}
            {accroche ? (
              <div
                style={{
                  fontSize: 26,
                  fontFamily: "sans-serif",
                  color: "#333",
                  lineHeight: 1.3,
                  display: "flex",
                  maxWidth: 980,
                }}
              >
                {accroche}
              </div>
            ) : null}

            {/* Badges métier */}
            <div style={{ display: "flex", gap: 12 }}>
              {metiersLabels.map((label: string) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    background: "#1a1a2e",
                    color: "#ffd93d",
                    fontSize: 26,
                    padding: "10px 30px",
                    borderRadius: 50,
                    textTransform: "uppercase",
                    letterSpacing: 3,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Logo */}
          {hasLogo ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 260,
                padding: "48px 36px",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoDataUrl!}
                alt=""
                width={164}
                height={164}
                style={{
                  borderRadius: 24,
                  border: "6px solid #1a1a2e",
                  objectFit: "cover",
                  background: "#fff",
                }}
              />
            </div>
          ) : null}
        </div>
      </div>,
      {
        width: W,
        height: H,
        fonts: font
          ? [
              {
                name: "Bangers",
                data: font.buffer.slice(
                  font.byteOffset,
                  font.byteOffset + font.byteLength
                ) as ArrayBuffer,
                weight: 400 as const,
                style: "normal" as const,
              },
            ]
          : [],
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
    console.error("[carte] ImageResponse crash:", err);
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
