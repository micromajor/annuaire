// OG image dynamique par fiche artisan — theme BD
// Rendu cote serveur (Node runtime) pour acces Prisma
import { ImageResponse } from "next/og";
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
      siret: true,
      telephone: true,
      logoUrl: true,
      description: true,
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
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
  const metiersLabels = artisan.metiers.map((m) => m.metier.label);
  const communeNoms = artisan.communes.map((c) => c.commune.nom).slice(0, 4);
  const firstSlug = artisan.metiers[0]?.metier.slug ?? "";
  const emoji = METIER_EMOJI[firstSlug] ?? "\u{1F528}";
  const avisCount = artisan.avis.length;
  const moyenne =
    avisCount > 0 ? artisan.avis.reduce((acc, a) => acc + a.note, 0) / avisCount : null;
  const stars = moyenne !== null ? Math.round(moyenne) : 0;
  const isPro = !!artisan.siret;
  const tel = artisan.telephone;
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
        if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.mimeType)) {
          logoDataUrl = `data:${file.mimeType};base64,${Buffer.from(file.data).toString("base64")}`;
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
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 34 }}>{"\u{1F528}"}</span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: "#ffd93d",
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            Oyez Artisans !
          </span>
        </div>
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
        {/* Colonne gauche — avatar / note */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 260,
            background: "#ffd93d",
            borderRight: "8px solid #1a1a2e",
            gap: 20,
            padding: "28px 24px",
            flexShrink: 0,
          }}
        >
          {/* Logo ou emoji dans encadre BD */}
          {logoDataUrl ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 144,
                height: 144,
                borderRadius: 20,
                border: "6px solid #1a1a2e",
                background: "#fff",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoDataUrl}
                alt={nom}
                width={144}
                height={144}
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 144,
                height: 144,
                background: "#fff",
                borderRadius: 20,
                border: "6px solid #1a1a2e",
                fontSize: 72,
                boxShadow: "5px 5px 0 #1a1a2e",
              }}
            >
              {emoji}
            </div>
          )}

          {/* Note etoiles */}
          {moyenne !== null && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "#fff",
                border: "4px solid #1a1a2e",
                borderRadius: 16,
                padding: "10px 18px",
                boxShadow: "4px 4px 0 #1a1a2e",
              }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} style={{ fontSize: 22, color: i <= stars ? "#ff9500" : "#ddd" }}>
                    &#9733;
                  </span>
                ))}
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#1a1a2e" }}>
                {moyenne.toFixed(1)}/5
              </span>
              <span style={{ fontSize: 14, color: "#666", fontWeight: 700 }}>{avisCount} avis</span>
            </div>
          )}
        </div>

        {/* Colonne droite — infos artisan */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "32px 44px",
            gap: 18,
          }}
        >
          {/* Badges metier + pro */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#ffd93d",
                color: "#1a1a2e",
                fontSize: 20,
                fontWeight: 900,
                padding: "7px 22px",
                border: "4px solid #1a1a2e",
                borderRadius: 50,
                textTransform: "uppercase",
                letterSpacing: 2,
                boxShadow: "4px 4px 0 #1a1a2e",
              }}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
              {metiersLabels.slice(0, 2).join("  /  ")}
            </div>
            {isPro && (
              <div
                style={{
                  display: "flex",
                  background: "#6bcb77",
                  color: "#1a1a2e",
                  fontSize: 16,
                  fontWeight: 900,
                  padding: "7px 18px",
                  border: "4px solid #1a1a2e",
                  borderRadius: 50,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  boxShadow: "3px 3px 0 #1a1a2e",
                }}
              >
                &#10003; PRO VERIFIE
              </div>
            )}
          </div>

          {/* Nom artisan */}
          <div
            style={{
              fontSize: nom.length > 30 ? 52 : nom.length > 22 ? 62 : 72,
              fontWeight: 900,
              color: "#1a1a2e",
              lineHeight: 1.05,
              textShadow: "4px 4px 0 #ffd93d",
              display: "flex",
            }}
          >
            {nom}
          </div>

          {/* Zones d'intervention */}
          {communeNoms.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#dbeeff",
                  border: "3px solid #1a1a2e",
                  borderRadius: 12,
                  padding: "6px 16px",
                  boxShadow: "3px 3px 0 #1a1a2e",
                }}
              >
                <span style={{ fontSize: 22 }}>{"\u{1F4CD}"}</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: "#1a4080" }}>
                  {communeNoms.join("  \u00B7  ")}
                  {artisan.communes.length > 4 ? `  +${artisan.communes.length - 4}` : ""}
                </span>
              </div>
            </div>
          )}

          {/* Telephone — info cle pour le particulier */}
          {tel && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#e8f9ed",
                  border: "3px solid #1a1a2e",
                  borderRadius: 12,
                  padding: "6px 20px",
                  boxShadow: "3px 3px 0 #1a1a2e",
                }}
              >
                <span style={{ fontSize: 22 }}>{"\u{1F4DE}"}</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#1a5c30", letterSpacing: 1 }}>
                  {tel}
                </span>
              </div>
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
            fontSize: 24,
            fontWeight: 900,
            color: "#1a1a2e",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          oyezartisans.fr
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#1a1a2e",
            color: "#ffd93d",
            fontSize: 20,
            fontWeight: 900,
            padding: "12px 32px",
            borderRadius: 50,
            border: "4px solid #1a1a2e",
            boxShadow: "4px 4px 0 rgba(0,0,0,0.2)",
            letterSpacing: 1,
          }}
        >
          Contacter cet artisan &#x2192;
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
