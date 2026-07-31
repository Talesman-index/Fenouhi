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
  title: "CargoLink Africa — Plateforme d'Achat et d'Expédition Chine → Afrique",
  description:
    "Achetez en Chine et faites-vous livrer en Afrique. Devis transparents, Fret Aérien & Maritime, Suivi logistique et Mobile Money.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CargoLink Africa",
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
      <body className={plusJakarta.className} style={{ backgroundColor: "#0F172A", margin: 0, padding: 0 }}>
        {/* Instant Static HTML/CSS Critical Splash Screen (0ms white flash prevention) */}
        <div
          id="initial-splash-screen"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#0F172A",
            zIndex: 9999999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontFamily: "system-ui, -apple-system, sans-serif",
            userSelect: "none",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "90px",
              height: "90px",
              borderRadius: "22px",
              padding: "4px",
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(56, 189, 248, 0.3) 50%, rgba(22, 84, 145, 0.5) 100%)",
              boxShadow: "0 16px 40px -10px rgba(56, 189, 248, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "18px",
            }}
          >
            <img
              src="/icons/icon-192x192.png"
              alt="CargoLink Africa"
              width="82"
              height="82"
              style={{ objectFit: "contain", borderRadius: "18px" }}
            />
          </div>

          <div style={{ fontSize: "24px", fontWeight: 900, color: "#FFFFFF", marginBottom: "4px", letterSpacing: "-0.5px" }}>
            CargoLink <span style={{ color: "#38BDF8" }}>Africa</span>
          </div>

          <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 500, marginBottom: "20px" }}>
            Chargement sécurisé de l'application...
          </div>

          <div
            style={{
              width: "160px",
              height: "5px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "40%",
                height: "100%",
                background: "linear-gradient(90deg, #165491, #38BDF8)",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* App Splash / PWA Preloader (React Interactive Hydration) */}
        <Preloader />
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
