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
      <svg
        className="logo-img"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size, flexShrink: 0 }}
      >
        <rect width="40" height="40" rx="10" fill="#0F172A" />
        <path d="M20 8L31 29H24.5L20 20L15.5 29H9L20 8Z" fill="#165491" />
        <circle cx="20" cy="14" r="3" fill="#FFF" />
      </svg>

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
