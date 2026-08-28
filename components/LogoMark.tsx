"use client";

import React from "react";

interface LogoMarkProps {
  size?: number;
  className?: string;
  light?: boolean;
  style?: React.CSSProperties;
}

/**
 * Fenouhi Brand Monogram Mark (Master Vector Artwork in Navy #0D2B4D + Soft Sky Blue #7CB6D9)
 */
export default function LogoMark({
  size = 36,
  className = "",
  light = false,
  style = {},
}: LogoMarkProps) {
  const navyColor = light ? "#FFFFFF" : "#0D2B4D";
  const skyColor = light ? "#A5D2EB" : "#7CB6D9";

  return (
    <div
      className={`fenouhi-logo-mark-wrap ${className}`}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* 1. TOP NAVY ARCH / 'C' (NAVY #0D2B4D) */}
        <path
          d="M20 54C19 32 34 16 58 16H78C87 16 94 23 94 32C94 41 87 48 78 48H64C52 48 42 56 42 68C42 70 42.2 72 42.7 74C30 71 20 63 20 54Z"
          fill={navyColor}
          style={{ display: "none" }}
        />
        
        {/* CANONICAL MASTER PATH 1: UPPER NAVY BODY */}
        <path
          d="M 18 52 C 18 30 35 14 58 14 L 80 14 C 88.8 14 96 21.2 96 30 C 96 38.8 88.8 46 80 46 L 68 46 C 54.7 46 44 56.7 44 70 C 44 71.5 44.2 73 44.5 74.4 C 38.8 73 33.6 69.8 29.5 65.5 C 22.3 58 18 53.5 18 52 Z"
          fill={navyColor}
        />
        
        {/* CANONICAL MASTER PATH 2: BOTTOM SOFT SKY BLUE DROPLET */}
        <path
          d="M 19 66 C 24 71 31 75 39 76 C 42 76.5 44 79 43.5 82 C 42 91 48 98 56 98 C 65 98 73 90 73 81 C 73 78 75.5 75.5 78.5 76 C 81 76.5 83 78 84 80 C 81 90 72 98 60 98 C 42 98 25 89 20 74 C 18 69 18 67 19 66 Z"
          fill={skyColor}
          style={{ display: "none" }}
        />

        {/* REFINED BOTTOM SKY BLUE BUBBLE (ROUNDED DROPLET SHAPE) */}
        <path
          d="M 19 64 C 18 78 30 92 48 92 C 64 92 78 84 82 72 C 68 82 50 82 40 72 C 32 64 26 61 19 64 Z"
          fill={skyColor}
          style={{ display: "none" }}
        />

        {/* EXACT COMBINED SHAPES */}
        {/* Upper Navy Arc */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M 52 14 C 28 14 12 30 12 52 C 12 60 15 67 20 72 C 24 64 32 58 42 58 C 55 58 66 69 66 82 C 66 85 65 88 64 90 C 70 89 76 86 81 81 C 89 73 94 62 94 50 C 94 30 78 14 52 14 Z M 80 44 C 85.5 44 90 39.5 90 34 C 90 28.5 85.5 24 80 24 L 52 24 C 36 24 24 36 24 50 C 24 57 27 63 32 67 C 36 61 43 56 52 56 C 60 56 67 60 71 66 C 77 60 80 52 80 44 Z"
          fill={navyColor}
          style={{ display: "none" }}
        />

        {/* ACCURATE ARTWORK LAYERS */}
        {/* Layer 1: Navy Upper Hook */}
        <path
          d="M 22 50 C 22 32 36 18 56 18 L 78 18 C 86.8 18 94 25.2 94 34 C 94 42.8 86.8 50 78 50 L 66 50 C 56 50 48 58 48 68 C 48 70 48.5 72 49 74 C 42 73 35 69 30 64 C 25 59 22 55 22 50 Z"
          fill={navyColor}
        />

        {/* Layer 2: Soft Sky Blue Lower Pod */}
        <path
          d="M 22 56 C 22 74 36 90 56 90 C 68 90 78 84 84 75 C 72 82 56 80 46 70 C 38 62 30 58 22 56 Z"
          fill={skyColor}
        />

        {/* Layer 3: Solid Navy Circle Dot */}
        <circle cx="78" cy="74" r="14" fill={navyColor} />
      </svg>
    </div>
  );
}


