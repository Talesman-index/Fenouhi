"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ShoppingCart, Check } from "lucide-react";
import { useMobileStore } from "@/lib/mobile-store";

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
  category = "High-Tech & Usines",
  isDemo = false,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { isFavorite, toggleFavorite, addToCart } = useMobileStore();

  const isFav = isFavorite(`prod-${id}`);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numPrice = parseInt(price.replace(/[^0-9]/g, ""), 10) || 50000;
    toggleFavorite({
      id: `prod-${id}`,
      name: title,
      category: category,
      price: numPrice,
      image: image,
      inStock: true,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const numPrice = parseInt(price.replace(/[^0-9]/g, ""), 10) || 50000;
    addToCart({
      id: `prod-${id}`,
      name: title,
      category: category,
      price: numPrice,
      image: image,
      deliveryRange: "Express 5-12j (Cotonou)",
      shippingMode: "air",
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

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
        borderRadius: 20,
        padding: 16,
        border: "1px solid #EAE5DC",
        position: "relative",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 12px 32px rgba(15, 23, 42, 0.08)"
          : "0 2px 10px rgba(15, 23, 42, 0.02)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "all 0.22s ease",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* HEART BUTTON */}
      <div
        onClick={handleToggleFavorite}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
        title="Ajouter aux favoris"
      >
        <Heart
          style={{
            width: 16,
            height: 16,
            fill: isFav ? "#DC2626" : "none",
            color: isFav ? "#DC2626" : "#94A3B8",
            transition: "all 0.15s ease",
          }}
        />
      </div>

      {/* PRODUCT IMAGE */}
      <div
        style={{
          width: "100%",
          height: 175,
          background: "#F8FAFC",
          borderRadius: 14,
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
              background: "#E8890C",
              color: "#FFFFFF",
              fontSize: 9.5,
              fontWeight: 800,
              padding: "2px 7px",
              borderRadius: 6,
              zIndex: 10,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Direct Usine
          </div>
        )}
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 8,
            transition: "transform 0.35s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/assets/hero_iphone16.png";
          }}
        />
      </div>

      {/* PRODUCT INFO */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#165491", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {category}
          </span>

          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.35,
              margin: "2px 0 6px",
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
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#DC2626", fontFamily: "'Outfit', sans-serif" }}>
              {price}
            </span>
            {oldPrice && (
              <span style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through" }}>
                {oldPrice}
              </span>
            )}
          </div>
        </div>

        {/* ACTIONS ROW: PANIER + DEVIS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <button
            onClick={handleAddToCart}
            style={{
              padding: "8px 0",
              textAlign: "center",
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: 10,
              background: justAdded ? "#16A34A" : "#0F172A",
              color: "#FFF",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              transition: "background 0.18s ease",
            }}
          >
            {justAdded ? (
              <>
                <Check style={{ width: 13, height: 13 }} />
                <span>Ajouté</span>
              </>
            ) : (
              <>
                <ShoppingCart style={{ width: 13, height: 13 }} />
                <span>Panier</span>
              </>
            )}
          </button>

          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/quote-request?prod=${encodeURIComponent(title)}`;
            }}
            style={{
              padding: "8px 0",
              textAlign: "center",
              fontSize: 11.5,
              fontWeight: 700,
              borderRadius: 10,
              background: "#F1F5F9",
              color: "#0F172A",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
              transition: "background 0.18s ease",
            }}
          >
            <ShoppingBag style={{ width: 12, height: 12 }} />
            <span>Devis</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
