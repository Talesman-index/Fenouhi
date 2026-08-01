"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

interface ProductCardProps {
  id?: string;
  title: string;
  price: string;
  oldPrice?: string;
  rating?: string;
  reviewsCount?: number;
  image: string;
  category?: string;
  isDemo?: boolean;
}

export default function ProductCard({
  id = "1",
  title,
  price,
  oldPrice,
  rating = "★★★★★",
  reviewsCount = 120,
  image,
  isDemo = false,
}: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/product/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        border: "1px solid #E2E8F0",
        position: "relative",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 8px 28px rgba(15,23,42,0.12)"
          : "0 2px 10px rgba(15,23,42,0.03)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.22s ease",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* HEART BUTTON — stopPropagation so it doesn't follow the card link */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setFavorite(!favorite);
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.92)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Heart
          style={{
            width: 15,
            height: 15,
            fill: favorite ? "#EF4444" : "none",
            color: favorite ? "#EF4444" : "#94A3B8",
          }}
        />
      </div>

      {/* PRODUCT IMAGE */}
      <div
        style={{
          width: "100%",
          height: 170,
          background: "#F8FAFC",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
          position: "relative",
        }}
      >
        {isDemo && (
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "rgba(245, 158, 11, 0.95)",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 6,
              zIndex: 10,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            💡 Démo / Simulation
          </div>
        )}
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transition: "transform 0.35s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
        />

        {/* Hover overlay label */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "20px 10px 8px",
            background: "linear-gradient(to top, rgba(15,23,42,0.55) 0%, transparent 100%)",
            display: "flex",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.22s ease",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: "#FFF",
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            Voir le détail →
          </span>
        </div>
      </div>

      {/* PRODUCT INFO */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Title */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.35,
              marginBottom: 6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: 36,
            }}
          >
            {title}
          </div>

          {/* Rating */}
          <div
            style={{
              fontSize: 11,
              color: "#94A3B8",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ color: "#F59E0B" }}>{rating}</span>
            <span>({reviewsCount})</span>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#0F172A" }}>{price}</span>
            {oldPrice && (
              <span style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through" }}>
                {oldPrice}
              </span>
            )}
          </div>
        </div>

        {/* DEVIS BUTTON — stops link navigation, goes to quote instead */}
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/quote-request?prod=${encodeURIComponent(title)}`;
          }}
          style={{
            marginTop: 12,
            padding: "9px 0",
            textAlign: "center",
            fontSize: 12,
            fontWeight: 800,
            borderRadius: 9999,
            background: "#165491",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "pointer",
            transition: "background 0.18s ease",
          }}
        >
          <ShoppingBag style={{ width: 13 }} />
          Demander un Devis
        </div>
      </div>
    </Link>
  );
}
