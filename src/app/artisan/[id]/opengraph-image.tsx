// OG image dynamique par fiche artisan — theme BD
// Rendu cote serveur (Node runtime) pour acces Prisma
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { prisma } from "@/lib/db/client";

export const alt = "Fiche artisan — Oyez Artisans !";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const METIER_EMOJI: Record<string, string> = {
  macon: "\u{1F9F1}",
  plombier: "\u{1F527}",
  electricien: "\u26A1",
  menuisier: "\u{1FAB5}",
  peintre: "\u{1F3A8}",
  couvreur: "\u{1F3E0}",
  carreleur: "\u{1F532}",
  chauffagiste: "\u{1F525}",
  plaquiste: "\u{1FA9A}",
  charpentier: "\u{1F529}",
  terrassier: "\u26CF\uFE0F",
  paysagiste: "\u{1F33F}",
  ramoneur: "\u{1F3ED}",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artisan = await prisma.artisan.findFirst({
    where: { id, status: "VALIDE", deletedAt: null },
    select: {
      prenom: true,
      nom: true,
      raisonSociale: true,
      accroche: true,
      siret: true,
      telephone: true,
      logoUrl: true,
      description: true,
      instagram: true,
      facebook: true,
      youtube: true,
      linkedin: true,
      twitterX: true,
      whatsapp: true,
      metiers: { include: { metier: true } },
      avis: { where: { status: "VALIDE" }, select: { note: true } },
    },
  });

  // Fiche inconnue -> image generique BD
  if (!artisan) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fef9e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: 72,
          color: "#1a1a2e",
          border: "14px solid #1a1a2e",
          boxSizing: "border-box",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {"\u{1F528}"} Oyez Artisans !
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const accroche = artisan.accroche ?? null;
  const metiersLabels = artisan.metiers.map((m) => m.metier.label);
  const firstSlug = artisan.metiers[0]?.metier.slug ?? "";
  const emoji = METIER_EMOJI[firstSlug] ?? "\u{1F528}";
  const avisCount = artisan.avis.length;
  const moyenne =
    avisCount > 0 ? artisan.avis.reduce((acc, a) => acc + a.note, 0) / avisCount : null;
  const stars = moyenne !== null ? Math.round(moyenne) : 0;
  const isPro = !!artisan.siret;
  const tel = artisan.telephone;
  // Réseaux sociaux actifs
  const socials = [
    artisan.instagram ? { label: "IG", bg: "#E1306C" } : null,
    artisan.facebook ? { label: "FB", bg: "#1877F2" } : null,
    artisan.youtube ? { label: "YT", bg: "#FF0000" } : null,
    artisan.twitterX ? { label: "X", bg: "#000000" } : null,
    artisan.linkedin ? { label: "LI", bg: "#0A66C2" } : null,
    artisan.whatsapp ? { label: "WA", bg: "#25D366" } : null,
  ].filter(Boolean) as { label: string; bg: string }[];
  // Police Bangers depuis /public/fonts
  const bangersFont = await readFile(path.join(process.cwd(), "public/fonts/Bangers-Regular.ttf"));
  // Logo : data URI depuis DB — Satori n'accepte pas les chemins relatifs
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
          let imageBuffer = Buffer.from(file.data);
          let mimeType = file.mimeType;
          // Satori ne supporte que PNG et JPEG — convertir WebP/GIF/etc. en PNG
          if (!["image/png", "image/jpeg", "image/jpg"].includes(mimeType)) {
            imageBuffer = Buffer.from(await sharp(imageBuffer).png().toBuffer());
            mimeType = "image/png";
          }
          logoDataUrl = `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
        }
      } else if (artisan.logoUrl.startsWith("http")) {
        logoDataUrl = artisan.logoUrl;
      }
    } catch {
      // Pas de logo si erreur
    }
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fef9e7",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Impact, Arial Black, sans-serif",
        border: "14px solid #1a1a2e",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Demi-teinte BD — points rouge-orange en arriere-plan */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,107,107,0.18) 2px, transparent 2px)",
          backgroundSize: "22px 22px",
          display: "flex",
        }}
      />

      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#1a1a2e",
          borderBottom: "8px solid #1a1a2e",
          paddingLeft: 36,
          paddingRight: 36,
          height: 74,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "Bangers",
            fontSize: 40,
            fontWeight: 400,
            color: "#ffd93d",
            letterSpacing: 4,
          }}
        >
          OYEZ ARTISANS !
        </span>
        <span
          style={{
            fontSize: 18,
            color: "rgba(255,217,61,0.75)",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          Annuaire artisans du batiment &mdash; Nantes &amp; Loire-Atlantique
        </span>
      </div>

      {/* CORPS */}
      <div style={{ display: "flex", flex: 1, zIndex: 1 }}>
        {/* Colonne gauche — infos artisan */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "24px 32px",
          }}
        >
          {/* --- Section haute : identité --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Nom + PRO VÉRIFIÉ sur la même ligne */}
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <span
                style={{
                  fontFamily: "Bangers",
                  fontSize: nom.length > 20 ? 58 : nom.length > 15 ? 70 : 82,
                  fontWeight: 400,
                  color: "#1a1a2e",
                  lineHeight: 1.0,
                  letterSpacing: 2,
                  display: "flex",
                }}
              >
                {nom}
              </span>
              {isPro ? (
                <div
                  style={{
                    display: "flex",
                    background: "#6bcb77",
                    color: "#1a1a2e",
                    fontSize: 15,
                    fontWeight: 900,
                    padding: "6px 14px",
                    border: "4px solid #1a1a2e",
                    borderRadius: 50,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  PRO V&#201;RIFI&#201;
                </div>
              ) : null}
            </div>

            {/* Métiers — sans emoji */}
            {metiersLabels.length > 0 ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div
                  style={{
                    display: "flex",
                    background: "#ffd93d",
                    color: "#1a1a2e",
                    fontSize: 20,
                    fontWeight: 900,
                    padding: "6px 22px",
                    border: "4px solid #1a1a2e",
                    borderRadius: 50,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                  }}
                >
                  {metiersLabels.slice(0, 2).join("  /  ")}
                </div>
              </div>
            ) : null}

            {/* Phrase d'accroche */}
            {accroche ? (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#444",
                  fontStyle: "italic",
                  display: "flex",
                  lineHeight: 1.2,
                }}
              >
                &ldquo;{accroche}&rdquo;
              </div>
            ) : null}

            {/* Note étoiles */}
            {moyenne !== null ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#fff",
                    border: "3px solid #1a1a2e",
                    borderRadius: 12,
                    padding: "6px 16px",
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span
                        key={i}
                        style={{ fontSize: 20, color: i <= stars ? "#ff9500" : "#ddd" }}
                      >
                        &#9733;
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#1a1a2e" }}>
                    {moyenne.toFixed(1)}/5
                  </span>
                  <span style={{ fontSize: 14, color: "#666", fontWeight: 700 }}>
                    ({avisCount} avis)
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* --- Section basse : coordonnées --- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tel ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#e8f9ed",
                  border: "3px solid #1a1a2e",
                  borderRadius: 12,
                  padding: "6px 20px",
                  alignSelf: "flex-start",
                }}
              >
                <span style={{ fontSize: 22 }}>{"\u{1F4DE}"}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#1a5c30", letterSpacing: 1 }}>
                  {tel}
                </span>
              </div>
            ) : null}
            {socials.length > 0 ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {socials.map(({ label, bg }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      background: bg,
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 900,
                      padding: "5px 14px",
                      border: "3px solid #1a1a2e",
                      borderRadius: 8,
                      letterSpacing: 1,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Colonne droite — logo sans fond ni bordure, directement sur fond jaune */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 420,
            flexShrink: 0,
            padding: "20px 16px 20px 8px",
          }}
        >
          {logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoDataUrl}
              alt={nom}
              width={388}
              height={388}
              style={{ objectFit: "contain", width: 388, height: 388 }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 130,
              }}
            >
              {emoji}
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
          background: "#ffd93d",
          borderTop: "8px solid #1a1a2e",
          paddingLeft: 44,
          paddingRight: 44,
          height: 72,
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "Bangers",
            fontSize: 30,
            fontWeight: 400,
            color: "#1a1a2e",
            letterSpacing: 3,
          }}
        >
          OYEZARTISANS.FR
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Bangers",
          data: bangersFont,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    }
  );
}
