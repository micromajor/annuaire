import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";
export const alt = "Carte artisan — Oyez Artisans !";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function extractHandle(network: string, raw: string): string {
  try {
    const url = raw.trim();
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const path = u.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    const last = path.split("/").pop() ?? path;
    switch (network) {
      case "instagram":
      case "facebook":
      case "twitterX":
        return `@${last}`;
      case "youtube":
        return last.startsWith("@") ? last : `@${last}`;
      case "linkedin":
        return path.replace(/^(in|company)\//, "").split("/")[0];
      case "whatsapp": {
        const digits = url.replace(/\D/g, "");
        if (digits.startsWith("33") && digits.length >= 11) return `0${digits.slice(2, 12)}`;
        return digits.slice(-10);
      }
      default:
        return url;
    }
  } catch {
    return raw;
  }
}

const SOCIAL_CONFIG: Record<string, { color: string; label: string }> = {
  instagram: { color: "#E1306C", label: "Ig" },
  facebook: { color: "#1877F2", label: "f" },
  youtube: { color: "#FF0000", label: "▶" },
  linkedin: { color: "#0A66C2", label: "in" },
  twitterX: { color: "#000000", label: "𝕏" },
  whatsapp: { color: "#25D366", label: "W" },
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const artisan = await prisma.artisan
    .findFirst({
      where: { id, deletedAt: null },
      include: { metiers: { include: { metier: true } } },
    })
    .catch(() => null);

  const bangersFont = readFileSync(join(process.cwd(), "public/fonts/Bangers-Regular.ttf"));

  const nom = artisan?.raisonSociale
    ? artisan.raisonSociale
    : artisan
      ? `${artisan.prenom} ${artisan.nom}`
      : "Artisan";

  const metiers = artisan?.metiers?.slice(0, 4).map((m) => m.metier.label) ?? [];
  const accroche = artisan?.accroche ?? "";
  const telephone = artisan?.telephone ?? "";

  const socials: { handle: string; cfg: { color: string; label: string } }[] = [];
  for (const network of ["instagram", "facebook", "youtube", "linkedin", "twitterX", "whatsapp"]) {
    const raw = artisan?.[network as keyof typeof artisan] as string | null | undefined;
    if (raw) {
      socials.push({ handle: extractHandle(network, raw), cfg: SOCIAL_CONFIG[network] });
    }
  }

  // Charge le logo artisan si disponible — sharp convertit tout format en PNG (WebP inclus)
  let logoSrc: string | null = null;
  if (artisan?.logoUrl) {
    try {
      const base = (process.env.NEXTAUTH_URL ?? "https://oyezartisans.fr").replace(/\/$/, "");
      const logoUrl = artisan.logoUrl.startsWith("http")
        ? artisan.logoUrl
        : `${base}${artisan.logoUrl}`;
      const res = await fetch(logoUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const pngBuf = await sharp(buf).png().toBuffer();
        logoSrc = `data:image/png;base64,${pngBuf.toString("base64")}`;
      }
    } catch {
      /* fallback silencieux */
    }
  }

  const hasSocials = socials.length > 0;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "8px solid #1a1a2e",
        background: "#fff",
        fontFamily: "sans-serif",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "#1a1a2e",
          height: 72,
          display: "flex",
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 44px",
        }}
      >
        <div
          style={{
            fontFamily: "Bangers",
            fontSize: 40,
            color: "#ffd93d",
            letterSpacing: 3,
            display: "flex",
          }}
        >
          OYEZ ARTISANS !
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#ffd93d",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
            display: "flex",
          }}
        >
          Annuaire Artisans du Bâtiment — Nantes &amp; Loire-Atlantique
        </div>
      </div>

      {/* ── Contenu principal ── */}
      <div
        style={{
          display: "flex",
          flexGrow: 1,
          background: "#fdf6e3",
          padding: "28px 44px",
          gap: 24,
        }}
      >
        {/* Colonne texte */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 16,
          }}
        >
          {/* Nom + badge */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                fontFamily: "Bangers",
                fontSize: nom.length > 18 ? 52 : 66,
                color: "#1a1a2e",
                letterSpacing: 3,
                lineHeight: 1,
                display: "flex",
              }}
            >
              {nom.toUpperCase()}
            </div>
            {artisan?.status === "VALIDE" ? (
              <div
                style={{
                  background: "#6bcb77",
                  border: "2.5px solid #1a1a2e",
                  borderRadius: 20,
                  padding: "5px 14px",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#1a1a2e",
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 6,
                  letterSpacing: 0.5,
                }}
              >
                PRO VÉRIFIÉ
              </div>
            ) : null}
          </div>

          {/* Métiers pills */}
          {metiers.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {metiers.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffd93d",
                    border: "2.5px solid #1a1a2e",
                    borderRadius: 24,
                    padding: "5px 20px",
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#1a1a2e",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    display: "flex",
                  }}
                >
                  {m.toUpperCase()}
                </div>
              ))}
            </div>
          ) : null}

          {/* Accroche */}
          {accroche ? (
            <div
              style={{
                fontSize: 22,
                color: "#4a3728",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: 0.5,
                display: "flex",
              }}
            >
              &quot;{accroche.toUpperCase()}&quot;
            </div>
          ) : null}

          {/* Téléphone — poussé en bas de la colonne */}
          {telephone ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                gap: 10,
                border: "2.5px solid #1a1a2e",
                borderRadius: 28,
                padding: "8px 28px",
                fontSize: 24,
                fontWeight: 700,
                color: "#1a1a2e",
                background: "#fff",
                marginTop: "auto",
              }}
            >
              ☎ {telephone}
            </div>
          ) : null}
        </div>

        {/* Colonne logo */}
        <div
          style={{
            width: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {logoSrc ? (
            <img src={logoSrc} width={260} height={200} style={{ objectFit: "contain" }} />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: 20,
                  width: 110,
                  height: 110,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Bangers",
                  fontSize: 58,
                  color: "#ffd93d",
                  letterSpacing: 2,
                }}
              >
                O!
              </div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 26,
                  color: "#1a1a2e",
                  display: "flex",
                  letterSpacing: 1,
                }}
              >
                ovezartisans
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Barre réseaux sociaux ── */}
      {hasSocials ? (
        <div
          style={{
            display: "flex",
            background: "#ffffff",
            borderTop: "3px solid #1a1a2e",
            height: 80,
            alignItems: "center",
            justifyContent: "space-around",
            padding: "0 44px",
            flexShrink: 0,
            gap: 8,
          }}
        >
          {socials.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  background: s.cfg.color,
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 900,
                }}
              >
                {s.cfg.label}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1a1a2e",
                  display: "flex",
                }}
              >
                {s.handle}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* ── Footer ── */}
      <div
        style={{
          background: "#ffd93d",
          borderTop: "3px solid #1a1a2e",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: "Bangers",
          fontSize: 30,
          color: "#1a1a2e",
          letterSpacing: 8,
        }}
      >
        OYEZARTISANS.FR
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Bangers",
          data: bangersFont.buffer as ArrayBuffer,
          style: "normal",
        },
      ],
    }
  );
}
