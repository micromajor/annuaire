import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
        border: "10px solid #1a1a2e",
        boxSizing: "border-box",
        borderRadius: 24,
        position: "relative",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          color: "#ffd93d",
          fontSize: 80,
          fontWeight: 900,
          width: 120,
          height: 120,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: 2,
        }}
      >
        O!
      </div>
    </div>,
    { ...size }
  );
}
