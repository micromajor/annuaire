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
    default: "Oyez Artisans ! — Trouvez un artisan près de chez vous",
    template: "%s | Oyez Artisans !",
  },
  description:
    "Oyez Artisans ! : annuaire hyperlocal d'artisans du bâtiment à Nantes et Est Loire-Atlantique. Maçon, plombier, électricien, menuisier… Trouvez et contactez directement le bon artisan près de chez vous.",
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
