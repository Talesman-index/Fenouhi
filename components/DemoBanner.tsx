"use client";

import React from "react";
import { Info } from "lucide-react";

interface DemoBannerProps {
  userEmail?: string | null;
}

export default function DemoBanner({ userEmail }: DemoBannerProps) {
  if (!userEmail) return null;
  const isDemo =
    userEmail.toLowerCase().trim() === "client.demo@cargolink.africa" ||
    userEmail.toLowerCase().trim() === "admin.demo@cargolink.africa";

  if (!isDemo) return null;

  return (
    <div
      style={{
        background: "linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)",
        borderBottom: "1px solid #FCD34D",
        padding: "8px 16px",
        fontSize: 12.5,
        fontWeight: 700,
        color: "#92400E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
        zIndex: 99,
        position: "relative"
      }}
    >
      <Info style={{ width: 16, height: 16, color: "#D97706", flexShrink: 0 }} />
      <span>Mode démonstration — les données affichées sont simulées.</span>
    </div>
  );
}
