"use client";

import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Filter, SlidersHorizontal } from "lucide-react";

export default function CatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products = [
    { id: "1", title: "Montre Connectée SmartFit Pro X", price: "12 500 FCFA", oldPrice: "18 000 FCFA", image: "/images/assets/item_1.jpg", category: "electronics" },
    { id: "2", title: "Écouteurs Bluetooth ANC SoundBass", price: "8 900 FCFA", oldPrice: "14 000 FCFA", image: "/images/assets/item_2.jpg", category: "electronics" },
    { id: "3", title: "Casque Audio Over-Ear Wireless", price: "15 000 FCFA", oldPrice: "22 000 FCFA", image: "/images/assets/item_3.jpg", category: "electronics" },
    { id: "4", title: "Baskets Urban Sport Sneaker Pro", price: "8 500 FCFA", oldPrice: "12 000 FCFA", image: "/images/assets/item_4.jpg", category: "fashion" },
    { id: "5", title: "Sérum Visage Vitamine C Éclat", price: "3 500 FCFA", image: "/images/assets/item_5.jpg", category: "beauty" },
    { id: "6", title: "Sweat-shirt Fleece Warm Thermal", price: "5 000 FCFA", image: "/images/assets/item_6.jpg", category: "fashion" },
    { id: "7", title: "Coffret Bijoux Doré 24k Luxury", price: "6 800 FCFA", oldPrice: "9 500 FCFA", image: "/images/assets/item_7.jpg", category: "fashion" },
    { id: "8", title: "Veste Blouson Imperméable Workwear", price: "12 000 FCFA", image: "/images/assets/item_8.jpg", category: "fashion" },
    { id: "9", title: "Gants de Protection & Travail Cuir", price: "2 500 FCFA", image: "/images/assets/item_9.jpg", category: "machinery" },
    { id: "10", title: "Parka Rembourrée Capuche Fourrure", price: "18 000 FCFA", image: "/images/assets/item_10.jpg", category: "fashion" },
  ];

  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div style={{ padding: "40px 0", background: "var(--bg-main)" }}>
      <div className="container">
        {/* HEADER BAR */}
        <div style={{ marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="hero-page-title" style={{ color: "var(--navy-dark)", fontSize: 28, margin: 0 }}>
              Catalogue Produits Usines Chine
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Prix direct grossiste sans intermédiaire. Inspection et dédouanement garantis.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <SlidersHorizontal style={{ width: 18, color: "var(--navy-dark)" }} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-input" 
              style={{ width: "auto", background: "#FFF" }}
            >
              <option value="all">Toutes les catégories</option>
              <option value="electronics">High-Tech & Audio</option>
              <option value="fashion">Mode & Chaussures</option>
              <option value="beauty">Beauté & Soins</option>
              <option value="machinery">Outillage & PME</option>
            </select>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
