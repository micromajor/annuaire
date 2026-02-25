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

  let artisan: {
    prenom: string | null;
    nom: string | null;
    raisonSociale: string | null;
    logoUrl: string | null;
    accroche: string | null;
    metiers: { metier: { label: string } }[];
  } | null = null;

  try {
    artisan = await prisma.artisan.findFirst({
      where: { id, status: "VALIDE", deletedAt: null },
      select: {
        prenom: true,
        nom: true,
        raisonSociale: true,
        logoUrl: true,
        accroche: true,
        metiers: { include: { metier: true } },
      },
    });
  } catch {
    return new Response("DB error", { status: 500 });
  }

  if (!artisan) {
    return new Response("Not found", { status: 404 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr").replace(/\/$/, "");
  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metiersLabels = artisan.metiers.map((m: { metier: { label: string } }) => m.metier.label);
  // Logo : accepte les URLs absolues ET les chemins relatifs /api/files/…
  const logoAbsolu = artisan.logoUrl
    ? artisan.logoUrl.startsWith("http")
      ? artisan.logoUrl
      : `${appUrl}${artisan.logoUrl}`
    : null;
  const accroche = artisan.accroche ?? "";

  // Taille du nom selon longueur et présence de logo
  const hasLogo = !!logoAbsolu;
  const nomFontSize = nom.length > 28 ? 62 : nom.length > 18 ? 80 : 100;
  const download = req.nextUrl.searchParams.get("dl") === "1";
  const font = getBangersFont();

  const image = new ImageResponse(
    <div
      style={{
        width: W,
        height: H,
        background: "#ffd93d",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Bangers, Impact, Arial Black, sans-serif",
        border: "14px solid #1a1a2e",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Demi-teinte BD subtile */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(26,26,46,0.07) 2px, transparent 2px)",
          backgroundSize: "26px 26px",
          display: "flex",
        }}
      />

      {/* CORPS — flex row */}
      <div style={{ display: "flex", flex: 1, zIndex: 1 }}>
        {/* Zone principale — branding + nom + métier */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "48px 56px",
          }}
        >
          {/* Branding OYEZ ARTISANS ! 44 */}
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
                letterSpacing: 1,
                flexShrink: 0,
              }}
            >
              O!
            </div>
            <span
              style={{
                fontSize: 28,
                color: "#1a1a2e",
                textTransform: "uppercase",
                letterSpacing: 5,
                display: "flex",
              }}
            >
              Oyez Artisans ! 44
            </span>
          </div>

          {/* Nom artisan — dominant */}
          <div
            style={{
              fontSize: nomFontSize,
              color: "#1a1a2e",
              lineHeight: 0.95,
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {nom}
          </div>

          {/* Accroche */}
          {accroche && (
            <div
              style={{
                fontSize: 26,
                fontFamily: "Arial, sans-serif",
                fontStyle: "italic",
                color: "#333",
                lineHeight: 1.3,
                display: "flex",
                maxWidth: hasLogo ? 620 : 980,
              }}
            >
              {accroche}
            </div>
          )}

          {/* Badge(s) métier */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {metiersLabels.map((label: string) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
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

        {/* Colonne droite — logo si disponible */}
        {hasLogo && (
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
              src={logoAbsolu!}
              alt={nom}
              width={164}
              height={164}
              style={{
                borderRadius: 24,
                border: "6px solid #1a1a2e",
                objectFit: "cover",
                background: "#fff",
                boxShadow: "7px 7px 0 #1a1a2e",
              }}
            />
          </div>
        )}
      </div>
    </div>,
    {
      width: W,
      height: H,
      fonts: font
        ? [{ name: "Bangers", data: font, weight: 400 as const, style: "normal" as const }]
        : [],
    }
  );

  if (download) {
    const buffer = await image.arrayBuffer();
    const slug = nom
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="carte-${slug}-oyezartisans.png"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  return image;
}
