import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dévoile — Révèle la meilleure version de toi",
  description: "Programme coaching personnalisé sur 3 mois : nutrition, sport, routine de vie. Bilan généré par IA.",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "Dévoile by ShineUp Coaching",
    description: "Révèle la meilleure version de toi — programme sur mesure par IA",
    siteName: "Dévoile",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* Google Fonts — Playfair Display + DM Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
