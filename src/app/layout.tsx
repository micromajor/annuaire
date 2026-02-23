import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import FeedbackWidget from "@/components/features/FeedbackWidget";

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oyezartisans.fr"),
  title: {
    default: "Oyez Artisans ! — Trouvez votre artisan près de chez vous",
    template: "%s | Oyez Artisans !",
  },
  description:
    "Annuaire hyperlocal d’artisans du bâtiment à Nantes et Est Loire-Atlantique. Maçon, plombier, électricien, menuisier… Trouvez et contactez directement votre artisan près de chez vous.",
  keywords: [
    "artisan",
    "annuaire artisan",
    "artisan bâtiment",
    "rénovation",
    "plombier Nantes",
    "électricien Nantes",
    "maçon Loire-Atlantique",
    "menuisier Nantes",
    "couvreur Nantes",
    "travaux maison",
    "devis artisan",
    "oyezartisans",
    "Loire-Atlantique",
    "44",
  ],
  authors: [{ name: "Oyez Artisans !", url: "https://oyezartisans.fr" }],
  creator: "Oyez Artisans !",
  publisher: "Oyez Artisans !",
  alternates: {
    canonical: "https://oyezartisans.fr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://oyezartisans.fr",
    siteName: "Oyez Artisans !",
    title: "Oyez Artisans ! — Artisans du bâtiment à Nantes et Loire-Atlantique",
    description:
      "Annuaire hyperlocal d’artisans vérifiés. Contact direct, sans intermédiaire. Nantes et Est Loire-Atlantique.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Oyez Artisans !" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oyez Artisans ! — Artisans du bâtiment à Nantes",
    description: "Annuaire hyperlocal d'artisans vérifiés en Loire-Atlantique.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${bangers.variable} ${nunito.variable}`}>
        <SessionProvider>
          {children}
          <FeedbackWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
