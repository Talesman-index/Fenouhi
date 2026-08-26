"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Search,
  Settings,
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
} from "lucide-react";
import BottomNav from "./BottomNav";
import { useMobileStore } from "@/lib/mobile-store";

interface CategoriesViewProps {
  onBack?: () => void;
  onSelectCategory?: (categorySlug: string) => void;
  compact?: boolean;
}

const CATEGORY_LIST = [
  { id: "meuble", name: "Meuble & Décoration", icon: BedDouble, count: "480 usines", tag: "Design & Intérieur" },
  { id: "telephonie", name: "Téléphonie & Objets connectés", icon: Smartphone, count: "1 250 usines", tag: "Smartphones & Accessoires", highlight: true },
  { id: "informatique", name: "Informatique", icon: Laptop, count: "890 usines", tag: "PC, Tablettes & Périphériques" },
  { id: "tv-son", name: "TV, Son & Photo", icon: Tv, count: "640 usines", tag: "Hi-Fi & Caméras" },
  { id: "electromenager", name: "Electroménager", icon: Microwave, count: "520 usines", tag: "Cuisine & Froid" },
  { id: "auto-moto", name: "Auto-moto", icon: Car, count: "780 usines", tag: "Pièces & Accessoires" },
  { id: "librairie", name: "Librairie", icon: BookOpen, count: "310 usines", tag: "Papeterie & Édition" },
  { id: "jeux-video", name: "Jeux vidéo", icon: Gamepad2, count: "420 usines", tag: "Consoles & Gaming" },
  { id: "jeux-jouets", name: "Jeux & Jouets", icon: Puzzle, count: "590 usines", tag: "Éveil & Modélisme" },
  { id: "sport", name: "Sport & Fitness", icon: Activity, count: "680 usines", tag: "Fitness & Outdoor" },
  { id: "animalerie", name: "Animalerie", icon: PawPrint, count: "230 usines", tag: "Accessoires & Soins" },
  { id: "bebe-puericulture", name: "Bébé & Puériculture", icon: Baby, count: "410 usines", tag: "Poussettes & Éveil" },
  { id: "beaute-parfumerie", name: "Beauté, Parfumerie & Hygiène", icon: Brush, count: "950 usines", tag: "Soins & Cosmétiques" },
  { id: "vetements-chaussures", name: "Vêtements et chaussures", icon: Shirt, count: "2 100 usines", tag: "Textile & Streetwear" },
  { id: "mode-bijoux", name: "Mode & bijoux", icon: Gem, count: "840 usines", tag: "Maroquinerie & Montres" },
  { id: "fournitures-scolaires", name: "Fournitures scolaires, Beaux-arts", icon: Palette, count: "360 usines", tag: "Stylos & Peintures" },
  { id: "cuisine-table", name: "Cuisine & art de la table", icon: Coffee, count: "510 usines", tag: "Vaisselle & Ustensiles" },
  { id: "jardin-piscine", name: "Jardin & Piscine", icon: Leaf, count: "290 usines", tag: "Mobilier & Extérieur" },
  { id: "solaire-energie", name: "Énergie Solaire & Groupes", icon: Sun, count: "470 usines", tag: "Panneaux & Batteries", badge: "Afrique" },
  { id: "machinerie-usines", name: "Machinerie & Équipement Pro", icon: Factory, count: "620 usines", tag: "Lignes de production", badge: "B2B" },
];

export default function CategoriesView({ onBack, onSelectCategory }: CategoriesViewProps) {
  const { setActiveScreen, country } = useMobileStore();
  const [searchFilter, setSearchFilter] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredCategories = CATEGORY_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCategoryClick = (id: string) => {
    setSelectedId(id);
    if (onSelectCategory) {
      onSelectCategory(id);
    } else {
      setTimeout(() => {
        setActiveScreen("cart");
      }, 150);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#0F172A",
        color: "#0F172A",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* 1. TOP STATUS / HEADER BAR */}
      <div
        style={{
          padding: "8px 16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "#FFFFFF",
          background: "#0F172A",
        }}
      >
        <button
          onClick={() => {
            if (onBack) onBack();
            else setActiveScreen("cart");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#FFFFFF",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          <ChevronLeft style={{ width: 20, height: 20 }} />
          <span>Retour</span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setIsSearching(!isSearching)}
            style={{
              background: isSearching ? "rgba(255, 255, 255, 0.2)" : "none",
              border: "none",
              color: "#FFFFFF",
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Rechercher"
          >
            <Search style={{ width: 19, height: 19 }} />
          </button>

          <button
            onClick={() => alert(`Région active : ${country.name} (${country.flag})`)}
            style={{
              background: "none",
              border: "none",
              color: "#FFFFFF",
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Paramètres"
          >
            <Settings style={{ width: 19, height: 19 }} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR POPDOWN */}
      {isSearching && (
        <div style={{ padding: "0 16px 12px", background: "#0F172A" }}>
          <div
            style={{
              background: "#1E293B",
              borderRadius: 12,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #334155",
            }}
          >
            <Search style={{ width: 16, height: 16, color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Filtrer parmi les 20 catégories..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              autoFocus
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: 13.5,
                width: "100%",
              }}
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                style={{
                  background: "#475569",
                  border: "none",
                  color: "#FFF",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. MAIN CATEGORIES CONTAINER (WARM BEIGE CARD SURFACE) */}
      <div
        style={{
          flex: 1,
          background: "#FAF7F2", // Exact warm creamy beige from screenshot
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          overflowY: "auto",
          padding: "16px 18px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Subtle Hub Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 10,
            borderBottom: "1px solid #EAE5DC",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#8C827A" }}>
            Sourcing Direct Usines Chine • {country.name} {country.flag}
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#D97706", display: "inline-flex", alignItems: "center", gap: 3 }}>
            <Sparkles style={{ width: 12, height: 12 }} /> 20 Univers
          </span>
        </div>

        {/* LIST OF CATEGORY ROWS */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.icon;
            const isSelected = selectedId === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "13px 4px",
                  borderBottom: idx === filteredCategories.length - 1 ? "none" : "1px solid #EAE5DC",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  borderRadius: 8,
                  backgroundColor: isSelected ? "rgba(22, 84, 145, 0.08)" : "transparent",
                }}
              >
                {/* ICON (Crisp line icon) */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    style={{
                      width: 22,
                      height: 22,
                      strokeWidth: 1.7,
                      color: isSelected ? "#165491" : "#1E293B",
                    }}
                  />
                </div>

                {/* NAME */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 600,
                      color: "#1E293B",
                      lineHeight: 1.3,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>{cat.name}</span>
                    {cat.badge && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 700,
                          background: "#FDE68A",
                          color: "#92400E",
                          padding: "1px 5px",
                          borderRadius: 4,
                        }}
                      >
                        {cat.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* ARROW ON HOVER / ACTIVE */}
                <ArrowRight
                  style={{
                    width: 14,
                    height: 14,
                    color: isSelected ? "#165491" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                />
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "#64748B" }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Aucune catégorie ne correspond à votre recherche.</p>
              <button
                onClick={() => setSearchFilter("")}
                style={{
                  marginTop: 10,
                  background: "#0F172A",
                  color: "#FFF",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Afficher toutes les catégories
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. BOTTOM NAVIGATION BAR */}
      <BottomNav activeScreen="categories" />
    </div>
  );
}
