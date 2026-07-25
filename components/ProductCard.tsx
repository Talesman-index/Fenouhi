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
    <div className="deal-product-card">
      <div 
        className="favorite-heart-btn" 
        onClick={() => setFavorite(!favorite)}
        style={{ color: favorite ? "#EF4444" : "#94A3B8" }}
      >
        <Heart style={{ width: 16, fill: favorite ? "#EF4444" : "none" }} />
      </div>

      <div className="deal-card-img-box">
        <img src={image} alt={title} />
      </div>

      <div>
        <div className="deal-card-title">{title}</div>
        <div className="deal-card-rating">
          <span className="stars-gold">{rating}</span> ({reviewsCount})
        </div>
        <div>
          <span className="deal-card-price">{price}</span>
          {oldPrice && <span className="deal-card-oldprice">{oldPrice}</span>}
        </div>
      </div>

      <Link 
        href={`/quote-request?prod=${encodeURIComponent(title)}`} 
        className="btn btn-primary btn-pill-sm" 
        style={{ width: "100%", marginTop: 12 }}
      >
        Demander un Devis
      </Link>
    </div>
  );
}
