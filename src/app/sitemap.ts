import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/client";
import { COMMUNES_NANTES_EST } from "@/constants";
import { slugify } from "@/lib/utils/slugify";

const BASE = "https://oyezartisans.fr";

export const dynamic = "force-dynamic"; // rendu à la requête, pas au build
export const revalidate = 3600; // régénérer toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fiches artisans validées
  const artisans = await prisma.artisan.findMany({
    where: { status: "VALIDE", deletedAt: null },
    select: { id: true, updatedAt: true },
  });

  const artisanPages: MetadataRoute.Sitemap = artisans.map((a) => ({
    url: `${BASE}/artisan/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Landing pages métier × commune
  const allMetiers = await prisma.metier.findMany({
    select: { slug: true },
    orderBy: { label: "asc" },
  });
  const landingPages: MetadataRoute.Sitemap = allMetiers.flatMap((m) =>
    COMMUNES_NANTES_EST.map((c) => ({
      url: `${BASE}/artisans/${m.slug}/${slugify(c.nom)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }))
  );

  return [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/artisans`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE}/inscription`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${BASE}/mentions-legales`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${BASE}/politique-confidentialite`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    ...landingPages,
    ...artisanPages,
  ];
}
