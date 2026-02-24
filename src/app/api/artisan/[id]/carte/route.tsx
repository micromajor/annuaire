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

// Police Bangers (BD) chargée depuis le FS local — une seule fois au démarrage du process
const bangersFont: Buffer = fs.readFileSync(
  path.join(process.cwd(), "public/fonts/Bangers-Regular.ttf")
);

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
      description: true,
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
      avis: { where: { status: "VALIDE" }, select: { note: true } },
    },
  });

  if (!artisan) {
    return new Response("Not found", { status: 404 });
  }

  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metiersLabels = artisan.metiers.map((m: { metier: { label: string } }) => m.metier.label);
  const communeNoms = artisan.communes
    .map((c: { commune: { nom: string } }) => c.commune.nom)
    .slice(0, 3);
  const firstSlug = artisan.metiers[0]?.metier.slug ?? "";
  const emoji = METIER_EMOJI[firstSlug] ?? "🔨";
  const tel = artisan.telephone;
  const logoAbsolu = artisan.logoUrl?.startsWith("http") ? artisan.logoUrl : null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://oyezartisans.fr";
  const ficheUrl = `${appUrl}/artisan/${id}`;
  const rawDesc = artisan.description ?? "";
  const descSnippet = rawDesc.length > 110 ? rawDesc.slice(0, 107) + "…" : rawDesc;

  const avisCount = artisan.avis.length;
  const moyenne =
    avisCount > 0
      ? artisan.avis.reduce((acc: number, a: { note: number }) => acc + a.note, 0) / avisCount
      : null;
  const stars = moyenne !== null ? Math.round(moyenne) : 0;

  const nomFontSize = nom.length > 28 ? 58 : nom.length > 20 ? 70 : 84;
  const download = req.nextUrl.searchParams.get("dl") === "1";

  const image = new ImageResponse(
    <div
      style={{
        width: W,
        height: H,
        background: "#fef9e7",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Bangers, Impact, Arial Black, sans-serif",
        border: "12px solid #1a1a2e",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* HEADER — bandeau sombre */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1a1a2e",
          paddingLeft: 40,
          paddingRight: 40,
          height: 68,
          flexShrink: 0,
        }}
      >
        {/* Logo marque */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              background: "#ffd93d",
              color: "#1a1a2e",
              fontSize: 20,
              fontWeight: 400,
              width: 40,
              height: 40,
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
              fontSize: 26,
              fontWeight: 400,
              color: "#ffd93d",
              textTransform: "uppercase",
              letterSpacing: 6,
              display: "flex",
            }}
          >
            Oyez Artisans !
          </span>
        </div>
        {/* Badge métier dans le header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#ffd93d",
            color: "#1a1a2e",
            fontSize: 20,
            fontWeight: 400,
            padding: "6px 20px",
            borderRadius: 50,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          <span style={{ fontSize: 18 }}>{emoji}</span>
          {metiersLabels.slice(0, 2).join(" / ")}
        </div>
      </div>

      {/* CORPS */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Colonne gauche — identité + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "36px 48px",
            gap: 16,
          }}
        >
          {/* Nom artisan */}
          <div
            style={{
              fontSize: nomFontSize,
              fontWeight: 400,
              color: "#1a1a2e",
              lineHeight: 1.0,
              letterSpacing: 3,
              display: "flex",
              textTransform: "uppercase",
            }}
          >
            {nom}
          </div>

          {/* Description courte */}
          {descSnippet && (
            <div
              style={{
                fontSize: 22,
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                color: "#444",
                lineHeight: 1.4,
                display: "flex",
                maxWidth: 640,
              }}
            >
              {descSnippet}
            </div>
          )}

          {/* Zones + note */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {communeNoms.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#dbeeff",
                  border: "3px solid #1a1a2e",
                  borderRadius: 50,
                  padding: "5px 18px",
                  boxShadow: "3px 3px 0 #1a1a2e",
                  fontSize: 18,
                  fontWeight: 400,
                  color: "#1a4080",
                  letterSpacing: 2,
                }}
              >
                📍 {communeNoms.join(" · ")}
                {artisan.communes.length > 3 ? ` +${artisan.communes.length - 3}` : ""}
              </div>
            )}
            {moyenne !== null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#fff8e1",
                  border: "3px solid #1a1a2e",
                  borderRadius: 50,
                  padding: "5px 18px",
                  boxShadow: "3px 3px 0 #1a1a2e",
                  fontSize: 18,
                  color: "#1a1a2e",
                  letterSpacing: 1,
                }}
              >
                <span style={{ color: "#ff9500", fontSize: 20, display: "flex" }}>
                  {"★".repeat(stars)}
                  {"☆".repeat(5 - stars)}
                </span>
                <span style={{ fontWeight: 400, display: "flex" }}>{moyenne.toFixed(1)}/5</span>
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite — logo + téléphone */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 240,
            background: "#ffd93d",
            borderLeft: "8px solid #1a1a2e",
            padding: "28px 24px",
            gap: 18,
            flexShrink: 0,
          }}
        >
          {/* Logo ou emoji */}
          {logoAbsolu ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoAbsolu}
              alt={nom}
              width={120}
              height={120}
              style={{
                borderRadius: 16,
                border: "5px solid #1a1a2e",
                objectFit: "cover",
                background: "#fff",
                boxShadow: "5px 5px 0 #1a1a2e",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 120,
                height: 120,
                background: "#fff",
                borderRadius: 16,
                border: "5px solid #1a1a2e",
                fontSize: 58,
                boxShadow: "5px 5px 0 #1a1a2e",
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
                background: "#1a1a2e",
                color: "#6bcb77",
                fontSize: 17,
                fontWeight: 400,
                padding: "8px 14px",
                borderRadius: 10,
                border: "3px solid #1a1a2e",
                letterSpacing: 1,
                justifyContent: "center",
                width: "100%",
              }}
            >
              📞 {tel}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1a1a2e",
          paddingLeft: 40,
          paddingRight: 40,
          height: 56,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 400,
            color: "rgba(255,217,61,0.6)",
            textTransform: "uppercase",
            letterSpacing: 4,
            display: "flex",
          }}
        >
          {ficheUrl.replace("https://", "")}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#ffd93d",
            color: "#1a1a2e",
            fontSize: 20,
            fontWeight: 400,
            padding: "8px 24px",
            borderRadius: 50,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Voir la fiche →
        </div>
      </div>
    </div>,
    {
      width: W,
      height: H,
      fonts: [
        {
          name: "Bangers",
          data: bangersFont,
          weight: 400,
          style: "normal",
        },
      ],
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
