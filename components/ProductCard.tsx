"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

interface ProductCardProps {
  id?: string;
  title: string;
  price: string;
  oldPrice?: string;
  rating?: string;
  reviewsCount?: number;
  image: string;
  category?: string;
}

export default function ProductCard({
  id = "1",
  title,
  price,
  oldPrice,
  rating = "★★★★★",
  reviewsCount = 120,
  image
}: ProductCardProps) {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className="deal-product-card" style={{ background: "#FFFFFF", borderRadius: 16, padding: 14, border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", boxShadow: "0 2px 10px rgba(15,23,42,0.03)" }}>
      
      {/* HEART FAVORITE BUTTON */}
      <div 
        className="favorite-heart-btn" 
        onClick={() => setFavorite(!favorite)}
        style={{ 
          position: "absolute", 
          top: 10, 
          right: 10, 
          width: 30, 
          height: 30, 
          borderRadius: "50%", 
          background: "rgba(255,255,255,0.9)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          cursor: "pointer", 
          zIndex: 5,
          color: favorite ? "#EF4444" : "#94A3B8",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}
      >
        <Heart style={{ width: 15, height: 15, fill: favorite ? "#EF4444" : "none" }} />
      </div>

      {/* PRODUCT IMAGE BOX WITH STRICT 170PX HEIGHT */}
      <div className="deal-card-img-box" style={{ width: "100%", height: 170, maxHeight: 170, minHeight: 170, background: "#F8FAFC", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
      </div>

      {/* PRODUCT DETAILS */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="deal-card-title" style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.3, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", height: 34 }}>
            {title}
          </div>
          
          <div className="deal-card-rating" style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ color: "#F59E0B" }}>{rating}</span>
            <span>({reviewsCount})</span>
          </div>
          
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
            <span className="deal-card-price" style={{ fontSize: 15, fontWeight: 900, color: "#0F172A" }}>{price}</span>
            {oldPrice && <span className="deal-card-oldprice" style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through" }}>{oldPrice}</span>}
          </div>
        </div>

        <Link 
          href={`/quote-request?prod=${encodeURIComponent(title)}`} 
          className="btn btn-primary btn-pill-sm" 
          style={{ width: "100%", marginTop: 12, padding: "8px 0", textAlign: "center", fontSize: 12, fontWeight: 800, borderRadius: 9999, background: "#165491", color: "#FFF" }}
        >
          Demander un Devis
        </Link>
      </div>
    </div>
  );
}
