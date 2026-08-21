"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getPublicProducts } from "@/lib/supabase/catalog";
import type { Product } from "@/types/catalog";
import { Building2, ArrowRight, ChevronLeft, ChevronRight, Search, Zap, DollarSign, Truck, Package, Plane, Ship } from "lucide-react";

const heroSlides = [
  {
    badge: "IMPORTATION DIRECTE CHINE",
    title: "iPhone 16 Pro Max",
    priceTag: "À partir de 295 000 FCFA*",
    subtitle: "Puce A18 Pro & Design Titane. Obtenez le nouvel iPhone au meilleur tarif usine avec livraison express à Cotonou.",
    btnText: "Commander l'iPhone",
    btnLink: "/catalog?q=iphone+16",
    imgSrc: "/images/assets/hero_iphone16.png",
    bgGradient: "linear-gradient(135deg, #130D2B 0%, #201740 50%, #0F172A 100%)"
  },
  {
    badge: "FRET & LIVRAISON BÉNIN",
    title: "Expédition Express Chine",
    priceTag: "Livraison Aérienne en 5 à 8 Jours",
    subtitle: "Sourcing direct usines à Canton & Yiwu. Dédouanement et suivi de colis sécurisés.",
    btnText: "Demander un Devis",
    btnLink: "/quote-request",
    imgSrc: "/images/assets/hero_box.png",
    bgGradient: "linear-gradient(135deg, #0A192F 0%, #0F3B5F 50%, #165491 100%)"
  },
  {
    badge: "VENTES FLASH DE LA SEMAINE",
    title: "Ventes Flash Électronique",
    priceTag: "Jusqu'à -50% de Réduction Directe",
    subtitle: "Smartphones, casques audio et gadgets certifiés en direct des plus grands fabricants.",
    btnText: "Découvrir les Offres",
    btnLink: "/catalog",
    imgSrc: "/images/assets/hero_samsung.png",
    bgGradient: "linear-gradient(135deg, #2D0B33 0%, #5B125E 50%, #0F172A 100%)"
  }
];

