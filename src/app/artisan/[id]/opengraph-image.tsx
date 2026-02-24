// OG image dynamique par fiche artisan
// Rendu côté serveur (Node runtime) pour accès Prisma
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db/client";

export const alt = "Fiche artisan — Oyez Artisans !";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artisan = await prisma.artisan.findFirst({
    where: { id, status: "VALIDE", deletedAt: null },
    include: {
      metiers: { include: { metier: true } },
      communes: { include: { commune: true } },
      avis: { where: { status: "VALIDE" }, select: { note: true } },
    },
  });

  // Fiche inconnue → image générique
  if (!artisan) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffd93d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Impact, Arial Black, sans-serif",
          fontSize: 64,
          color: "#1a1a2e",
          border: "16px solid #1a1a2e",
          boxSizing: "border-box",
        }}
      >
        Oyez Artisans !
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const nom = artisan.raisonSociale ?? `${artisan.prenom} ${artisan.nom}`;
  const metiersLabels = artisan.metiers.map((m) => m.metier.label);
  const communeNoms = artisan.communes.map((c) => c.commune.nom).slice(0, 3);
  const firstSlug = artisan.metiers[0]?.metier.slug ?? "";
  const emoji = METIER_EMOJI[firstSlug] ?? "🔨";
  const avisCount = artisan.avis.length;
  const moyenne =
    avisCount > 0 ? artisan.avis.reduce((acc, a) => acc + a.note, 0) / avisCount : null;
  const stars = moyenne !== null ? Math.round(moyenne) : 0;
  const isPro = !!artisan.siret;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#1a1a2e",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Impact, Arial Black, sans-serif",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Fond demi-teinte BD (points simulés par un dégradé) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, rgba(255,217,61,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          display: "flex",
        }}
      />

      {/* Bordure jaune gauche */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 12,
          background: "#ffd93d",
          display: "flex",
        }}
      />

      {/* Contenu principal */}
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "stretch",
          paddingLeft: 36,
        }}
      >
        {/* Colonne gauche — infos artisan */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: 40,
            paddingTop: 48,
            paddingBottom: 48,
          }}
        >
          {/* Badge métier */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 36 }}>{emoji}</span>
            <div
              style={{
                background: "#ffd93d",
                color: "#1a1a2e",
                fontSize: 20,
                fontWeight: 900,
                padding: "6px 20px",
                borderRadius: 40,
                border: "3px solid #1a1a1a",
                display: "flex",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {metiersLabels.slice(0, 2).join(" · ")}
            </div>
            {isPro && (
              <div
                style={{
                  background: "#6bcb77",
                  color: "#1a1a2e",
                  fontSize: 16,
                  fontWeight: 900,
                  padding: "6px 16px",
                  borderRadius: 40,
                  border: "3px solid #1a1a1a",
                  display: "flex",
                }}
              >
                PRO VERIFIE
              </div>
            )}
          </div>

          {/* Nom */}
          <div
            style={{
              fontSize: nom.length > 24 ? 58 : 72,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
              marginBottom: 16,
              textShadow: "4px 4px 0 #ffd93d",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {nom}
          </div>

          {/* Avis étoiles */}
          {moyenne !== null && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 28,
                      color: i <= stars ? "#ffd93d" : "#555",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span
                style={{
                  fontSize: 22,
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                {moyenne.toFixed(1)} ({avisCount} avis)
              </span>
            </div>
          )}

          {/* Communes */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 24, color: "#60c5f1" }}>📍</span>
            <span
              style={{
                fontSize: 22,
                color: "#60c5f1",
                fontWeight: 700,
              }}
            >
              {communeNoms.join(" · ")}
              {artisan.communes.length > 3 ? ` +${artisan.communes.length - 3}` : ""}
            </span>
          </div>
        </div>

        {/* Colonne droite — branding */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 280,
            background: "#ffd93d",
            borderLeft: "6px solid #1a1a1a",
            padding: "40px 28px",
            gap: 16,
          }}
        >
          {/* Logo artisan si disponible, sinon emoji géant */}
          {artisan.logoUrl && artisan.logoUrl.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artisan.logoUrl}
              alt={nom}
              width={140}
              height={140}
              style={{
                borderRadius: 24,
                border: "4px solid #1a1a1a",
                objectFit: "cover",
                background: "#fff",
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 140,
                height: 140,
                background: "#fff",
                borderRadius: 24,
                border: "4px solid #1a1a1a",
              }}
            >
              {emoji}
            </div>
          )}

          {/* Site name */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#1a1a2e",
              textAlign: "center",
              lineHeight: 1.2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 28 }}>🔨</span>
            <span>Oyez</span>
            <span>Artisans !</span>
          </div>

          {/* Zone géo */}
          <div
            style={{
              fontSize: 13,
              color: "#1a1a2e",
              background: "rgba(26,26,46,0.12)",
              borderRadius: 12,
              padding: "6px 12px",
              textAlign: "center",
              display: "flex",
            }}
          >
            Nantes & Loire-Atlantique
          </div>
        </div>
      </div>

      {/* Bande basse — CTA */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#ffd93d",
          borderTop: "6px solid #1a1a1a",
          paddingLeft: 48,
          paddingRight: 48,
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "#1a1a2e",
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          oyezartisans.fr
        </span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            background: "#1a1a2e",
            color: "#ffd93d",
            padding: "8px 24px",
            borderRadius: 40,
            border: "3px solid #1a1a1a",
            display: "flex",
          }}
        >
          Voir la fiche →
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
