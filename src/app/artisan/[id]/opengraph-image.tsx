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

  // --- Icônes réseaux sociaux : SVG Simple Icons → PNG via sharp (Satori n'accepte pas SVG) ---
  const SOCIAL_SVG: Record<string, { path: string; color: string }> = {
    instagram: {
      color: "#E1306C",
      path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24c3.259 0 3.668-.014 4.948-.072 1.277-.06 2.148-.261 2.913-.558.788-.306 1.459-.717 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.689.072-4.948 0-3.259-.014-3.667-.072-4.947-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    },
    facebook: {
      color: "#1877F2",
      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    },
    tiktok: {
      color: "#000000",
      path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    },
    youtube: {
      color: "#FF0000",
      path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    },
    linkedin: {
      color: "#0A66C2",
      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    twitterX: {
      color: "#000000",
      path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
    },
    whatsapp: {
      color: "#25D366",
      path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z",
    },
  };

  // Convertit un SVG path en PNG data URI (fond transparent) via sharp
  async function svgToPng(svgPath: string, color: string, px = 48): Promise<string> {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}"><path d="${svgPath}" fill="${color}"/></svg>`;
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    return `data:image/png;base64,${buf.toString("base64")}`;
  }

  // Extrait le handle depuis l'URL stockée (sans la racine du domaine)
  function extractHandle(network: string, raw: string | null): string {
    if (!raw) return "";
    const s = raw.trim().replace(/\/$/, "");
    try {
      if (network === "instagram") {
        const m = s.match(/instagram\.com\/([^/?#]+)/i);
        return m ? `@${m[1]}` : s;
      }
      if (network === "facebook") {
        const m = s.match(/facebook\.com\/([^/?#]+)/i);
        return m ? `@${m[1]}` : s;
      }
      if (network === "tiktok") {
        const m = s.match(/tiktok\.com\/@?([^/?#]+)/i);
        return m ? `@${m[1]}` : s;
      }
      if (network === "youtube") {
        const m = s.match(/youtube\.com\/(?:@|channel\/|user\/)?([^/?#]+)/i);
        return m ? `@${m[1]}` : s;
      }
      if (network === "linkedin") {
        const m = s.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i);
        return m ? m[1] : s;
      }
      if (network === "twitterX") {
        const m = s.match(/(?:twitter|x)\.com\/([^/?#]+)/i);
        return m ? `@${m[1]}` : s;
      }
      if (network === "whatsapp") {
        const digits = s.replace(/\D/g, "");
        if (digits.startsWith("33") && digits.length === 11) return `0${digits.slice(2)}`;
        if (digits.startsWith("0")) return digits;
        return s;
      }
    } catch {
      return s;
    }
    return s;
  }

  // Construction des badges sociaux avec icône PNG
  type SocialBadge = { iconUri: string; handle: string; color: string; network: string };
  const rawSocials: { network: string; value: string | null }[] = [
    { network: "instagram", value: artisan.instagram },
    { network: "facebook", value: artisan.facebook },
    {
      network: "tiktok",
      value: ((artisan as Record<string, unknown>).tiktok as string | null) ?? null,
    },
    { network: "youtube", value: artisan.youtube },
    { network: "twitterX", value: artisan.twitterX },
    { network: "linkedin", value: artisan.linkedin },
    { network: "whatsapp", value: artisan.whatsapp },
  ].filter((s) => !!s.value);

  const socials: SocialBadge[] = await Promise.all(
    rawSocials.map(async ({ network, value }) => {
      const def = SOCIAL_SVG[network];
      const iconUri = await svgToPng(def.path, def.color, 48);
      return { iconUri, handle: extractHandle(network, value), color: def.color, network };
    })
  );
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
                {socials.map(({ iconUri, handle, color, network }) => (
                  <div
                    key={network}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "transparent",
                      border: `2px solid ${color}`,
                      borderRadius: 8,
                      padding: "4px 10px",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={iconUri}
                      width={22}
                      height={22}
                      alt=""
                      style={{ width: 22, height: 22 }}
                    />
                    <span style={{ color, fontSize: 15, fontWeight: 900, letterSpacing: 0.5 }}>
                      {handle}
                    </span>
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
