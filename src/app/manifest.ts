import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oyez Artisans !",
    short_name: "Oyez Artisans",
    description: "Annuaire des artisans du bâtiment à Nantes et en Loire-Atlantique",
    start_url: "/",
    display: "standalone",
    background_color: "#ffd93d",
    theme_color: "#1a1a2e",
    lang: "fr",
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "lifestyle"],
  };
}