export default function HomePage() {
  const [searchUrl, setSearchUrl] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const categoryRowRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollNext = () => {
    if (categoryRowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryRowRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        categoryRowRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        categoryRowRef.current.scrollBy({ left: 280, behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const [featured, recent] = await Promise.all([
          getPublicProducts({ isFeatured: true, limit: 5 }),
          getPublicProducts({ limit: 10 })
        ]);
        setFeaturedProducts(featured);
        setRecentProducts(recent);
      } catch {}
    }
    loadHomeProducts();
  }, []);

  const softCategories = [
    { name: "Électronique", img: "/images/assets/cat_electronics_v2.jpg", link: "/catalog?cat=electronics" },
    { name: "Mode", img: "/images/assets/cat_fashion_v2.jpg", link: "/catalog?cat=fashion" },
    { name: "Luxe", img: "/images/assets/cat_luxury.jpg", link: "/catalog?cat=luxury" },
    { name: "Maison & Déco", img: "/images/assets/cat_homedecor.jpg", link: "/catalog?cat=home" },
    { name: "Santé & Beauté", img: "/images/assets/cat_beauty.jpg", link: "/catalog?cat=beauty" },
    { name: "Épicerie", img: "/images/assets/cat_groceries.jpg", link: "/catalog?cat=groceries" },
    { name: "Baskets & Sport", img: "/images/assets/cat_sneakers.jpg", link: "/catalog?cat=sneakers" },
  ];

  const todayDeals = [
    { id: "iphone-7-7plus", title: "iPhone 7 & 7 Plus Grossiste", price: "26 000 FCFA", oldPrice: "35 000 FCFA", image: "/images/assets/iphone7/iphone7_gold.png", category: "Téléphones" },
    { id: "iphone-8-8plus", title: "iPhone 8 & 8 Plus Grossiste", price: "33 000 FCFA", oldPrice: "45 000 FCFA", image: "/images/assets/card_hero_iphone.jpg", category: "Téléphones" },
    { id: "iphone-x-xr-xsmax", title: "iPhone X / XR / XS Max Grossiste", price: "46 000 FCFA", oldPrice: "65 000 FCFA", image: "/images/assets/card_hero_iphone.jpg", category: "Téléphones" },
    { id: "iphone-11-11pro-11promax", title: "iPhone 11 / 11 Pro / 11 Pro Max", price: "79 000 FCFA", oldPrice: "110 000 FCFA", image: "/images/assets/card_hero_iphone.jpg", category: "Téléphones" },
    { id: "iphone-12-12pro-12promax", title: "iPhone 12 / 12 Pro / 12 Pro Max", price: "98 000 FCFA", oldPrice: "135 000 FCFA", image: "/images/assets/card_hero_iphone.jpg", category: "Téléphones" },
  ];

  const laptopsShowcase = [
    { title: "iPhone 16 Pro Max", img: "/images/assets/hero_iphone16.png", link: "/product/iphone-16-16pro-16promax" },
    { title: "iPhone 15 Pro Max", img: "/images/assets/hero_iphone16.png", link: "/product/iphone-15-15pro-15promax" },
    { title: "iPhone 14 Pro Max", img: "/images/assets/hero_iphone16.png", link: "/product/iphone-14-14pro-14promax" },
    { title: "iPhone 13 Pro Max", img: "/images/assets/card_hero_iphone.jpg", link: "/product/iphone-13-13pro-13promax" },
    { title: "iPhone 12 Pro Max", img: "/images/assets/card_hero_iphone.jpg", link: "/product/iphone-12-12pro-12promax" },
  ];

  const samplePrompts = [
    "Lot 10x iPhone 11 Pro 256 Go Grade B",
    "Lot 5x iPhone 13 Pro 128 Go Reconditionné",
    "Lot 20x iPhone 8 64 Go Occasion Usine",
    "Lot iPhone 15 Pro Max 512 Go Scellé",
  ];

  const categoryPills = [
    { name: "Tous", cat: "" },
    { name: "Smartphones", cat: "telephonie" },
    { name: "Écouteurs", cat: "audio" },
    { name: "Laptops", cat: "informatique" },
    { name: "Montres", cat: "watches" },
    { name: "Mode", cat: "fashion" },
    { name: "Accessoires", cat: "accessories" },
  ];

  const [activeCategory, setActiveCategory] = useState("");

  return (
    <div style={{ background: "#FAF7F2", paddingBottom: 80, fontFamily: "var(--font-body), 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. TOP DISCOVER SECTION HEADER (SINGLE SEARCH BAR MANAGED BY MAIN HEADER) */}
      <section style={{ padding: "14px 0 10px", background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1
                style={{
                  fontSize: "clamp(20px, 3.5vw, 26px)",
                  fontWeight: 900,
                  color: "#0F172A",
                  margin: 0,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Découvrir
              </h1>
              <p style={{ fontSize: 12.5, color: "#64748B", margin: "2px 0 0" }}>
                Produits certifiés direct usines & iPhones authentiques
              </p>
            </div>

            <Link
              href="/catalog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 9999,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 800,
                color: "#165491",
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>Voir tout →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC HERO PROMO SLIDER CAROUSEL (AUTOMATIC & MANUAL OFFERS) */}
      <section style={{ padding: "18px 0 20px" }}>
        <div className="container">
          {(() => {
            const activeSlide = heroSlides[currentSlide] || heroSlides[0];
            return (
              <div
                style={{
                  background: activeSlide.bgGradient || "linear-gradient(135deg, #0F172A 0%, #165491 60%, #1E293B 100%)",
                  borderRadius: 24,
                  padding: "24px 28px 36px",
                  color: "#FFFFFF",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(22, 84, 145, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 190,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "background 0.5s ease",
                }}
              >
                {/* LEFT TEXT CONTENT */}
                <div style={{ zIndex: 2, maxWidth: "55%", minWidth: 200 }}>
                  <h2
                    style={{
                      fontSize: "clamp(22px, 4vw, 32px)",
                      fontWeight: 900,
                      margin: "0 0 6px",
                      lineHeight: 1.1,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#FFFFFF",
                    }}
                  >
                    {activeSlide.title}
                  </h2>

                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "#E8890C",
                      color: "#FFFFFF",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 900,
                      marginBottom: 12,
                      boxShadow: "0 4px 12px rgba(232, 137, 12, 0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{activeSlide.badge || activeSlide.priceTag}</span>
                  </div>

                  <p style={{ fontSize: 12.5, color: "#CBD5E1", margin: "0 0 16px", lineHeight: 1.4 }}>
                    {activeSlide.subtitle}
                  </p>

                  <Link
                    href={activeSlide.btnLink || "/catalog"}
                    style={{
                      background: "#FFFFFF",
                      color: "#0F172A",
                      padding: "10px 22px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>{activeSlide.btnText || "Explorer les Offres"}</span>
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>

                {/* RIGHT HERO IMAGE */}
                <div
                  style={{
                    width: "42%",
                    height: "100%",
                    position: "absolute",
                    right: 10,
                    top: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <img
                    src={activeSlide.imgSrc}
                    alt={activeSlide.title}
                    style={{
                      maxHeight: "135%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
                      transition: "transform 0.4s ease",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/assets/hero_iphone16.png";
                    }}
                  />
                </div>

                {/* SLIDE NAVIGATION ARROWS & DOTS */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 28,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    zIndex: 10,
                  }}
                >
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      style={{
                        width: currentSlide === idx ? 20 : 7,
                        height: 7,
                        borderRadius: 999,
                        background: currentSlide === idx ? "#E8890C" : "rgba(255, 255, 255, 0.35)",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all 0.25s ease",
                      }}
                      aria-label={`Offre ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 3. CATEGORIES HORIZONTAL PILLS ROW (MATCHING FENOUHIMIN BRAND PALETTE) */}
      <section style={{ padding: "8px 0 16px" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Catégories
            </h3>
            <Link href="/catalog" style={{ fontSize: 12.5, fontWeight: 700, color: "#165491", textDecoration: "none" }}>
              Voir tout
            </Link>
          </div>

          {/* HORIZONTAL SCROLL PILLS */}
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
            {categoryPills.map((pill) => {
              const isSelected = activeCategory === pill.cat;
              return (
                <button
                  key={pill.name}
                  onClick={() => setActiveCategory(pill.cat)}
                  style={{
                    background: isSelected ? "#165491" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#475569",
                    border: isSelected ? "1px solid #165491" : "1px solid #E2E8F0",
                    borderRadius: 999,
                    padding: "8px 18px",
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected
                      ? "0 4px 12px rgba(22, 84, 145, 0.25)"
                      : "0 1px 3px rgba(15, 23, 42, 0.03)",
                    transition: "all 0.18s ease",
                  }}
                >
                  {pill.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CARDS GRID (EXACT 2-COLUMN MOBILE GRID MATCHING SCREENSHOT) */}
      <section style={{ padding: "12px 0 32px" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#0F172A", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Sélection Produits & Nouveautés
            </h3>
            <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
              {recentProducts.length} articles disponibles
            </span>
          </div>

          <div
            className="product-grid-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 16,
            }}
          >
            {recentProducts.map((p) => {
              const img = p.images?.[0]?.public_image_url || "/images/assets/item_1.jpg";
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  image={img}
                  category={p.category?.name || "Téléphonie"}
                  isDemo={p.is_demo}
                  conditionState={p.condition_state}
                  grade={p.grade}
                  simType={p.sim_type}
                  regionVersion={p.region_version}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* TODAY'S BEST DEALS FOR YOU SECTION */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Les Meilleures Offres du Jour pour Vous !
            </h2>
            <Link href="/catalog" style={{ fontSize: 13, fontWeight: 700, color: "#165491", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
              <span>Voir Tout</span>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div className="grid-5">
            {todayDeals.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                title={p.title}
                price={p.price}
                oldPrice={p.oldPrice}
                image={p.image}
                category={p.category}
              />
            ))}
          </div>

        </div>
      </section>

      {/* STYLE & FASHION SECTION */}
      <section style={{ padding: "20px 0 30px" }}>
        <div className="container">
          <div className="section-title-row">
            <h2 className="section-title">Sélection Catalogue Produits</h2>
            <Link href="/catalog" className="view-all-link">
              <span>Tout le catalogue</span>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          <div className="grid-5">
            {recentProducts.slice(5, 10).map((p) => {
              const img = p.images?.[0]?.public_image_url || "/images/assets/item_1.jpg";
              return (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.name}
                  price={`${p.price.toLocaleString()} ${p.currency}`}
                  image={img}
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
        </div>
      </section>

      {/* ELECTRONICS SHOWCASE BANNER CONTAINER */}
      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div style={{ background: "#F1F5F9", borderRadius: 24, padding: "28px 24px", border: "1px solid #E2E8F0" }}>
            <div className="section-title-row" style={{ marginBottom: 20 }}>
              <h2 className="section-title" style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "#0F172A" }}>
                High-Tech & Electronics Usines
              </h2>
              <Link href="/catalog?cat=electronics" className="view-all-link">
                <span>Voir tout</span>
                <ChevronRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>

            <div className="grid-5">
              {laptopsShowcase.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.link}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: 180,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                >
                  <div style={{ height: 110, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.img} alt={item.title} style={{ maxHeight: 95, maxWidth: "100%", objectFit: "contain" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginTop: 10, textAlign: "center" }}>{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CARGOLINK AI SOURCING HERO CARD (FULLY RESPONSIVE DESIGN) */}
      <section className="container" style={{ margin: "30px auto 50px" }}>
        <div className="cargolink-ai-card">
          
          {/* AMBIENT GLOW EFFECTS */}
          <div style={{ position: "absolute", top: -80, left: "30%", width: 300, height: 300, background: "rgba(56, 189, 248, 0.15)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "20%", width: 260, height: 260, background: "rgba(249, 115, 22, 0.12)", filter: "blur(90px)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* SOURCING BADGE */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: 9999, padding: "6px 14px", color: "#38BDF8", fontSize: 11.5, fontWeight: 900, letterSpacing: "0.5px", marginBottom: 16, maxWidth: "100%", boxSizing: "border-box" }}>
            <Building2 style={{ width: 14, flexShrink: 0 }} /> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>SOURCING DIRECT USINES CHINE • BÉNIN BJ</span>
          </div>

          {/* HEADLINE */}
          <h2 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, color: "#FFFFFF", marginBottom: 12, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
            Trouvez N'importe Quel Produit Direct Usine
          </h2>
          <p style={{ fontSize: 13.5, color: "#94A3B8", maxWidth: 640, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Collez un lien produit ou décrivez votre besoin. Notre équipe logistique identifie les fournisseurs usines certifiés au meilleur prix et calcule votre devis rendu Cotonou.
          </p>

          {/* FLOATING SEARCH INPUT BAR (RESPONSIVE STACK ON MOBILE) */}
          <div className="cargolink-ai-search-box">
            <div className="cargolink-ai-search-box-input-wrap" style={{ display: "flex", alignItems: "center", flex: 1, gap: 8, paddingLeft: 8 }}>
              <span style={{ color: "#165491", display: "flex", alignItems: "center" }}>
                <Search style={{ width: 18 }} />
              </span>
              <input
                type="text"
                value={searchUrl}
                onChange={(e) => setSearchUrl(e.target.value)}
                placeholder="Collez un lien produit ou décrivez votre besoin..."
                style={{ width: "100%", border: "none", outline: "none", fontSize: 13.5, fontWeight: 600, color: "#0F172A", background: "transparent" }}
              />
            </div>
            <Link 
              href={`/quote-request?url=${encodeURIComponent(searchUrl)}`}
              className="btn btn-orange cargolink-ai-search-btn"
              style={{ borderRadius: 9999, padding: "12px 24px", fontSize: 13.5, fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)", boxShadow: "0 6px 20px rgba(249,115,22,0.35)", whiteSpace: "nowrap" }}
            >
              <Search style={{ width: 16 }} /> Trouver l'Usine <ArrowRight style={{ width: 16 }} />
            </Link>
          </div>

          {/* SAMPLE SUGGESTION CHIPS */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", marginTop: 18 }}>
            <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700, width: "100%", marginBottom: 4 }}>Exemples :</span>
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
                  transition: "all 0.2s ease"
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* 3 REASSURANCE FEATURE PILLS (RESPONSIVE 1-COLUMN ON MOBILE) */}
          <div className="cargolink-ai-features-grid">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <Zap style={{ width: 15, color: "#38BDF8", flexShrink: 0 }} /> Scan Instantané Usines
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <DollarSign style={{ width: 15, color: "#10B981", flexShrink: 0 }} /> Prix Usine Direct
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#E2E8F0", fontSize: 12, fontWeight: 700 }}>
              <Truck style={{ width: 15, color: "#F97316", flexShrink: 0 }} /> Fret & Dédouanement Afrique
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
