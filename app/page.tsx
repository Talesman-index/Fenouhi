"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts, getPublicProductsSync, getProductImageUrl, getStoredCustomProducts, getStoredDeletedProductIds } from "@/lib/supabase/catalog";
import type { Product } from "@/types/catalog";
import { useRouter } from "next/navigation";
import { 
  Building2, ArrowRight, ChevronRight, Search, Zap, DollarSign, Truck, 
  Package, Plane, Sparkles, ShieldCheck, SlidersHorizontal, Bell,
  Smartphone, Laptop, Headphones, ShoppingBag, Layers, X,
  Shirt, Crown, Home, Dumbbell, Boxes
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchUrl, setSearchUrl] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(48);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(() => getPublicProductsSync());
  const [recentProducts, setRecentProducts] = useState<Product[]>(() => getPublicProductsSync());
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroPromoSlides = [
    {
      title: "High-Tech & Mode Direct Usines",
      subtitle: "iPhones certifiés, Apple Watch, AirPods, sneakers & maroquinerie de luxe livrés à Cotonou.",
      btnText: "Commander Maintenant",
      btnLink: "/catalog",
      image: "/images/banners/banner1.png",
      tag: "Offre Exclusive -50%",
      bgGradient: "linear-gradient(135deg, #0D2B4D 0%, #153B64 50%, #0D2B4D 100%)",
    },
    {
      title: "Maison & Électroménager Fenouhi",
      subtitle: "Air Fryers, blenders, ustensiles de cuisine & linge de maison haut de gamme aux tarifs fabricants.",
      btnText: "Découvrir la Maison",
      btnLink: "/catalog?cat=home",
      image: "/images/banners/banner2.png",
      tag: "Direct Fabricants",
      bgGradient: "linear-gradient(135deg, #071C35 0%, #184576 50%, #0D2B4D 100%)",
    },
    {
      title: "Beauté, Parfums & Cosmétiques",
      subtitle: "Soins visage Radiance Essence, coffrets de soin & maroquinerie aux prix grossistes.",
      btnText: "Voir les Produits Beauté",
      btnLink: "/catalog?cat=beauty",
      image: "/images/banners/banner3.png",
      tag: "Ventes Flash Grossistes",
      bgGradient: "linear-gradient(135deg, #0D2B4D 0%, #1C4D82 50%, #071C35 100%)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroPromoSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroPromoSlides.length]);

  useEffect(() => {
    // 1. Sync immediately from client store
    const filterCat = activeCategory === "all" ? undefined : activeCategory;
    const localItems = getPublicProductsSync({ categorySlug: filterCat });
    setRecentProducts(localItems);
    setFeaturedProducts(localItems);

    // 2. Query Supabase async
    async function loadHomeProducts() {
      try {
        const recent = await getPublicProducts({ categorySlug: filterCat });
        if (recent && recent.length > 0) {
          setFeaturedProducts(recent);
          setRecentProducts(recent);
        }
      } catch {}
    }
    loadHomeProducts();

    const handleCatalogUpdate = () => {
      loadHomeProducts();
    };
    window.addEventListener("cargolink_catalog_updated", handleCatalogUpdate);
    return () => {
      window.removeEventListener("cargolink_catalog_updated", handleCatalogUpdate);
    };
  }, [activeCategory]);

  const categoryChips = [
    { id: "all", label: "Tous les Produits", icon: Layers },
    { id: "electronics", label: "iPhones & High-Tech", icon: Smartphone },
    { id: "beauty", label: "Beauté & Soins", icon: Sparkles },
    { id: "fashion", label: "Mode & Chaussures", icon: Shirt },
    { id: "mode-pagne-africain", label: "Pagne Africain", icon: Crown },
    { id: "home", label: "Maison & Électroménager", icon: Home },
    { id: "sport", label: "Sport & Fitness", icon: Dumbbell },
    { id: "wholesale", label: "Lots Grossiste & Usines", icon: Boxes },
  ];

  const subCategorySquircles = [
    { id: "iphones", label: "iPhones & Tech", icon: Smartphone, link: "/catalog?cat=electronics" },
    { id: "beaute", label: "Beauté & Soins", icon: Sparkles, link: "/catalog?cat=beauty" },
    { id: "mode", label: "Mode & Style", icon: Shirt, link: "/catalog?cat=fashion" },
    { id: "pagne", label: "Pagne Africain", icon: Crown, link: "/catalog?cat=mode-pagne-africain" },
    { id: "maison", label: "Maison & Déco", icon: Home, link: "/catalog?cat=home" },
    { id: "sport", label: "Sport & Fitness", icon: Dumbbell, link: "/catalog?cat=sport" },
    { id: "grossiste", label: "Lots Usines", icon: Boxes, link: "/catalog?cat=wholesale" },
  ];

  const todayDeals = [
    { id: "iphone-15-pro-max", title: "iPhone 15 Pro Max (Titane & Puce A17 Pro)", price: "420 000 FCFA", oldPrice: "520 000 FCFA", image: "/images/assets/hero_iphone16.png", category: "High-Tech", stockLeft: 50, rating: "5.0", reviewsCount: 310 },
    { id: "raf-electric-kettle-r7928", title: "Chauffe-eau Électrique RAF (2.3L 1800W)", price: "7 000 FCFA", oldPrice: "12 000 FCFA", image: "/images/assets/chauffe_eau_raf_r7928.png", category: "Électroménager", stockLeft: 18, rating: "4.9", reviewsCount: 142 },
    { id: "gaine-amincissante-100-latex", title: "Gaine Amincissante 100% Latex", price: "20 000 FCFA", oldPrice: "32 000 FCFA", image: "/images/assets/gaine_amincissante_latex_1.png", category: "Mode & Minceur", stockLeft: 12, rating: "4.9", reviewsCount: 142 },
    { id: "coque-iphone-15-pro-max-silicone", title: "Coque iPhone 15 Pro Max Silicone", price: "3 500 FCFA", oldPrice: "6 000 FCFA", image: "/images/assets/iphone16_case_blue.png", category: "High-Tech & Accessoires", stockLeft: 100, rating: "4.9", reviewsCount: 98 },
    { id: "robot-nettoyeur-4en1-jallen-gabor", title: "Robot Nettoyeur 4-en-1 Jallen Gabor", price: "15 000 FCFA", oldPrice: "25 000 FCFA", image: "/images/assets/robot_nettoyeur_jallen_gabor_1.png", category: "Électroménager", stockLeft: 8, rating: "4.7", reviewsCount: 89 },
    { id: "dr-rashel-vitamin-c-set", title: "Dr. Rashel Vitamine C (Coffret 4 Pièces)", price: "10 000 FCFA", oldPrice: "16 000 FCFA", image: "/images/assets/dr_rashel_vitamin_c_2.jpg", category: "Beauté & Soins", stockLeft: 24, rating: "4.8", reviewsCount: 201 },
    { id: "efero-blanchiment-dents", title: "EFERO Essence Blanchiment Dents", price: "2 500 FCFA", oldPrice: "4 500 FCFA", image: "/images/assets/efero_teeth_whitening.jpg", category: "Hygiène Buccale", stockLeft: 35, rating: "4.6", reviewsCount: 94 },
    { id: "defroisseur-vapeur-haeger-vetements", title: "Mini Défroisseur Vapeur Portatif HAEGER", price: "10 000 FCFA", oldPrice: "16 500 FCFA", image: "/images/assets/defroisseur_vapeur_haeger_2.png", category: "Électroménager", stockLeft: 14, rating: "4.8", reviewsCount: 120 },
  ];

  const samplePrompts = [
    "iPhone 15 Pro Max",
    "Chauffe-eau Électrique RAF",
    "Sérum Vitamine C Dr. Rashel",
    "Gaine Amincissante 100% Latex",
    "Mini Défroisseur Vapeur Portatif",
    "Robot Nettoyeur 4-en-1",
  ];

  const activeSlide = heroPromoSlides[currentSlide] || heroPromoSlides[0];

  return (
    <div style={{ background: "#F7F5F1", minHeight: "100vh", paddingBottom: 90, fontFamily: "var(--font-body), 'Plus Jakarta Sans', sans-serif" }}>
      


      {/* ========================================================================= */}
      {/* 2. RECHERCHE PRINCIPALE FONCTIONNELLE EN FRANÇAIS                          */}
      {/* ========================================================================= */}
      <section style={{ padding: "10px 0 12px", position: "relative", zIndex: 40 }}>
        <div className="container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchInput.trim()) {
                router.push(`/catalog?q=${encodeURIComponent(searchInput.trim())}`);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              position: "relative",
            }}
          >
            {/* SEARCH PILL */}
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "#FFFFFF",
                borderRadius: 999,
                padding: "11px 16px 11px 18px",
                border: searchFocused ? "2px solid #7CB6D9" : "1px solid #EFECE6",
                boxShadow: searchFocused
                  ? "0 6px 20px rgba(124, 182, 217, 0.28)"
                  : "0 4px 14px rgba(13, 43, 77, 0.04)",
                gap: 10,
                transition: "all 0.18s ease",
              }}
            >
              <Search
                style={{
                  width: 18,
                  height: 18,
                  color: searchFocused ? "#7CB6D9" : "#7E7970",
                  flexShrink: 0,
                  transition: "color 0.18s ease",
                }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                placeholder="Que recherchez-vous ? (iPhones, usines, produits...)"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#1E1B16",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              />
              {searchInput.trim() && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  style={{
                    background: "#EBF4FA",
                    border: "none",
                    borderRadius: "50%",
                    width: 22,
                    height: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#534F47",
                    padding: 0,
                    flexShrink: 0,
                  }}
                  title="Effacer la recherche"
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>

            {/* FILTER SLIDERS BUTTON */}
            <Link
              href="/catalog"
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                background: "#FFFFFF",
                border: "1.5px solid rgba(124, 182, 217, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7CB6D9",
                boxShadow: "0 4px 14px rgba(124, 182, 217, 0.12)",
                textDecoration: "none",
                flexShrink: 0,
                transition: "transform 0.15s ease",
              }}
              title="Filtres du Catalogue"
            >
              <SlidersHorizontal style={{ width: 19, height: 19, color: "#7CB6D9" }} />
            </Link>

            {/* LIVE AUTOCOMPLETE DROPDOWN */}
            {searchFocused && searchInput.trim().length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 56,
                  background: "#FFFFFF",
                  borderRadius: 18,
                  border: "1.5px solid rgba(124, 182, 217, 0.3)",
                  boxShadow: "0 16px 36px rgba(13, 43, 77, 0.15)",
                  padding: "10px 0",
                  zIndex: 100,
                  overflow: "hidden",
                  animation: "fadeIn 0.18s ease-out",
                }}
              >
                <div style={{ padding: "6px 16px 8px", fontSize: 11, fontWeight: 700, color: "#7E7970", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Suggestions de Produits
                </div>

                {recentProducts
                  .filter((p) =>
                    p.name.toLowerCase().includes(searchInput.toLowerCase().trim())
                  )
                  .slice(0, 4)
                  .map((p) => {
                    const img = getProductImageUrl(p);
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "8px 16px",
                          textDecoration: "none",
                          color: "#1E1B16",
                          transition: "background 0.15s ease",
                          borderBottom: "1px solid #F7F5F1",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F5F1")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            background: "#F7F5F1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={img}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 3 }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#0D2B4D", fontWeight: 800 }}>
                            {p.price.toLocaleString()} {p.currency}
                          </div>
                        </div>
                        <ArrowRight style={{ width: 14, height: 14, color: "#7E7970", flexShrink: 0 }} />
                      </Link>
                    );
                  })}

                {/* VIEW ALL RESULTS FOR QUERY */}
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px 6px",
                    background: "transparent",
                    border: "none",
                    borderTop: "1px solid #EFECE6",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#0D2B4D",
                    textAlign: "left",
                  }}
                >
                  <span>Voir tous les résultats pour « {searchInput} »</span>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HORIZONTAL CATEGORY CHIPS WITH ICONS (MATCHING REFERENCE UI)          */}
      {/* ========================================================================= */}
      <section style={{ padding: "4px 0 14px" }}>
        <div className="container">
          <div
            className="mobile-categories-scroll"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {categoryChips.map((chip) => {
              const isActive = activeCategory === chip.id;
              const Icon = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveCategory(chip.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 999,
                    border: isActive ? "none" : "1px solid #EFECE6",
                    background: isActive ? "#0D2B4D" : "#FFFFFF",
                    color: isActive ? "#FFFFFF" : "#534F47",
                    fontSize: 12.5,
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(13, 43, 77, 0.35)"
                      : "0 2px 6px rgba(13, 43, 77, 0.02)",
                    transition: "all 0.18s ease",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    style={{
                      width: 14,
                      height: 14,
                      color: isActive ? "#7CB6D9" : "#7E7970",
                    }}
                  />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HERO PROMO CARD WITH PAGINATION DOTS (MATCHING REFERENCE UI)          */}
      {/* ========================================================================= */}
      <section style={{ padding: "8px 0 16px" }}>
        <div className="container">
          <div
            className="hero-promo-card"
            style={{
              background: activeSlide.bgGradient,
            }}
          >
            {/* AMBIENT GLOW */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -40,
                width: 260,
                height: 260,
                background: "radial-gradient(circle, rgba(124, 182, 217, 0.25) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            {/* LEFT CONTENT */}
            <div style={{ position: "relative", zIndex: 2 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "rgba(124, 182, 217, 0.2)",
                  border: "1px solid rgba(124, 182, 217, 0.4)",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#7CB6D9",
                  letterSpacing: "0.04em",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                <span>{activeSlide.tag}</span>
              </div>

              <h2
                style={{
                  fontSize: "clamp(18px, 3.2vw, 28px)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  margin: "0 0 6px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                {activeSlide.title}
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: "#CBD5E1",
                  margin: "0 0 16px",
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {activeSlide.subtitle}
              </p>

              {/* CRISP WHITE CTA BUTTON FOR MAXIMUM CONTRAST */}
              <Link
                href={activeSlide.btnLink}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#FFFFFF",
                  color: "#0D2B4D",
                  padding: "9px 20px",
                  borderRadius: 999,
                  fontSize: 12.5,
                  fontWeight: 900,
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
                  transition: "transform 0.2s ease",
                }}
              >
                <ShoppingBag style={{ width: 14, height: 14, color: "#0D2B4D" }} />
                <span>Commander</span>
              </Link>
            </div>

            {/* RIGHT PRODUCT CUTOUT VISUAL (ENLARGED FOR MOBILE) */}
            <div className="hero-promo-img-box">
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="hero-promo-img"
              />
            </div>

            {/* PAGINATION DOTS (BOTTOM CENTER) */}
            <div
              style={{
                position: "absolute",
                bottom: 10,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                zIndex: 3,
              }}
            >
              {heroPromoSlides.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: currentSlide === idx ? 16 : 6,
                    height: 6,
                    borderRadius: 999,
                    background: currentSlide === idx ? "#7CB6D9" : "rgba(255, 255, 255, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SUB-CATEGORIES SQUIRCLE GRID (MATCHING REFERENCE UI)                  */}
      {/* ========================================================================= */}
      <section style={{ padding: "8px 0 16px" }}>
        <div className="container">
          <div
            className="mobile-categories-scroll"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {subCategorySquircles.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.link}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 20,
                      background: "#FFFFFF",
                      border: "1px solid #EFECE6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(13, 43, 77, 0.04)",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                  >
                    <Icon style={{ width: 24, height: 24, color: "#0D2B4D" }} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#1E1B16",
                      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FEATURED PRODUCTS (EXACT 2-COLUMN MOBILE & MULTI-COLUMN DESKTOP GRID)  */}
      {/* ========================================================================= */}
      <section style={{ padding: "12px 0 24px" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E1B16", margin: "0 0 2px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                {activeCategory === "all" ? "Produits Vedettes & Nouveautés" : categoryChips.find(c => c.id === activeCategory)?.label || "Produits"}
              </h2>
              <p style={{ fontSize: 12, color: "#7E7970", margin: 0, fontWeight: 600 }}>
                {featuredProducts.length} articles disponibles • Direct Usines & Fabricants
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {activeCategory !== "all" && (
                <button
                  onClick={() => setActiveCategory("all")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0D2B4D",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Voir tout
                </button>
              )}
              <Link href="/catalog" style={{ fontSize: 12.5, fontWeight: 700, color: "#0D2B4D", textDecoration: "none" }}>
                Explorer le catalogue →
              </Link>
            </div>
          </div>

          <div
            className="product-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 14,
            }}
          >
            {featuredProducts.slice(0, visibleCount).map((p) => {
              const img = getProductImageUrl(p);
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  wholesalePrice5={p.wholesale_price_5_units ? `${Number(p.wholesale_price_5_units).toLocaleString()} ${p.currency}` : null}
                  image={img}
                  category={typeof p.category === "object" && p.category !== null ? (p.category.name || p.category.slug || "Boutique Fenouhi") : (typeof p.category === "string" ? p.category : "Boutique Fenouhi")}
                  isDemo={p.is_demo}
                  conditionState={p.condition_state}
                  grade={p.grade}
                  simType={p.sim_type}
                  regionVersion={p.region_version}
                  hasVariants={p.has_variants || Boolean(p.variants && p.variants.length > 0)}
                  variantsCount={p.variants?.length || 0}
                  stockLeft={15}
                  rating="4.8"
                  reviewsCount={201}
                />
              );
            })}
          </div>

          {/* LOAD MORE BUTTON */}
          {visibleCount < featuredProducts.length && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <button
                onClick={() => setVisibleCount((prev) => prev + 24)}
                style={{
                  background: "#FFFFFF",
                  color: "#0D2B4D",
                  border: "1.5px solid #0D2B4D",
                  borderRadius: 999,
                  padding: "11px 28px",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(13, 43, 77, 0.08)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.2s ease",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <span>Charger plus de produits ({featuredProducts.length - visibleCount} restants)</span>
                <ArrowRight style={{ width: 14, height: 14, color: "#0D2B4D" }} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SPOTLIGHT BANNER 1: MAISON & ÉLECTROMÉNAGER FENOUHI                      */}
      {/* ========================================================================= */}
      <section style={{ padding: "8px 0 24px" }}>
        <div className="container">
          <Link
            href="/catalog?cat=home"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              alignItems: "center",
              background: "linear-gradient(135deg, #071C35 0%, #0D2B4D 55%, #153B64 100%)",
              borderRadius: 24,
              overflow: "hidden",
              textDecoration: "none",
              position: "relative",
              border: "1px solid rgba(124, 182, 217, 0.35)",
              boxShadow: "0 18px 40px rgba(13, 43, 77, 0.35)",
              padding: "24px 24px 20px",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124, 182, 217, 0.2)", border: "1px solid rgba(124, 182, 217, 0.4)", borderRadius: 999, padding: "4px 12px", color: "#7CB6D9", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                FENOUHI MAISON
              </div>
              <h3 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.25 }}>
                Électroménager & Décoration Intérieure
              </h3>
              <p style={{ fontSize: 12, color: "#CBD5E1", margin: "0 0 16px", lineHeight: 1.4 }}>
                Air fryers, blenders haute puissance, batteries de cuisine et linge de maison livrés à Cotonou.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", color: "#0D2B4D", padding: "9px 20px", borderRadius: 999, fontSize: 12.5, fontWeight: 900, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)" }}>
                <span>Explorer l'Univers Maison</span>
                <ArrowRight style={{ width: 13, height: 13, color: "#0D2B4D" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/images/banners/banner2.png"
                alt="Maison & Électroménager Fenouhi"
                style={{
                  maxHeight: 200,
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.5))",
                }}
              />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. OFFRES FLASH & DEALS DE LA SEMAINE                                    */}
      {/* ========================================================================= */}
      <section style={{ padding: "12px 0 24px" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Zap style={{ width: 18, height: 18, color: "#7CB6D9" }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E1B16", margin: 0, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                Ventes Flash du Jour
              </h2>
            </div>
            <Link href="/catalog?deals=true" style={{ fontSize: 12.5, fontWeight: 700, color: "#0D2B4D", textDecoration: "none" }}>
              Voir tout
            </Link>
          </div>

          <div
            className="product-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 14,
            }}
          >
            {(() => {
              const deletedIdsSet = new Set(getStoredDeletedProductIds());
              const customProducts = getStoredCustomProducts();
              const customMap = new Map(customProducts.map((p) => [p.id, p]));

              const visibleDeals = todayDeals
                .filter((d) => {
                  if (deletedIdsSet.has(d.id) || deletedIdsSet.has(`product-${d.id}`)) return false;
                  const custom = customMap.get(d.id) || customMap.get(`product-${d.id}`);
                  if (custom && custom.status && custom.status !== "active") return false;
                  return true;
                })
                .map((d) => {
                  const custom = customMap.get(d.id) || customMap.get(`product-${d.id}`);
                  if (custom) {
                    return {
                      ...d,
                      title: custom.name || d.title,
                      price: `${Number(custom.price).toLocaleString()} ${custom.currency || "FCFA"}`,
                      image: getProductImageUrl(custom),
                      category: custom.category?.name || d.category,
                      hasVariants: custom.has_variants || Boolean(custom.variants && custom.variants.length > 0),
                      variantsCount: custom.variants?.length || 0,
                    };
                  }
                  return d;
                });

              return visibleDeals.map((p: any) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  price={p.price}
                  oldPrice={p.oldPrice}
                  image={p.image}
                  category={p.category}
                  stockLeft={p.stockLeft}
                  rating={p.rating}
                  reviewsCount={p.reviewsCount}
                  hasVariants={p.hasVariants}
                  variantsCount={p.variantsCount}
                />
              ));
            })()}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SPOTLIGHT BANNER 2: BEAUTÉ & COSMÉTIQUES FENOUHI                         */}
      {/* ========================================================================= */}
      <section style={{ padding: "8px 0 24px" }}>
        <div className="container">
          <Link
            href="/catalog?cat=beauty"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              alignItems: "center",
              background: "linear-gradient(135deg, #071C35 0%, #153B64 55%, #0D2B4D 100%)",
              borderRadius: 24,
              overflow: "hidden",
              textDecoration: "none",
              position: "relative",
              border: "1px solid rgba(124, 182, 217, 0.35)",
              boxShadow: "0 18px 40px rgba(13, 43, 77, 0.35)",
              padding: "24px 24px 20px",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124, 182, 217, 0.2)", border: "1px solid rgba(124, 182, 217, 0.4)", borderRadius: 999, padding: "4px 12px", color: "#7CB6D9", fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                FENOUHI BEAUTÉ & SOINS
              </div>
              <h3 style={{ fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 800, color: "#FFFFFF", margin: "0 0 8px", lineHeight: 1.25 }}>
                Parfums, Soins & Maroquinerie de Luxe
              </h3>
              <p style={{ fontSize: 12, color: "#CBD5E1", margin: "0 0 16px", lineHeight: 1.4 }}>
                Sérum Fenouhi Radiance Essence, soins visage et maroquinerie tendance aux tarifs grossistes.
              </p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFFFFF", color: "#0D2B4D", padding: "9px 20px", borderRadius: 999, fontSize: 12.5, fontWeight: 900, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)" }}>
                <span>Découvrir l'Espace Beauté</span>
                <ArrowRight style={{ width: 13, height: 13, color: "#0D2B4D" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src="/images/banners/banner3.png"
                alt="Beauté & Cosmétiques Fenouhi"
                style={{
                  maxHeight: 200,
                  width: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.5))",
                }}
              />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CARGOLINK AI SOURCING HERO CARD                                        */}
      {/* ========================================================================= */}
      <section className="container" style={{ margin: "20px auto 40px" }}>
        <div className="cargolink-ai-card" style={{ background: "linear-gradient(135deg, #071C35 0%, #0D2B4D 55%, #14375F 100%)", borderRadius: 24, padding: "32px 24px", color: "#FFFFFF", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(124, 182, 217, 0.35)" }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(124, 182, 217, 0.18)", border: "1px solid rgba(124, 182, 217, 0.4)", borderRadius: 9999, padding: "5px 14px", color: "#7CB6D9", fontSize: 11, fontWeight: 800, letterSpacing: "0.5px", marginBottom: 14 }}>
            <Building2 style={{ width: 14 }} /> SOURCING DIRECT USINES CHINE
          </div>

          <h2 style={{ fontSize: "clamp(20px, 3.5vw, 32px)", fontWeight: 800, color: "#FFFFFF", marginBottom: 10, lineHeight: 1.2 }}>
            Trouvez N'importe Quel Produit Direct Usine
          </h2>
          <p style={{ fontSize: 13, color: "#CBD5E1", maxWidth: 600, margin: "0 auto 20px", lineHeight: 1.5 }}>
            Collez un lien produit ou décrivez votre besoin. Notre équipe logistique identifie les fournisseurs certifiés et calcule votre devis rendu Cotonou.
          </p>

          <div style={{ display: "flex", alignItems: "center", maxWidth: 540, margin: "0 auto", background: "#FFFFFF", borderRadius: 999, padding: "6px 8px 6px 18px", gap: 10, boxShadow: "0 8px 24px rgba(13, 43, 77, 0.2)" }}>
            <Search style={{ width: 18, color: "#0D2B4D" }} />
            <input
              type="text"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              placeholder="Collez un lien produit ou décrivez votre besoin..."
              style={{ width: "100%", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#1E1B16", background: "transparent" }}
            />
            <Link 
              href={`/quote-request?url=${encodeURIComponent(searchUrl)}`}
              style={{ borderRadius: 999, padding: "10px 20px", fontSize: 12.5, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6, background: "#0D2B4D", color: "#FFFFFF", border: "1px solid rgba(124, 182, 217, 0.4)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 4px 14px rgba(13, 43, 77, 0.35)" }}
            >
              Trouver <ArrowRight style={{ width: 14, color: "#7CB6D9" }} />
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
            <span style={{ fontSize: 11, color: "#7E7970", fontWeight: 700 }}>Exemples :</span>
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setSearchUrl(prompt)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 9999,
                  padding: "4px 10px",
                  color: "#CBD5E1",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
