import type { Metadata } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

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
  title: {
    default: "OyezArtisans — Trouvez un artisan près de chez vous",
    template: "%s | OyezArtisans",
  },
  description:
    "OyezArtisans : annuaire hyperlocal d'artisans du bâtiment. Maçon, plombier, électricien, menuisier… Trouvez et contactez directement le bon artisan près de chez vous.",
  keywords: [
    "artisan",
    "annuaire artisan",
    "bâtiment",
    "rénovation",
    "plombier",
    "électricien",
    "oyezartisans",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${bangers.variable} ${nunito.variable}`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
