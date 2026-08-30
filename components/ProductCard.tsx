"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check, Star } from "lucide-react";
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
  stockLeft?: number;
  conditionState?: "Scellé" | "Reconditionné" | "Occasion" | string | null;
  grade?: string | null;
  simType?: string | null;
  regionVersion?: string | null;
  wholesalePrice5?: string | number | null;
  hasVariants?: boolean;
  variantsCount?: number;
}

export default function ProductCard({
  id = "1",
  title,
  price,
  oldPrice,
  rating = "4.8",
  reviewsCount = 120,
  image,
  category = "HIGH-TECH & ELECTRONICS",
  isDemo = false,
  stockLeft = 15,
  conditionState,
  grade,
  simType,
  regionVersion,
  wholesalePrice5,
  hasVariants = false,
  variantsCount = 0,
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
    const numWholesale = typeof wholesalePrice5 === "number"
      ? wholesalePrice5
      : wholesalePrice5
      ? parseInt(String(wholesalePrice5).replace(/[^0-9]/g, ""), 10)
      : null;

    addToCart({
      id: `prod-${id}`,
      name: title,
      category: category,
      price: numPrice,
      wholesalePrice5: numWholesale,
      image: image,
      deliveryRange: "Livraison Directe Cotonou",
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
        borderRadius: 22,
        padding: "12px 12px 14px",
        border: hovered ? "1.5px solid #7CB6D9" : "1px solid #EFECE6",
        position: "relative",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 14px 34px rgba(13, 43, 77, 0.12)"
          : "0 2px 10px rgba(13, 43, 77, 0.03)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "all 0.2s ease",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      {/* TOP CONTENT: IMAGE + CATEGORY + TITLE + STARS + PRICE */}
      <div>
        {/* 1. IMAGE CONTAINER WITH FLOATING HEART */}
        <div
          style={{
            width: "100%",
            height: 165,
            background: "#F7F5F1",
            borderRadius: 16,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            marginBottom: 12,
          }}
        >
          {/* FAVORITE FLOATING CIRCLE BUTTON */}
          <div
            onClick={handleToggleFavorite}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.96)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.15s ease",
              transform: isFav ? "scale(1.1)" : "none",
            }}
            title="Favoris"
          >
            <Heart
              style={{
                width: 16,
                height: 16,
                fill: isFav ? "#E11D48" : "none",
                color: isFav ? "#E11D48" : "#94A3B8",
              }}
            />
          </div>

          {/* CONDITION / USINE TAG */}
          {(conditionState || isDemo) && (
            <div
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "#0D2B4D",
                color: "#FFFFFF",
                fontSize: 9.5,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
                zIndex: 10,
                letterSpacing: "0.3px",
              }}
            >
              {conditionState || "Direct Usine"}
            </div>
          )}

          {/* PRODUCT VISUAL */}
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 8,
              transition: "transform 0.3s ease",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/assets/iphone16_white.png";
            }}
          />

          {/* VARIANT CHOICES BADGE */}
          {hasVariants && (
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                background: "rgba(15, 23, 42, 0.88)",
                backdropFilter: "blur(4px)",
                color: "#FFFFFF",
                fontSize: 9.5,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 6,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>⚡ Options disponibles</span>
            </div>
          )}
        </div>

        {/* 2. CATEGORY LABEL */}
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            color: "#7CB6D9",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: 4,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {category}
        </div>

        {/* 3. PRODUCT TITLE */}
        <h4
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: "#1E1B16",
            lineHeight: 1.3,
            margin: "0 0 6px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 35,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {title}
        </h4>

        {/* 4. RATING STARS & REVIEWS COUNT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "inline-flex", gap: 1 }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                style={{
                  width: 11.5,
                  height: 11.5,
                  fill: "#F59E0B",
                  color: "#F59E0B",
                }}
              />
            ))}
          </div>
          <span style={{ color: "#94A3B8", fontWeight: 600, marginLeft: 2 }}>
            ({reviewsCount})
          </span>
        </div>

        {/* 5. PRICE DISPLAY */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginBottom: wholesalePrice5 ? 4 : 12,
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#E11D48", // Vibrant accent price red
                fontFamily: "'Plus Jakarta Sans', 'Poppins', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {price}
            </span>
            {oldPrice && (
              <span
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  textDecoration: "line-through",
                  fontWeight: 600,
                }}
              >
                {oldPrice}
              </span>
            )}
          </div>

          {wholesalePrice5 && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#166534",
                background: "#DCFCE7",
                padding: "2px 6px",
                borderRadius: 4,
                display: "inline-block",
                marginBottom: 10,
              }}
            >
              Dès 5 art. : {typeof wholesalePrice5 === "number" ? `${wholesalePrice5.toLocaleString()} FCFA` : wholesalePrice5}
            </div>
          )}
        </div>
      </div>

      {/* 6. FULL-WIDTH 'AJOUTER AU PANIER' OR 'CHOISIR LES OPTIONS' BUTTON */}
      {hasVariants ? (
        <div
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 999,
            background: "#0D2B4D",
            color: "#FFFFFF",
            border: "none",
            fontSize: 12.5,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            boxShadow: "0 4px 14px rgba(13, 43, 77, 0.25)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <span>Choisir les options ➔</span>
        </div>
      ) : (
        <button
          onClick={handleAddToCart}
          type="button"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 999,
            background: justAdded ? "#15803D" : "#0D2B4D",
            color: "#FFFFFF",
            border: "none",
            fontSize: 12.5,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            cursor: "pointer",
            boxShadow: justAdded
              ? "0 4px 14px rgba(21, 128, 61, 0.35)"
              : "0 4px 14px rgba(13, 43, 77, 0.25)",
            transition: "all 0.18s ease",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {justAdded ? (
            <>
              <Check style={{ width: 14, height: 14 }} />
              <span>Ajouté !</span>
            </>
          ) : (
            <>
              <ShoppingCart style={{ width: 14, height: 14, color: "#7CB6D9" }} />
              <span>Ajouter au Panier</span>
            </>
          )}
        </button>
      )}
    </Link>
  );
}
