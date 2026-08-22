"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategories, getPublicProducts, getPublicProductsSync, FALLBACK_CATEGORIES } from "@/lib/supabase/catalog";
import type { Category, Product } from "@/types/catalog";
import { SlidersHorizontal, Package, AlertCircle, Search, Filter, Check, ShieldCheck, RefreshCw, Smartphone, Layers, Building2 } from "lucide-react";

function CatalogContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const searchParam = searchParams.get("q");

  const initialCat = catParam || "all";
  const initialSearch = searchParam || "";

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(() =>
    getPublicProductsSync({ categorySlug: initialCat, search: initialSearch })
  );
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedConditionState, setSelectedConditionState] = useState("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (catParam && catParam !== selectedCategory) {
      setSelectedCategory(catParam);
    }
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam);
    }
  }, [catParam, searchParam]);

  useEffect(() => {
    // Instant local filtering without blocking UI
    const filteredProds = getPublicProductsSync({
      categorySlug: selectedCategory,
      conditionState: selectedConditionState,
      search: searchQuery,
    });
    setProducts(filteredProds);

    // Optional background sync with Supabase
    async function loadBackgroundData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getPublicProducts({
            categorySlug: selectedCategory,
            conditionState: selectedConditionState,
            search: searchQuery,
          }),
        ]);
        if (cats && cats.length > 0) setCategories(cats);
        if (prods && prods.length > 0) setProducts(prods);
      } catch (err: any) {
        // Silently preserve local product catalog
      }
    }

    loadBackgroundData();
  }, [selectedCategory, selectedConditionState, searchQuery]);

  const CONDITION_OPTIONS = [
    { id: "all", label: "Tous les états", icon: Layers, color: "#64748B" },
    { id: "Scellé", label: "Scellé / Neuf", icon: ShieldCheck, color: "#10B981" },
    { id: "Reconditionné", label: "Reconditionné Certifié", icon: RefreshCw, color: "#3B82F6" },
    { id: "Occasion", label: "Occasion Contrôlée", icon: Smartphone, color: "#F59E0B" },
  ];

  return (
    <div
      style={{
        padding: "16px 0 calc(100px + env(safe-area-inset-bottom, 20px))",
        background: "#FAF7F2",
        minHeight: "85vh",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        
        {/* 1. HEADER TITLE BANNER CARD */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: "18px 20px",
            border: "1px solid #EAE5DC",
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(22, 84, 145, 0.08)",
                  color: "#165491",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 11.5,
                  fontWeight: 600,
                  marginBottom: 8,
                  letterSpacing: "0.5px",
                }}
              >
                <Building2 style={{ width: 14, height: 14, color: "#165491" }} />
                <span>CATALOGUE OFFICIEL FENOUHIMIN & FENOUSSHOP</span>
              </div>

              <h1
                style={{
                  color: "#0F172A",
                  fontSize: "clamp(22px, 4vw, 30px)",
                  margin: "0 0 6px",
                  fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif",
                  lineHeight: 1.2,
                }}
              >
                Catalogue Produits & iPhones Usines
              </h1>

              <p style={{ fontSize: 13.5, color: "#64748B", margin: 0, lineHeight: 1.4 }}>
                iPhones certifiés réels avec états officiels (Scellé, Reconditionné, Occasion Grade A) & produits direct grossistes.
              </p>
            </div>

            {/* SEARCH INPUT BAR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: 999,
                padding: "6px 14px",
                gap: 8,
                width: "100%",
                maxWidth: 320,
                boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
              }}
            >
              <Search style={{ width: 16, height: 16, color: "#94A3B8", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Rechercher iPhone, lot usine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0F172A",
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. HORIZONTAL SCROLLABLE CONDITION STATE PILLS */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            Filtrer par état du téléphone :
          </div>

          <div
            className="mobile-categories-scroll"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 6,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {CONDITION_OPTIONS.map((c) => {
              const isActive = selectedConditionState === c.id;
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedConditionState(c.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: isActive ? "none" : "1px solid #E2E8F0",
                    background: isActive ? "#0F172A" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#475569",
                    fontSize: 12.5,
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isActive ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: 14, height: 14, color: isActive ? "#FFFFFF" : c.color, flexShrink: 0 }} />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. HORIZONTAL SCROLLABLE CATEGORIES BAR */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            Catégories :
          </div>

          <div
            className="mobile-categories-scroll"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 6,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <button
              onClick={() => setSelectedCategory("all")}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: selectedCategory === "all" ? "none" : "1px solid #E2E8F0",
                background: selectedCategory === "all" ? "#165491" : "#FFFFFF",
                color: selectedCategory === "all" ? "#FFFFFF" : "#475569",
                fontSize: 12.5,
                fontWeight: selectedCategory === "all" ? 800 : 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: selectedCategory === "all" ? "0 4px 12px rgba(22, 84, 145, 0.2)" : "none",
                flexShrink: 0,
              }}
            >
              Toutes les catégories
            </button>

            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: isActive ? "none" : "1px solid #E2E8F0",
                    background: isActive ? "#165491" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#475569",
                    fontSize: 12.5,
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isActive ? "0 4px 12px rgba(22, 84, 145, 0.2)" : "none",
                    flexShrink: 0,
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="product-grid-mobile grid-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                style={{
                  height: 280,
                  background: "#FFFFFF",
                  borderRadius: 20,
                  border: "1px solid #EAE5DC",
                  animation: "pulse 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {errorMsg && !loading && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              padding: 40,
              textAlign: "center",
              border: "1px solid #FEF2F2",
              color: "#DC2626",
            }}
          >
            <AlertCircle style={{ width: 40, height: 40, margin: "0 auto 12px", color: "#DC2626" }} />
            <div style={{ fontWeight: 600, fontSize: 15 }}>{errorMsg}</div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !errorMsg && products.length === 0 && (
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 22,
              padding: "60px 20px",
              textAlign: "center",
              border: "1px solid #EAE5DC",
            }}
          >
            <Package style={{ width: 48, height: 48, color: "#94A3B8", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 8px" }}>
              Aucun produit disponible
            </h3>
            <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
              Aucun article ne correspond actuellement à vos critères de recherche ou de filtre.
            </p>
          </div>
        )}

        {/* 4. PRODUCTS GRID (2 COLUMNS MOBILE, 5 COLUMNS DESKTOP) */}
        {!loading && !errorMsg && products.length > 0 && (
          <div className="product-grid-mobile grid-5">
            {products.map((p) => {
              const primaryImg =
                p.images?.find((i) => i.is_primary)?.public_image_url ||
                p.images?.[0]?.public_image_url ||
                "/images/assets/item_1.jpg";
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  image={primaryImg}
                  category={p.category?.name || "Général"}
                  isDemo={p.is_demo}
                  conditionState={p.condition_state}
                  grade={p.grade}
                  simType={p.sim_type}
                  regionVersion={p.region_version}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontWeight: 600,
            color: "#0F172A",
            background: "#FAF7F2",
            minHeight: "80vh",
          }}
        >
          Chargement du catalogue Supabase...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
