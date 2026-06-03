// src/app/layout.tsx
// Layout racine — s'applique automatiquement à TOUTES les pages

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHINEUP — Coach Remise en Forme",
  description: "Ton programme personnalisé sur 3 mois : nutrition, sport, hygiène de vie.",
  icons: {
    icon: "/favicon.svg",       // on génère ce fichier ci-dessous
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SHINEUP Coach",
    description: "Programme remise en forme sur-mesure en 3 mois",
    siteName: "SHINEUP",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Favicon SVG inline — pas besoin d'image externe */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0a0a0a", color: "#f0f0f0", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
