"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  BedDouble,
  Smartphone,
  Laptop,
  Tv,
  Microwave,
  Car,
  BookOpen,
  Gamepad2,
  Puzzle,
  Activity,
  PawPrint,
  Baby,
  Brush,
  Shirt,
  Gem,
  Palette,
  Coffee,
  Leaf,
  Sun,
  Factory,
  ArrowRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { MobileStoreProvider, useMobileStore } from "@/lib/mobile-store";

const ALL_CATEGORIES = [
  { id: "meuble", name: "Meuble & Décoration", icon: BedDouble, count: "480 usines", tag: "Design & Intérieur", slug: "home" },
  { id: "telephonie", name: "Téléphonie & Objets connectés", icon: Smartphone, count: "1 250 usines", tag: "Smartphones & Accessoires", slug: "electronics", highlight: true },
  { id: "informatique", name: "Informatique", icon: Laptop, count: "890 usines", tag: "PC, Tablettes & Périphériques", slug: "electronics" },
  { id: "tv-son", name: "TV, Son & Photo", icon: Tv, count: "640 usines", tag: "Hi-Fi & Caméras", slug: "electronics" },
  { id: "electromenager", name: "Electroménager", icon: Microwave, count: "520 usines", tag: "Cuisine & Froid", slug: "home" },
  { id: "auto-moto", name: "Auto-moto", icon: Car, count: "780 usines", tag: "Pièces & Accessoires", slug: "automotive" },
  { id: "librairie", name: "Librairie", icon: BookOpen, count: "310 usines", tag: "Papeterie & Édition", slug: "wholesale" },
  { id: "jeux-video", name: "Jeux vidéo", icon: Gamepad2, count: "420 usines", tag: "Consoles & Gaming", slug: "electronics" },
  { id: "jeux-jouets", name: "Jeux & Jouets", icon: Puzzle, count: "590 usines", tag: "Éveil & Modélisme", slug: "toys" },
  { id: "sport", name: "Sport & Fitness", icon: Activity, count: "680 usines", tag: "Fitness & Outdoor", slug: "sport" },
  { id: "animalerie", name: "Animalerie", icon: PawPrint, count: "230 usines", tag: "Accessoires & Soins", slug: "home" },
  { id: "bebe-puericulture", name: "Bébé & Puériculture", icon: Baby, count: "410 usines", tag: "Poussettes & Éveil", slug: "toys" },
  { id: "beaute-parfumerie", name: "Beauté, Parfumerie & Hygiène", icon: Brush, count: "950 usines", tag: "Soins & Cosmétiques", slug: "beauty" },
  { id: "vetements-chaussures", name: "Vêtements et chaussures", icon: Shirt, count: "2 100 usines", tag: "Textile & Streetwear", slug: "fashion" },
  { id: "mode-bijoux", name: "Mode & bijoux", icon: Gem, count: "840 usines", tag: "Maroquinerie & Montres", slug: "fashion" },
  { id: "fournitures-scolaires", name: "Fournitures scolaires, Beaux-arts", icon: Palette, count: "360 usines", tag: "Stylos & Peintures", slug: "wholesale" },
  { id: "cuisine-table", name: "Cuisine & art de la table", icon: Coffee, count: "510 usines", tag: "Vaisselle & Ustensiles", slug: "home" },
  { id: "jardin-piscine", name: "Jardin & Piscine", icon: Leaf, count: "290 usines", tag: "Mobilier & Extérieur", slug: "home" },
  { id: "solaire-energie", name: "Énergie Solaire & Groupes", icon: Sun, count: "470 usines", tag: "Panneaux & Batteries", slug: "hardware", badge: "Afrique" },
  { id: "machinerie-usines", name: "Machinerie & Équipement Pro", icon: Factory, count: "620 usines", tag: "Lignes de production", slug: "machinery", badge: "B2B" },
];

function CategoriesPageInner() {
  const { country } = useMobileStore();
  const [search, setSearch] = useState("");

  const filtered = ALL_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tag.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: "var(--bg-main, #FAF7F2)", minHeight: "85vh", padding: "20px 0 calc(100px + env(safe-area-inset-bottom, 20px))" }}>
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        
        {/* BREADCRUMB */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#64748B",
              textDecoration: "none",
            }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            <span>Accueil</span>
          </Link>
          <span style={{ color: "#CBD5E1" }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Tous les Univers Usines</span>
        </div>

        {/* HEADER & SEARCH BAR */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            paddingBottom: 20,
            borderBottom: "1px solid #E2D9CC",
            marginBottom: 24,
          }}
        >
          <div style={{ flex: 1, minWidth: 260 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                fontWeight: 700,
                color: "#165491",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>Sourcing Direct Usines Chine • {country.name} {country.flag}</span>
            </div>
            <h1
              style={{
                fontSize: "clamp(22px, 4vw, 28px)",
                fontWeight: 700,
                color: "#0F172A",
                fontFamily: "'Poppins', sans-serif",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              20 Univers & Catégories Produits
            </h1>
          </div>

          {/* SEARCH INPUT */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #CBD5E1",
              borderRadius: 14,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)",
            }}
          >
            <Search style={{ width: 18, height: 18, color: "#64748B", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                fontSize: 13.5,
                fontWeight: 600,
                color: "#0F172A",
                width: "100%",
                background: "transparent",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "#94A3B8",
                  border: "none",
                  borderRadius: "50%",
                  color: "#FFF",
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* RESPONSIVE CATEGORIES GRID */}
        <div className="categories-responsive-grid">
          {filtered.map((cat) => {
            const Icon = cat.icon;

            return (
              <Link
                key={cat.id}
                href={`/catalog?cat=${cat.slug}`}
                className="category-card-item"
                style={{
                  background: "#FFFFFF",
                  borderRadius: 16,
                  padding: "14px 16px",
                  border: "1px solid #EAE5DC",
                  boxShadow: "0 2px 10px rgba(15, 23, 42, 0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s ease",
                }}
              >
                {/* ICON */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: "#F8FAFC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0F172A",
                    flexShrink: 0,
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <Icon style={{ width: 22, height: 22, strokeWidth: 1.8 }} />
                </div>

                {/* DETAILS */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0F172A",
                        lineHeight: 1.3,
                        wordBreak: "break-word",
                      }}
                    >
                      {cat.name}
                    </span>
                    {cat.badge && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          background: "#FDE68A",
                          color: "#92400E",
                          padding: "1px 6px",
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 3, lineHeight: 1.3 }}>
                    {cat.tag} • <strong style={{ color: "#165491" }}>{cat.count}</strong>
                  </div>
                </div>

                <ArrowRight style={{ width: 16, height: 16, color: "#94A3B8", flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>

        <style jsx>{`
          .categories-responsive-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
          }
          @media (max-width: 640px) {
            .categories-responsive-grid {
              grid-template-columns: 1fr;
              gap: 10px;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return <CategoriesPageInner />;
}
