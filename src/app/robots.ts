import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/artisans", "/artisans/", "/inscription"],
        disallow: [
          "/admin",
          "/admin/",
          "/mon-espace",
          "/mon-profil",
          "/messages",
          "/bienvenue",
          "/connexion",
          "/debug-session",
          "/api/",
          "/uploads/",
        ],
      },
    ],
    sitemap: "https://oyezartisans.fr/sitemap.xml",
    host: "https://oyezartisans.fr",
  };
}
