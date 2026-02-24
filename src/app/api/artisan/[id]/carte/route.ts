// Carte de visite artisan — PNG téléchargeable / partageable
// Rendu côté serveur (Node runtime) pour accès Prisma
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db/client";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const W = 1050;
const H = 600;

const METIER_EMOJI: Record<string, string> = {
  macon: "🧱",
  plombier: "🔧",
  electricien: "⚡",
  menuisier: "🪵",
  peintre: "🎨",
  couvreur: "🏠",
  carreleur: "🔲",
  chauffagiste: "🔥",
  plaquiste: "🪚",
  charpentier: "🔩",
  terrassier: "⛏️",
  paysagiste: "🌿",
  ramoneur: "🏭",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artisan = await prisma.artisan.findFirst({
    where: { id, status: "VALIDE", deletedAt: null },
    select: {
      prenom: true,
      nom: true,
      raisonSociale: true,
      telephone: true,
      siteWeb: true,
      logoUrl: true,
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
      avis: { where: { status: "VALIDE" }, select: { note: true } },
    },
  });

  if (!artisan) {
    return new Response("Not found", { status: 404 });
  }

  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metiersLabels = artisan.metiers.map((m) => m.metier.label);
  const communeNoms = artisan.communes.map((c) => c.commune.nom).slice(0, 3);
  const firstSlug = artisan.metiers[0]?.metier.slug ?? "";
  const emoji = METIER_EMOJI[firstSlug] ?? "🔨";
  const tel = artisan.telephone;
  const logoAbsolu = artisan.logoUrl?.startsWith("http") ? artisan.logoUrl : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr";
  const ficheUrl = `${appUrl}/artisan/${id}`;

  const avisCount = artisan.avis.length;
  const moyenne =
    avisCount > 0 ? artisan.avis.reduce((acc, a) => acc + a.note, 0) / avisCount : null;

  const nomFontSize = nom.length > 28 ? 56 : nom.length > 20 ? 66 : 78;

  const download = req.nextUrl.searchParams.get("dl") === "1";

  const image = new ImageResponse(
    <div
      style={{
        width: W,
        height: H,
        background: "#ffd93d",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Impact, Arial Black, sans-serif",
        border: "12px solid #1a1a2e",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fond halftone BD */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(26,26,46,0.12) 2px, transparent 2px)",
          backgroundSize: "20px 20px",
          display: "flex",
        }}
      />

      {/* CORPS PRINCIPAL */}
      <div style={{ display: "flex", flex: 1, zIndex: 1 }}>

        {/* COLONNE GAUCHE — identité */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "42px 48px 32px 48px",
            gap: 0,
          }}
        >
          {/* Bandeau OYEZ ARTISANS en haut */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                background: "#1a1a2e",
                color: "#ffd93d",
                fontSize: 22,
                fontWeight: 900,
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
                fontSize: 20,
                fontWeight: 900,
                color: "#1a1a2e",
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              Oyez Artisans !
            </span>
          </div>

          {/* Badge métier */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#1a1a2e",
              color: "#ffd93d",
              fontSize: 18,
              fontWeight: 900,
              padding: "7px 20px",
              borderRadius: 50,
              width: "fit-content",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
              boxShadow: "4px 4px 0 rgba(0,0,0,0.25)",
            }}
          >
            <span style={{ fontSize: 22 }}>{emoji}</span>
            {metiersLabels.slice(0, 2).join("  /  ")}
          </div>

          {/* Nom artisan — très grand */}
          <div
            style={{
              fontSize: nomFontSize,
              fontWeight: 900,
              color: "#1a1a2e",
              lineHeight: 1.0,
              letterSpacing: 1,
              display: "flex",
            }}
          >
            {nom}
          </div>

          {/* Note étoiles si dispo */}
          {moyenne !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  color: "#ff9500",
                  letterSpacing: 2,
                  display: "flex",
                }}
              >
                {"★".repeat(Math.round(moyenne))}{"☆".repeat(5 - Math.round(moyenne))}
              </span>
              <span style={{ fontSize: 20, fontWeight: 900, color: "#1a1a2e" }}>
                {moyenne.toFixed(1)}/5
              </span>
            </div>
          )}
        </div>

        {/* COLONNE DROITE — logo + infos */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 280,
            background: "#1a1a2e",
            padding: "36px 28px",
            gap: 20,
            flexShrink: 0,
          }}
        >
          {/* Logo ou emoji */}
          {logoAbsolu ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoAbsolu}
              alt={nom}
              width={130}
              height={130}
              style={{
                borderRadius: 18,
                border: "5px solid #ffd93d",
                objectFit: "cover",
                background: "#fff",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 130,
                height: 130,
                background: "#ffd93d",
                borderRadius: 18,
                border: "5px solid #ffd93d",
                fontSize: 64,
                boxShadow: "5px 5px 0 rgba(255,217,61,0.3)",
              }}
            >
              {emoji}
            </div>
          )}

          {/* Téléphone */}
          {tel && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#6bcb77",
                color: "#1a1a2e",
                fontSize: 18,
                fontWeight: 900,
                padding: "8px 16px",
                borderRadius: 10,
                border: "3px solid #ffd93d",
                letterSpacing: 1,
                width: "100%",
                justifyContent: "center",
              }}
            >
              📞 {tel}
            </div>
          )}

          {/* Zones */}
          {communeNoms.length > 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                width: "100%",
              }}
            >
              {communeNoms.map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "rgba(255,217,61,0.9)",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  📍 {c}
                </div>
              ))}
              {artisan.communes.length > 3 && (
                <div style={{ color: "rgba(255,217,61,0.5)", fontSize: 13, fontWeight: 700, display: "flex" }}>
                  +{artisan.communes.length - 3} autres zones
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER — URL */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1a1a2e",
          paddingLeft: 44,
          paddingRight: 44,
          height: 60,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: "rgba(255,217,61,0.7)",
            textTransform: "uppercase",
            letterSpacing: 3,
            display: "flex",
          }}
        >
          {ficheUrl.replace("https://", "")}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#ffd93d",
            color: "#1a1a2e",
            fontSize: 17,
            fontWeight: 900,
            padding: "10px 28px",
            borderRadius: 50,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Contactez-moi →
        </div>
      </div>
    </div>,
    { width: W, height: H }
  );

  // Mode téléchargement : ajoute Content-Disposition
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
