"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  light?: boolean;
  href?: string | null;
  className?: string;
  onClick?: () => void;
}

export default function Logo({
  size = 38,
  showText = true,
  showSubtitle = true,
  subtitleText = "LOGISTIQUE CHINE - AFRIQUE",
  light = false,
  href = "/",
  className = "",
  onClick,
}: LogoProps) {
  const logoContent = (
    <div
      className={`brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 34 ? 10 : 8,
        textDecoration: "none",
        cursor: href || onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <img
        src="/icons/icon-192x192.png"
        alt="CargoLink Africa PWA App Icon"
        className="logo-img"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.24),
          objectFit: "cover",
          flexShrink: 0,
          display: "block",
          boxShadow: light ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
        }}
      />

      {showText && (
        <div className="logo-text-wrap" style={{ display: "flex", flexDirection: "column" }}>
          <span
            className="logo-text-main"
            style={{
              fontSize: size * 0.55,
              fontWeight: 900,
              color: light ? "#FFFFFF" : "#0F172A",
              lineHeight: 1,
              letterSpacing: "-0.5px",
            }}
          >
            CargoLink
          </span>
          {showSubtitle && (
            <span
              className="logo-text-sub"
              style={{
                fontSize: Math.max(7.5, size * 0.22),
                fontWeight: 800,
                color: light ? "#38BDF8" : "#165491",
                letterSpacing: "0.5px",
                marginTop: 3,
              }}
            >
              {subtitleText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "inline-flex" }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
