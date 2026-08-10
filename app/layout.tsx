import React from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import LayoutWrapper from "@/components/LayoutWrapper";
import Preloader from "@/components/Preloader";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import OfflineStatusIndicator from "@/components/OfflineStatusIndicator";
import "./style.css";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-body",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-heading",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#165491" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Fenouhimin — Plateforme d'Achat et d'Expédition Chine → Afrique",
  description:
    "Achetez en Chine et faites-vous livrer en Afrique. Devis transparents, Fret Aérien & Maritime, Suivi logistique et Mobile Money.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Fenouhimin",
    startupImage: [
      {
        url: "/icons/apple-touch-icon.png",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#165491",
    "msapplication-TileImage": "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${plusJakarta.variable} ${outfit.variable}`} style={{ backgroundColor: "#0F172A" }}>
      <body className={plusJakarta.className} style={{ backgroundColor: "#FAF7F2", margin: 0, padding: 0 }}>
        <LayoutWrapper>{children}</LayoutWrapper>
        {/* PWA: Service Worker registration */}
        <PwaRegister />
        {/* PWA: Install prompt banner */}
        <PwaInstallPrompt />
        {/* PWA: Offline real-time status toast */}
        <OfflineStatusIndicator />
      </body>
    </html>
  );
}
