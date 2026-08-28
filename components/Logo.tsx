"use client";

import React from "react";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";

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
  const textColor = light ? "#FFFFFF" : "#0D2B4D";
  const subColor = light ? "#A5D2EB" : "#7CB6D9";
  const dotColor = light ? "#A5D2EB" : "#7CB6D9";

  const logoContent = (
    <div
      className={`brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size > 34 ? 11 : 9,
        textDecoration: "none",
        cursor: href || onClick ? "pointer" : "default",
        userSelect: "none",
      }}
      onClick={onClick}
    >
      <LogoMark size={size} light={light} />

      {showText && (
        <div className="logo-text-wrap" style={{ display: "flex", flexDirection: "column" }}>
          <span
            className="logo-text-main"
            style={{
              fontSize: Math.round(size * 0.62),
              fontWeight: 800,
              color: textColor,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              display: "inline-flex",
              alignItems: "baseline",
            }}
          >
            Fenouh<span style={{ color: dotColor }}>i</span>
          </span>
          {showSubtitle && (
            <span
              className="logo-text-sub"
              style={{
                fontSize: Math.max(7.5, size * 0.22),
                fontWeight: 700,
                color: subColor,
                letterSpacing: "0.06em",
                marginTop: 3.5,
                textTransform: "uppercase",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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

