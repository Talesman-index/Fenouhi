"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCategories, getPublicProducts } from "@/lib/supabase/catalog";
import type { Category, Product } from "@/types/catalog";
import { SlidersHorizontal, Package, AlertCircle } from "lucide-react";

function CatalogContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const searchParam = searchParams.get("q");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (catParam) {
      setSelectedCategory(catParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [catParam, searchParam]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getPublicProducts({
            categorySlug: selectedCategory,
            search: searchQuery,
          }),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err: any) {
        setErrorMsg("Impossible de charger le catalogue Supabase pour le moment.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{ padding: "40px 0", background: "var(--bg-main)", minHeight: "80vh" }}>
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

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {/* SEARCH INPUT */}
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ width: 220, background: "#FFF" }}
            />

            {/* CATEGORY SELECT */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <SlidersHorizontal style={{ width: 18, color: "var(--navy-dark)" }} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="admin-input" 
                style={{ width: "auto", background: "#FFF" }}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NOTICE SIMULATION / DEMO PRODUCTS */}
        <div style={{ background: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 12, padding: "12px 16px", marginBottom: 28, fontSize: 13, color: "#92400E", display: "flex", alignItems: "center", gap: 10 }}>
          <Package style={{ width: 18, flexShrink: 0, color: "#D97706" }} />
          <div>
            <strong>Information Catalogue :</strong> Les articles marqués d'un badge <strong>Démo / Simulation</strong> sont des exemples d'importation pour tester les devis. Les futurs articles ajoutés par les administrateurs sont de vrais produits commerciaux certifiés.
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="card" style={{ height: 280, background: "#F1F5F9", borderRadius: 16, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {errorMsg && !loading && (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#EF4444" }}>
            <AlertCircle style={{ width: 40, height: 40, margin: "0 auto 12px" }} />
            <div style={{ fontWeight: 800 }}>{errorMsg}</div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !errorMsg && products.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Package style={{ width: 48, height: 48, color: "#94A3B8", margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--navy-dark)", marginBottom: 8 }}>
              Aucun produit disponible
            </h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Aucun article ne correspond actuellement à vos critères de recherche ou de filtre.
            </p>
          </div>
        )}

        {/* PRODUCTS GRID */}
        {!loading && !errorMsg && products.length > 0 && (
          <div className="grid-5">
            {products.map((p) => {
              const primaryImg = p.images?.find(i => i.is_primary)?.public_image_url || p.images?.[0]?.public_image_url || "/images/assets/item_1.jpg";
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  image={primaryImg}
                  category={p.category?.name || "Général"}
                  isDemo={p.is_demo}
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
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Chargement du catalogue Supabase...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
