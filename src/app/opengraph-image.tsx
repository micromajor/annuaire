import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Oyez Artisans ! — Annuaire d'artisans à Nantes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffd93d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Impact, Arial Black, sans-serif",
        border: "16px solid #1a1a2e",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Coins BD */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 36,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#1a1a2e",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 36,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#1a1a2e",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: 36,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#1a1a2e",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 36,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "#1a1a2e",
          display: "flex",
        }}
      />

      {/* Badge "O!" */}
      <div
        style={{
          background: "#1a1a2e",
          color: "#ffd93d",
          fontSize: 64,
          fontWeight: 900,
          width: 110,
          height: 110,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          letterSpacing: 2,
        }}
      >
        O!
      </div>

      {/* Titre principal */}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          color: "#1a1a2e",
          letterSpacing: 4,
          lineHeight: 1,
          textTransform: "uppercase",
        }}
      >
        OYEZ ARTISANS !
      </div>

      {/* Bandeau sous-titre */}
      <div
        style={{
          marginTop: 40,
          background: "#1a1a2e",
          color: "#ffd93d",
          fontSize: 30,
          fontWeight: 700,
          padding: "14px 48px",
          borderRadius: 8,
          letterSpacing: 1,
        }}
      >
        Annuaire d&apos;artisans · Nantes & Est Loire-Atlantique
      </div>
    </div>,
    { ...size }
  );
}
